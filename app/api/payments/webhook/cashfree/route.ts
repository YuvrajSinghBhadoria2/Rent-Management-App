import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import crypto from 'crypto';

function verifyCashfreeSignature(rawBody: string, timestamp: string, signature: string): boolean {
  const secret = process.env.CASHFREE_SECRET_KEY;
  if (!secret) return false;
  
  const payload = `${timestamp}${rawBody}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64');
  
  return expectedSignature === signature;
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const timestamp = request.headers.get('x-webhook-timestamp') || '';
    const signature = request.headers.get('x-webhook-signature') || '';

    if (!verifyCashfreeSignature(rawBody, timestamp, signature)) {
      console.error('Invalid Cashfree webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const data = JSON.parse(rawBody);
    const eventType = data.type;

    if (eventType === 'PAYMENT_SUCCESS_WEBHOOK') {
      const orderId = data.data?.order?.order_id;
      
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
        gatewayPaymentId: data.data?.payment?.cf_payment_id || '',
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
        cashfreeOrderId: data.data?.order?.cf_order_id,
        cashfreePaymentId: data.data?.payment?.cf_payment_id,
        referenceNumber: null,
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

      await adminDb.collection('notifications').add({
        userId: ownerId,
        type: 'payment_received',
        title: 'Payment Received',
        message: `Payment of ₹${amount.toLocaleString()} received from tenant`,
        isRead: false,
        link: `/billing`,
        createdAt: FieldValue.serverTimestamp(),
      });

      console.log('Payment processed successfully:', orderId);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Cashfree webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
