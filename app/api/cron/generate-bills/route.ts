import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(request: NextRequest) {
    // CRON Security: In production, check for a secret header or IP restriction
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return new Response('Unauthorized', { status: 401 });
    // }

    try {
        const buildingsSnap = await adminDb.collection('buildings').where('isActive', '==', true).get();
        const now = new Date();
        const currentMonth = now.toLocaleString('default', { month: 'long' });
        const currentYear = now.getFullYear();
        const dayOfMonth = now.getDate();

        const stats = {
            billsGenerated: 0,
            penaltiesUpdated: 0,
            errors: 0
        };

        for (const buildingDoc of buildingsSnap.docs) {
            const building = buildingDoc.data();
            const buildingId = buildingDoc.id;

            // 1. BILL GENERATION 
            // We'll generate bills on the 1st of every month
            if (dayOfMonth === 1) {
                const tenantsSnap = await adminDb.collection('tenants')
                    .where('currentBuildingId', '==', buildingId)
                    .where('isActive', '==', true)
                    .get();

                for (const tenantDoc of tenantsSnap.docs) {
                    const tenant = tenantDoc.data();
                    const tenantId = tenantDoc.id;

                    // Check if bill already exists for this period
                    const existingBill = await adminDb.collection('bills')
                        .where('tenantId', '==', tenantId)
                        .where('month', '==', currentMonth)
                        .where('year', '==', currentYear)
                        .limit(1)
                        .get();

                    if (existingBill.empty && tenant.currentLeaseId) {
                        // Fetch lease to get rent amount
                        const leaseDoc = await adminDb.collection('leases').doc(tenant.currentLeaseId).get();
                        if (leaseDoc.exists) {
                            const lease = leaseDoc.data();
                            const baseRent = lease?.rentAmount || 0;

                            // Set due date for this month
                            const dueDate = new Date(currentYear, now.getMonth(), building.dueDateDay || 5);

                            await adminDb.collection('bills').add({
                                tenantId,
                                ownerId: building.ownerId,
                                buildingId,
                                roomId: tenant.currentRoomId,
                                bedId: tenant.currentBedId || null,
                                month: currentMonth,
                                year: currentYear,
                                baseRent,
                                otherCharges: 0,
                                lateFee: 0,
                                totalAmount: baseRent,
                                status: 'pending',
                                dueDate: dueDate.toISOString().split('T')[0],
                                createdAt: FieldValue.serverTimestamp(),
                                updatedAt: FieldValue.serverTimestamp(),
                            });
                            stats.billsGenerated++;
                        }
                    }
                }
            }

            // 2. LATE FEE CALCULATIONS
            // Run daily to check for overdue bills and apply penalties
            const pendingBillsSnap = await adminDb.collection('bills')
                .where('ownerId', '==', building.ownerId)
                .where('buildingId', '==', buildingId)
                .where('status', 'in', ['pending', 'overdue'])
                .get();

            for (const billDoc of pendingBillsSnap.docs) {
                const bill = billDoc.data();
                const dueDate = new Date(bill.dueDate);
                const gracePeriodDate = new Date(dueDate);
                gracePeriodDate.setDate(dueDate.getDate() + (building.penaltyConfig?.gracePeriodDays || 0));

                if (now > gracePeriodDate) {
                    // Calculate Penalty
                    let newLateFee = 0;
                    const { lateFeeType, lateFeeAmount, isDailyPenalty } = building.penaltyConfig || {};

                    if (lateFeeType === 'fixed') {
                        if (isDailyPenalty) {
                            const diffDays = Math.floor((now.getTime() - gracePeriodDate.getTime()) / (1000 * 60 * 60 * 24));
                            newLateFee = (diffDays + 1) * lateFeeAmount;
                        } else {
                            newLateFee = lateFeeAmount;
                        }
                    } else if (lateFeeType === 'percentage') {
                        const percentageFee = (bill.baseRent * lateFeeAmount) / 100;
                        if (isDailyPenalty) {
                            const diffDays = Math.floor((now.getTime() - gracePeriodDate.getTime()) / (1000 * 60 * 60 * 24));
                            newLateFee = (diffDays + 1) * percentageFee;
                        } else {
                            newLateFee = percentageFee;
                        }
                    }

                    if (newLateFee !== bill.lateFee) {
                        await billDoc.ref.update({
                            lateFee: newLateFee,
                            totalAmount: bill.baseRent + bill.otherCharges + newLateFee,
                            status: 'overdue',
                            updatedAt: FieldValue.serverTimestamp()
                        });
                        stats.penaltiesUpdated++;
                    }
                }
            }
        }

        return NextResponse.json({ success: true, stats });
    } catch (error) {
        console.error('Error in generate-bills cron:', error);
        return NextResponse.json({ error: 'Failed to run billing cron' }, { status: 500 });
    }
}
