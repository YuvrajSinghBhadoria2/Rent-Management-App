import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

const leaseSchema = z.object({
    tenantId: z.string().min(1, 'Tenant ID is required'),
    buildingId: z.string().min(1, 'Building ID is required'),
    roomId: z.string().min(1, 'Room ID is required'),
    bedId: z.string().nullable().optional(), // For PG
    startDate: z.string().min(1, 'Start date is required'),
    durationMonths: z.coerce.number().min(1, 'Minimum 1 month'),
    rentAmount: z.coerce.number().min(0),
    securityDeposit: z.coerce.number().min(0),
});

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

export async function POST(request: NextRequest) {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'owner') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const validated = leaseSchema.parse(body);

        const { tenantId, buildingId, roomId, bedId } = validated;

        // Verify ownership and existence via a Transaction for atomicity
        const result = await adminDb.runTransaction(async (transaction) => {
            const tenantRef = adminDb.collection('tenants').doc(tenantId);
            const buildingRef = adminDb.collection('buildings').doc(buildingId);
            const roomRef = buildingRef.collection('rooms').doc(roomId);

            const [tenantDoc, buildingDoc, roomDoc] = await Promise.all([
                transaction.get(tenantRef),
                transaction.get(buildingRef),
                transaction.get(roomRef)
            ]);

            if (!tenantDoc.exists || tenantDoc.data()?.ownerId !== user.uid) {
                throw new Error('Tenant not found or unauthorized');
            }
            if (!buildingDoc.exists || buildingDoc.data()?.ownerId !== user.uid) {
                throw new Error('Building not found or unauthorized');
            }
            if (!roomDoc.exists) {
                throw new Error('Room not found');
            }

            // Check if room/bed is already occupied
            if (buildingDoc.data()?.type !== 'pg_hostel') {
                if (roomDoc.data()?.status === 'occupied') {
                    throw new Error('Room is already occupied');
                }
            } else if (bedId) {
                const bedRef = roomRef.collection('beds').doc(bedId);
                const bedDoc = await transaction.get(bedRef);
                if (!bedDoc.exists) throw new Error('Bed not found');
                if (bedDoc.data()?.status === 'occupied') {
                    throw new Error('Bed is already occupied');
                }
            } else {
                throw new Error('Bed ID is required for PG properties');
            }

            // 1. Create Lease
            const leaseRef = adminDb.collection('leases').doc();
            const leaseData = {
                ...validated,
                ownerId: user.uid,
                status: 'active',
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
            };
            transaction.set(leaseRef, leaseData);

            // 2. Update Tenant
            transaction.update(tenantRef, {
                currentLeaseId: leaseRef.id,
                currentBuildingId: buildingId,
                currentRoomId: roomId,
                currentBedId: bedId || null,
                updatedAt: FieldValue.serverTimestamp(),
            });

            // 3. Update Room/Bed Status
            if (buildingDoc.data()?.type !== 'pg_hostel') {
                transaction.update(roomRef, {
                    status: 'occupied',
                    updatedAt: FieldValue.serverTimestamp(),
                });
            } else if (bedId) {
                const bedRef = roomRef.collection('beds').doc(bedId);
                transaction.update(bedRef, {
                    status: 'occupied',
                    updatedAt: FieldValue.serverTimestamp(),
                });

                // Check if room is now full (optional logic, but let's keep it simple for now)
            }

            return { leaseId: leaseRef.id };
        });

        return NextResponse.json({
            success: true,
            data: result
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating lease:', error);
        return NextResponse.json({ error: error.message || 'Failed to create lease' }, { status: 400 });
    }
}
