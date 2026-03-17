import crypto from 'crypto';
import type { CreateOrderParams, OrderResult, VerifyResult } from './types';

const BASE = process.env.PHONEPE_ENV === 'PROD'
  ? 'https://api.phonepe.com/apis/hermes'
  : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || '';
const SALT_KEY = process.env.PHONEPE_SALT_KEY || '';
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';

function phonePeChecksum(payload: string): string {
  const base64 = Buffer.from(payload).toString('base64');
  const hash = crypto
    .createHash('sha256')
    .update(`${base64}/pg/v1/pay${SALT_KEY}`)
    .digest('hex');
  return `${hash}###${SALT_INDEX}`;
}

export async function createPhonePeOrder(p: CreateOrderParams): Promise<OrderResult> {
  const payload = {
    merchantId: MERCHANT_ID,
    merchantTransactionId: p.orderId,
    amount: Math.round(p.amount * 100),
    redirectUrl: p.returnUrl,
    redirectMode: 'REDIRECT',
    callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook/phonepe`,
    mobileNumber: p.customerPhone,
    paymentInstrument: { type: 'PAY_PAGE' },
  };

  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const checksum = phonePeChecksum(JSON.stringify(payload));

  const res = await fetch(`${BASE}/pg/v1/pay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-VERIFY': checksum,
    },
    body: JSON.stringify({ request: base64Payload }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create PhonePe order');
  }

  const data = await res.json();
  const redirectUrl = data?.data?.instrumentResponse?.redirectInfo?.url;

  return {
    gateway: 'phonepe',
    orderId: p.orderId,
    phonePeRedirectUrl: redirectUrl,
  };
}

export async function verifyPhonePePayment(orderId: string): Promise<VerifyResult> {
  const path = `/pg/v1/status/${MERCHANT_ID}/${orderId}`;
  const checksum = crypto
    .createHash('sha256')
    .update(`${path}${SALT_KEY}`)
    .digest('hex') + `###${SALT_INDEX}`;

  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-VERIFY': checksum,
      'X-MERCHANT-ID': MERCHANT_ID,
    },
  });

  const data = await res.json();

  return {
    success: data?.code === 'PAYMENT_SUCCESS',
    gatewayPaymentId: data?.data?.transactionId ?? '',
    amount: (data?.data?.amount ?? 0) / 100,
  };
}

export function verifyPhonePeWebhook(base64Body: string, receivedChecksum: string): boolean {
  const hash = crypto
    .createHash('sha256')
    .update(`${base64Body}${SALT_KEY}`)
    .digest('hex');
  const expected = `${hash}###${SALT_INDEX}`;
  return expected === receivedChecksum;
}

export function getPhonePeConfig() {
  return {
    merchantId: MERCHANT_ID,
    saltKey: SALT_KEY,
    saltIndex: SALT_INDEX,
    env: process.env.PHONEPE_ENV || 'UAT',
    baseUrl: BASE,
  };
}
