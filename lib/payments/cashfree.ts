import crypto from 'crypto';
import type { CreateOrderParams, OrderResult, VerifyResult } from './types';

const BASE = process.env.CASHFREE_ENV === 'PROD'
  ? 'https://api.cashfree.com/pg'
  : 'https://sandbox.cashfree.com/pg';

const cfHeaders = {
  'Content-Type': 'application/json',
  'x-api-version': '2023-08-01',
  'x-client-id': process.env.CASHFREE_APP_ID!,
  'x-client-secret': process.env.CASHFREE_SECRET_KEY!,
};

export async function createCashfreeOrder(p: CreateOrderParams): Promise<OrderResult> {
  const res = await fetch(`${BASE}/orders`, {
    method: 'POST',
    headers: cfHeaders,
    body: JSON.stringify({
      order_id: p.orderId,
      order_amount: p.amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: p.orderId,
        customer_name: p.customerName,
        customer_email: p.customerEmail,
        customer_phone: p.customerPhone,
      },
      order_meta: {
        return_url: p.returnUrl,
        notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook/cashfree`,
      },
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create Cashfree order');
  }

  const data = await res.json();

  return {
    gateway: 'cashfree',
    orderId: p.orderId,
    cashfreeSessionId: data.payment_session_id,
  };
}

export async function verifyCashfreePayment(orderId: string): Promise<VerifyResult> {
  const res = await fetch(`${BASE}/orders/${orderId}`, { headers: cfHeaders });
  const data = await res.json();

  return {
    success: data.order_status === 'PAID',
    gatewayPaymentId: data.cf_order_id ?? '',
    amount: data.order_amount ?? 0,
  };
}

export function verifyCashfreeWebhookSignature(
  rawBody: string,
  timestamp: string,
  receivedSig: string
): boolean {
  const secret = process.env.CASHFREE_SECRET_KEY;
  if (!secret) return false;

  const payload = `${timestamp}${rawBody}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64');

  return expectedSignature === receivedSig;
}

export function getCashfreeConfig() {
  return {
    appId: process.env.CASHFREE_APP_ID,
    secretKey: process.env.CASHFREE_SECRET_KEY,
    env: process.env.CASHFREE_ENV || 'TEST',
    baseUrl: BASE,
  };
}
