import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

const buildingUpdateSchema = z.object({
    name: z.string().min(1).optional(),
    address: z.string().min(1).optional(),
    type: z.enum(['residential', 'pg_hostel']).optional(),
    dueDateDay: z.number().min(1).max(28).optional(),
    penaltyConfig: z.object({
        gracePeriodDays: z.number(),
        type: z.enum(['flat', 'percent']),
        amount: z.number(),
        dailyAccrual: z.boolean(),
        maxPenalty: z.number(),
        applyOnTotal: z.boolean(),
    }).optional(),
    totalFloors: z.number().optional(),
    photoUrl: z.string().nullable().optional(),
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

    try {
        const buildingDoc = await adminDb.collection('buildings').doc(params.id).get();

        if (!buildingDoc.exists) {
            return NextResponse.json({ error: 'Building not found' }, { status: 404 });
        }

        const buildingData = buildingDoc.data();
        if (buildingData?.ownerId !== user.uid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        return NextResponse.json({
            success: true,
            data: { id: buildingDoc.id, ...buildingData }
        });
    } catch (error) {
        console.error('Error fetching building:', error);
        return NextResponse.json({ error: 'Failed to fetch building' }, { status: 500 });
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
        const validated = buildingUpdateSchema.parse(body);

        const buildingRef = adminDb.collection('buildings').doc(params.id);
        const buildingDoc = await buildingRef.get();

        if (!buildingDoc.exists) {
            return NextResponse.json({ error: 'Building not found' }, { status: 404 });
        }

        if (buildingDoc.data()?.ownerId !== user.uid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await buildingRef.update({
            ...validated,
            updatedAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating building:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to update building' }, { status: 500 });
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

    try {
        const buildingRef = adminDb.collection('buildings').doc(params.id);
        const buildingDoc = await buildingRef.get();

        if (!buildingDoc.exists) {
            return NextResponse.json({ error: 'Building not found' }, { status: 404 });
        }

        if (buildingDoc.data()?.ownerId !== user.uid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Soft delete
        await buildingRef.update({
            isActive: false,
            updatedAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting building:', error);
        return NextResponse.json({ error: 'Failed to delete building' }, { status: 500 });
    }
}
