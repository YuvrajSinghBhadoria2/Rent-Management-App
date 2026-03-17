import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            billId
        } = await request.json();

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !billId) {
            return NextResponse.json({ error: 'Missing payment verification details' }, { status: 400 });
        }

        // Verify Signature
        const secret = process.env.RAZORPAY_KEY_SECRET || '';
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
        }

        // 1. Update Bill Status
        const billRef = adminDb.collection('bills').doc(billId);
        const billDoc = await billRef.get();

        if (!billDoc.exists) {
            return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
        }

        await billRef.update({
            status: 'paid',
            paidAt: FieldValue.serverTimestamp(),
            paymentMethod: 'razorpay',
            razorpayPaymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            updatedAt: FieldValue.serverTimestamp(),
        });

        // 2. Record in Payments collection (optional but good for history)
        await adminDb.collection('payments').add({
            billId,
            tenantId: billDoc.data()?.tenantId,
            ownerId: billDoc.data()?.ownerId,
            amount: billDoc.data()?.totalAmount,
            method: 'razorpay',
            status: 'success',
            razorpayPaymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            createdAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ success: true, message: 'Payment verified successfully' });
    } catch (error) {
        console.error('Error verifying payment:', error);
        return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
    }
}
