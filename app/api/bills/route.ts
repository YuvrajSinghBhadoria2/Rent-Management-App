import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

const billSchema = z.object({
    tenantId: z.string().min(1),
    month: z.string().min(1), // e.g., "March"
    year: z.number().int().min(2020),
    baseRent: z.number().min(0),
    otherCharges: z.number().min(0).default(0),
    dueDate: z.string().min(1), // ISO date
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
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const buildingId = searchParams.get('buildingId');
    const status = searchParams.get('status');

    try {
        let query: any = adminDb.collection('bills');

        if (user.role === 'owner') {
            query = query.where('ownerId', '==', user.uid);
            if (tenantId) query = query.where('tenantId', '==', tenantId);
            if (buildingId) query = query.where('buildingId', '==', buildingId);
        } else {
            // Tenants can only see their own bills
            query = query.where('tenantId', '==', user.uid);
        }

        if (status) {
            query = query.where('status', '==', status);
        }

        const billsSnap = await query.orderBy('createdAt', 'desc').get();
        const bills = billsSnap.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return NextResponse.json({ success: true, data: bills });
    } catch (error) {
        console.error('Error fetching bills:', error);
        return NextResponse.json({ error: 'Failed to fetch bills' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'owner') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const validated = billSchema.parse(body);

        // Fetch tenant and lease info
        const tenantDoc = await adminDb.collection('tenants').doc(validated.tenantId).get();
        if (!tenantDoc.exists || tenantDoc.data()?.ownerId !== user.uid) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }

        const tenantData = tenantDoc.data();
        if (!tenantData?.currentLeaseId) {
            return NextResponse.json({ error: 'Tenant has no active lease' }, { status: 400 });
        }

        // Check if bill already exists for this month/year
        const existingBill = await adminDb.collection('bills')
            .where('tenantId', '==', validated.tenantId)
            .where('month', '==', validated.month)
            .where('year', '==', validated.year)
            .limit(1)
            .get();

        if (!existingBill.empty) {
            return NextResponse.json({ error: 'Bill already exists for this period' }, { status: 400 });
        }

        const totalAmount = validated.baseRent + validated.otherCharges;

        const billData = {
            ...validated,
            ownerId: user.uid,
            buildingId: tenantData.currentBuildingId,
            roomId: tenantData.currentRoomId,
            bedId: tenantData.currentBedId || null,
            lateFee: 0,
            totalAmount,
            status: 'pending',
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        };

        const billRef = await adminDb.collection('bills').add(billData);

        return NextResponse.json({ success: true, data: { id: billRef.id } }, { status: 201 });
    } catch (error) {
        console.error('Error creating bill:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create bill' }, { status: 500 });
    }
}
