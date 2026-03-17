import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

const buildingSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    address: z.string().min(1, 'Address is required'),
    type: z.enum(['residential', 'pg_hostel']),
    dueDateDay: z.number().min(1).max(28).default(5),
    penaltyConfig: z.object({
        gracePeriodDays: z.number().default(3),
        type: z.enum(['flat', 'percent']).default('flat'),
        amount: z.number().default(0),
        dailyAccrual: z.boolean().default(false),
        maxPenalty: z.number().default(0),
        applyOnTotal: z.boolean().default(false),
    }),
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

    try {
        const buildingsSnap = await adminDb
            .collection('buildings')
            .where('ownerId', '==', user.uid)
            .where('isActive', '==', true)
            .orderBy('createdAt', 'desc')
            .get();

        const buildings = buildingsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return NextResponse.json({ success: true, data: buildings });
    } catch (error) {
        console.error('Error fetching buildings:', error);
        return NextResponse.json({ error: 'Failed to fetch buildings' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'owner') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const validated = buildingSchema.parse(body);

        const buildingRef = await adminDb.collection('buildings').add({
            ...validated,
            ownerId: user.uid,
            photoUrl: null,
            totalFloors: body.totalFloors || 1,
            isActive: true,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({
            success: true,
            data: { id: buildingRef.id }
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating building:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create building' }, { status: 500 });
    }
}
