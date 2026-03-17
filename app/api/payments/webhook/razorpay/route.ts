import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import crypto from 'crypto';

function verifyRazorpaySignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  
  return expectedSignature === signature;
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature') || '';

    if (!verifyRazorpaySignature(rawBody, signature)) {
      console.error('Invalid Razorpay webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const data = JSON.parse(rawBody);
    const event = data.event;

    if (event === 'payment.captured') {
      const paymentEntity = data.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;

      if (!orderId) {
        return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
      }

      const orderDoc = await adminDb.collection('orders').doc(orderId).get();
      
      if (!orderDoc.exists) {
        console.error('Order not found:', orderId);
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      const orderData = orderDoc.data();

      if (orderData?.status === 'completed') {
        return NextResponse.json({ message: 'Order already processed' });
      }

      const { billId, tenantId, ownerId, amount } = orderData;

      await adminDb.collection('orders').doc(orderId).update({
        status: 'completed',
        completedAt: FieldValue.serverTimestamp(),
        gatewayPaymentId: paymentEntity?.id,
      });

      const billRef = adminDb.collection('bills').doc(billId);
      const billDoc = await billRef.get();
      const billData = billDoc.data();

      const newPaidAmount = (billData?.paidAmount || 0) + amount;
      const newStatus = newPaidAmount >= (billData?.totalAmount || 0) ? 'paid' : 'partial';

      await billRef.update({
        paidAmount: newPaidAmount,
        status: newStatus,
        updatedAt: FieldValue.serverTimestamp(),
      });

      await adminDb.collection('payments').add({
        billId,
        orderId,
        leaseId: billData?.leaseId,
        tenantId,
        ownerId,
        amount,
        method: 'online',
        paidAt: FieldValue.serverTimestamp(),
        referenceNumber: paymentEntity?.id,
        notes: null,
        receiptUrl: null,
        createdAt: FieldValue.serverTimestamp(),
      });

      await adminDb.collection('notifications').add({
        userId: tenantId,
        type: 'payment_received',
        title: 'Payment Successful',
        message: `Payment of ₹${amount.toLocaleString()} has been received`,
        isRead: false,
        link: `/bills/${billId}`,
        createdAt: FieldValue.serverTimestamp(),
      });

      console.log('Razorpay payment processed:', orderId);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
