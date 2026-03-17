import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { createOrder } from '@/lib/payments';
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
    if (!user || user.role !== 'tenant') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { billId, gateway } = await request.json();

        if (!billId || !gateway) {
            return NextResponse.json({ error: 'Bill ID and Gateway are required' }, { status: 400 });
        }

        // 1. Fetch bill
        const billDoc = await adminDb.collection('bills').doc(billId).get();
        if (!billDoc.exists) {
            return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
        }

        const bill = billDoc.data()!;
        if (bill.tenantId !== user.uid) {
            return NextResponse.json({ error: 'You do not have access to this bill' }, { status: 403 });
        }

        if (bill.status === 'paid') {
            return NextResponse.json({ error: 'Bill is already paid' }, { status: 400 });
        }

        const amountDue = (bill.totalAmount || 0) - (bill.paidAmount || 0);
        const orderId = `RENT-${billId}-${Date.now()}`;

        // 2. Create order via unified adapter
        const orderResult = await createOrder({
            gateway,
            orderId,
            amount: amountDue,
            customerName: bill.tenantName || 'Tenant',
            customerEmail: user.email || '',
            customerPhone: bill.tenantPhone || '', // Ensure this is stored in bill or fetch from tenant doc
            returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/verify?orderId=${orderId}&gateway=${gateway}`,
        });

        // 3. Save pending order to Firestore
        await adminDb.collection('orders').doc(orderId).set({
            orderId,
            billId,
            tenantId: user.uid,
            ownerId: bill.ownerId,
            gateway,
            amount: amountDue,
            status: 'pending',
            createdAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ success: true, data: orderResult });
    } catch (error: any) {
        console.error('Create Order Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create payment order' }, { status: 500 });
    }
}
