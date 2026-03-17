import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function recordPayment(orderId: string, gatewayPaymentId: string) {
    const orderRef = adminDb.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
        throw new Error('Order not found');
    }

    const orderData = orderDoc.data()!;

    // Idempotency: if already processed, return early
    if (orderData.status === 'completed') {
        return { success: true, alreadyProcessed: true };
    }

    const { billId, tenantId, ownerId, amount, gateway } = orderData;

    // 1. Update Order
    await orderRef.update({
        status: 'completed',
        gatewayPaymentId,
        completedAt: FieldValue.serverTimestamp(),
    });

    // 2. Update Bill
    const billRef = adminDb.collection('bills').doc(billId);
    await billRef.update({
        status: 'paid', // Assuming full payment 
        paidAmount: FieldValue.increment(amount),
        updatedAt: FieldValue.serverTimestamp(),
    });

    // 3. Record Payment document
    await adminDb.collection('payments').add({
        orderId,
        billId,
        tenantId,
        ownerId,
        amount,
        method: gateway,
        status: 'success',
        gatewayPaymentId,
        createdAt: FieldValue.serverTimestamp(),
    });

    // 4. Send Notifications (TODO: Implement notification helper)
    // await sendNotification({ userId: tenantId, type: 'payment_received', ... });

    return { success: true };
}
