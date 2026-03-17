import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

const roomUpdateSchema = z.object({
    buildingId: z.string().min(1),
    number: z.string().min(1).optional(),
    name: z.string().nullable().optional(),
    floor: z.coerce.number().min(0).optional(),
    type: z.enum(['single', 'double', 'dormitory', 'studio']).optional(),
    status: z.enum(['vacant', 'occupied', 'notice_period', 'under_renovation']).optional(),
    condition: z.enum(['good', 'needs_repair', 'under_renovation']).optional(),
    monthlyRent: z.coerce.number().min(0).optional(),
    amenities: z.object({
        ac: z.boolean(),
        wifi: z.boolean(),
        attachedBath: z.boolean(),
        geyser: z.boolean(),
        parking: z.boolean(),
        tv: z.boolean(),
        fridge: z.boolean(),
        washingMachine: z.boolean(),
    }).optional(),
    expectedVacantOn: z.any().nullable().optional(),
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

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'owner') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const buildingId = request.nextUrl.searchParams.get('buildingId');
    if (!buildingId) {
        return NextResponse.json({ error: 'Building ID is required' }, { status: 400 });
    }

    try {
        const buildingRef = adminDb.collection('buildings').doc(buildingId);
        const buildingDoc = await buildingRef.get();

        if (!buildingDoc.exists || buildingDoc.data()?.ownerId !== user.uid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const roomDoc = await buildingRef.collection('rooms').doc(params.id).get();

        if (!roomDoc.exists) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }

        let beds = [];
        if (buildingDoc.data()?.type === 'pg_hostel') {
            const bedsSnap = await roomDoc.ref.collection('beds').get();
            beds = bedsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }

        return NextResponse.json({
            success: true,
            data: { id: roomDoc.id, ...roomDoc.data(), beds }
        });
    } catch (error) {
        console.error('Error fetching room:', error);
        return NextResponse.json({ error: 'Failed to fetch room' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'owner') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { buildingId, ...updateData } = roomUpdateSchema.parse(body);

        const buildingRef = adminDb.collection('buildings').doc(buildingId);
        const buildingDoc = await buildingRef.get();

        if (!buildingDoc.exists || buildingDoc.data()?.ownerId !== user.uid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const roomRef = buildingRef.collection('rooms').doc(params.id);
        await roomRef.update({
            ...updateData,
            updatedAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating room:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to update room' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'owner') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const buildingId = request.nextUrl.searchParams.get('buildingId');
    if (!buildingId) {
        return NextResponse.json({ error: 'Building ID is required' }, { status: 400 });
    }

    try {
        const buildingRef = adminDb.collection('buildings').doc(buildingId);
        const buildingDoc = await buildingRef.get();

        if (!buildingDoc.exists || buildingDoc.data()?.ownerId !== user.uid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await buildingRef.collection('rooms').doc(params.id).delete();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting room:', error);
        return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 });
    }
}
