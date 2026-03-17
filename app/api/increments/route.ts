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

export async function POST(request: NextRequest) {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'owner') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { leaseId, effectiveDate, newAmount } = await request.json();

        if (!leaseId || !effectiveDate || !newAmount) {
            return NextResponse.json({ error: 'Missing increment details' }, { status: 400 });
        }

        // 1. Fetch Lease
        const leaseDoc = await adminDb.collection('leases').doc(leaseId).get();
        if (!leaseDoc.exists) {
            return NextResponse.json({ error: 'Lease not found' }, { status: 404 });
        }
        const lease = leaseDoc.data()!;

        // 2. Schedule Increment
        const incrementRef = await adminDb.collection('rentIncrements').add({
            leaseId,
            tenantId: lease.tenantId,
            tenantName: lease.tenantName,
            ownerId: user.uid,
            effectiveDate: new Date(effectiveDate),
            newAmount: Number(newAmount),
            previousAmount: lease.rentAmount,
            isApplied: false,
            appliedAt: null,
            createdAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ success: true, data: { id: incrementRef.id } });
    } catch (error: any) {
        console.error('Rent Increment Error:', error);
        return NextResponse.json({ error: 'Failed to schedule rent increment' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'owner') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const incrementsSnap = await adminDb.collection('rentIncrements')
            .where('ownerId', '==', user.uid)
            .orderBy('effectiveDate', 'asc')
            .get();

        const increments = incrementsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            effectiveDate: doc.data().effectiveDate.toDate().toISOString(),
        }));

        return NextResponse.json({ success: true, data: increments });
    } catch (error: any) {
        console.error('Fetch Increments Error:', error);
        return NextResponse.json({ error: 'Failed to fetch rent increments' }, { status: 500 });
    }
}
