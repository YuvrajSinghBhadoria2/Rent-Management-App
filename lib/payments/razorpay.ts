import Razorpay from 'razorpay';
import crypto from 'crypto';
import type { CreateOrderParams, OrderResult, VerifyResult } from './types';

const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export async function createRazorpayOrder(p: CreateOrderParams): Promise<OrderResult> {
  const order = await rzp.orders.create({
    amount: Math.round(p.amount * 100),
    currency: 'INR',
    receipt: p.orderId,
    notes: {
      billId: p.orderId,
      customerEmail: p.customerEmail,
      customerPhone: p.customerPhone,
    },
  });

  return {
    gateway: 'razorpay',
    orderId: p.orderId,
    razorpayOrderId: order.id,
  };
}

export async function verifyRazorpayPayment(orderId: string): Promise<VerifyResult> {
  const order = await rzp.orders.fetch(orderId);

  return {
    success: order.status === 'paid',
    gatewayPaymentId: order.id,
    amount: (order.amount as number) / 100,
  };
}

export function verifyRazorpayWebhookSignature(
  rawBody: string,
  receivedSig: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  return expected === receivedSig;
}

export function getRazorpayConfig() {
  return {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
  };
}

export { rzp };
