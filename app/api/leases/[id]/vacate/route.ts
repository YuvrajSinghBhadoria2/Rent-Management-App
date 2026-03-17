import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

async function getAuthUser(request: NextRequest) {
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) return null;
    try {
        const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
        return decodedToken;
    } catch (error) {
        return null;
    }
}

// POST: Tenant requests to vacate
export async function POST(request: NextRequest) {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'tenant') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { vacateDate, reason } = await request.json();

        const tenantDoc = await adminDb.collection('tenants').doc(user.uid).get();
        const tenant = tenantDoc.data()!;

        if (!tenant.currentLeaseId) {
            return NextResponse.json({ error: 'No active lease found' }, { status: 400 });
        }

        await adminDb.collection('leases').doc(tenant.currentLeaseId).update({
            vacateStatus: 'requested',
            vacateDate: new Date(vacateDate),
            vacateReason: reason,
            updatedAt: FieldValue.serverTimestamp(),
        });

        // Notify Owner
        await adminDb.collection('notifications').add({
            userId: tenant.ownerId,
            type: 'vacate_request',
            title: 'New Vacate Request',
            message: `${tenant.name} from Room ${tenant.roomNumber} has requested to vacate on ${new Date(vacateDate).toLocaleDateString()}`,
            isRead: false,
            link: `/tenants/${user.uid}`,
            createdAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to submit vacate request' }, { status: 500 });
    }
}

// PATCH: Owner processes vacate (calculates refund)
export async function PATCH(request: NextRequest) {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'owner') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { leaseId, status, deductions, refundAmount } = await request.json();

        const leaseRef = adminDb.collection('leases').doc(leaseId);
        const leaseDoc = await leaseRef.get();
        const lease = leaseDoc.data()!;

        if (status === 'approved') {
            // 1. Update Lease
            await leaseRef.update({
                status: 'terminated',
                vacateStatus: 'approved',
                securityDepositRefunded: Number(refundAmount),
                vacateDeductions: deductions, // Array of { reason, amount }
                updatedAt: FieldValue.serverTimestamp(),
            });

            // 2. Clear Tenant status
            await adminDb.collection('tenants').doc(lease.tenantId).update({
                currentBuildingId: null,
                currentRoomId: null,
                currentLeaseId: null,
                leaseStatus: 'inactive',
            });

            // 3. Mark Room as available
            const buildingDoc = await adminDb.collection('buildings').doc(lease.buildingId).get();
            const building = buildingDoc.data()!;

            if (building.type === 'pg_hostel' && lease.bedId) {
                await adminDb.collection('buildings').doc(lease.buildingId)
                    .collection('rooms').doc(lease.roomId)
                    .collection('beds').doc(lease.bedId).update({
                        status: 'vacant',
                        updatedAt: FieldValue.serverTimestamp(),
                    });
            } else {
                await adminDb.collection('buildings').doc(lease.buildingId)
                    .collection('rooms').doc(lease.roomId).update({
                        status: 'available',
                        currentTenantId: null,
                        updatedAt: FieldValue.serverTimestamp(),
                    });
            }

            // 4. Record refund as a payment (negative/outbound)
            await adminDb.collection('payments').add({
                leaseId,
                tenantId: lease.tenantId,
                ownerId: user.uid,
                amount: -Number(refundAmount),
                method: 'refund',
                status: 'success',
                type: 'deposit_refund',
                createdAt: FieldValue.serverTimestamp(),
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to process vacate' }, { status: 500 });
    }
}
