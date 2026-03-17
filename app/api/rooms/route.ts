import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

const roomSchema = z.object({
    buildingId: z.string().min(1, 'Building ID is required'),
    number: z.string().min(1, 'Room number is required'),
    name: z.string().nullable().optional(),
    floor: z.coerce.number().min(0),
    type: z.enum(['single', 'double', 'dormitory', 'studio']),
    status: z.enum(['vacant', 'occupied', 'notice_period', 'under_renovation']).default('vacant'),
    condition: z.enum(['good', 'needs_repair', 'under_renovation']).default('good'),
    monthlyRent: z.coerce.number().min(0),
    amenities: z.object({
        ac: z.boolean().default(false),
        wifi: z.boolean().default(false),
        attachedBath: z.boolean().default(false),
        geyser: z.boolean().default(false),
        parking: z.boolean().default(false),
        tv: z.boolean().default(false),
        fridge: z.boolean().default(false),
        washingMachine: z.boolean().default(false),
    }),
    beds: z.array(z.string()).optional(), // Only for PG/Hostel
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

export async function GET(request: NextRequest) {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'owner') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const buildingId = request.nextUrl.searchParams.get('buildingId');
    if (!buildingId) {
        return NextResponse.json({ error: 'Building ID is required' }, { status: 400 });
    }

    try {
        // Verify ownership of building
        const buildingDoc = await adminDb.collection('buildings').doc(buildingId).get();
        if (!buildingDoc.exists || buildingDoc.data()?.ownerId !== user.uid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const roomsSnap = await adminDb
            .collection('buildings')
            .doc(buildingId)
            .collection('rooms')
            .orderBy('number', 'asc')
            .get();

        const rooms = await Promise.all(roomsSnap.docs.map(async (doc) => {
            const roomData = doc.data();
            let beds = [];

            // If PG, fetch beds
            if (buildingDoc.data()?.type === 'pg_hostel') {
                const bedsSnap = await doc.ref.collection('beds').get();
                beds = bedsSnap.docs.map(bedDoc => ({ id: bedDoc.id, ...bedDoc.data() }));
            }

            return {
                id: doc.id,
                ...roomData,
                beds
            };
        }));

        return NextResponse.json({ success: true, data: rooms });
    } catch (error) {
        console.error('Error fetching rooms:', error);
        return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'owner') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const validated = roomSchema.parse(body);

        // Verify ownership
        const buildingRef = adminDb.collection('buildings').doc(validated.buildingId);
        const buildingDoc = await buildingRef.get();
        if (!buildingDoc.exists || buildingDoc.data()?.ownerId !== user.uid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const roomData = {
            ...validated,
            photoUrls: [],
            expectedVacantOn: null,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        };

        // Remove 'beds' from room doc itself as they go in subcollection
        const beds = validated.beds;
        delete (roomData as any).beds;

        const roomRef = await buildingRef.collection('rooms').add(roomData);

        // If PG building, add beds to subcollection
        if (buildingDoc.data()?.type === 'pg_hostel' && beds && beds.length > 0) {
            const batch = adminDb.batch();
            beds.forEach((bedNumber) => {
                const bedRef = roomRef.collection('beds').doc();
                batch.set(bedRef, {
                    bedNumber,
                    status: 'vacant',
                    roomId: roomRef.id,
                    createdAt: FieldValue.serverTimestamp(),
                });
            });
            await batch.commit();
        }

        return NextResponse.json({
            success: true,
            data: { id: roomRef.id }
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating room:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
    }
}
