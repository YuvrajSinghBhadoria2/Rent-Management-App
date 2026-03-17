import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import crypto from 'crypto';

function verifyPhonePeSignature(payload: string, xVerify: string): boolean {
  const saltKey = process.env.PHONEPE_SALT_KEY;
  const saltIndex = process.env.PHONEPE_SALT_INDEX || '1';
  if (!saltKey) return false;
  
  const hash = crypto
    .createHash('sha256')
    .update(`${payload}/pg/v1/status${saltKey}`)
    .digest('hex');
  
  return `${hash}###${saltIndex}` === xVerify;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const xVerify = request.headers.get('X-VERIFY') || '';

    const responseBase64 = body.response;
    if (!responseBase64) {
      return NextResponse.json({ error: 'Missing response' }, { status: 400 });
    }

    if (!verifyPhonePeSignature(responseBase64, xVerify)) {
      console.error('Invalid PhonePe webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const data = JSON.parse(Buffer.from(responseBase64, 'base64').toString());
    
    if (data.code === 'PAYMENT_SUCCESS') {
      const transactionId = data.data?.transactionId;
      const merchantTransactionId = data.data?.merchantTransactionId;

      if (!merchantTransactionId) {
        return NextResponse.json({ error: 'Missing transaction ID' }, { status: 400 });
      }

      const orderDoc = await adminDb.collection('orders').doc(merchantTransactionId).get();
      
      if (!orderDoc.exists) {
        console.error('Order not found:', merchantTransactionId);
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      const orderData = orderDoc.data();

      if (orderData?.status === 'completed') {
        return NextResponse.json({ message: 'Order already processed' });
      }

      const { billId, tenantId, ownerId, amount } = orderData;

      await adminDb.collection('orders').doc(merchantTransactionId).update({
        status: 'completed',
        completedAt: FieldValue.serverTimestamp(),
        gatewayPaymentId: transactionId,
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
        orderId: merchantTransactionId,
        leaseId: billData?.leaseId,
        tenantId,
        ownerId,
        amount,
        method: 'online',
        paidAt: FieldValue.serverTimestamp(),
        referenceNumber: transactionId,
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

      console.log('PhonePe payment processed:', merchantTransactionId);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('PhonePe webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
