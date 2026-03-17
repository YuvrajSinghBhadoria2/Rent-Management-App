import { createCashfreeOrder, verifyCashfreePayment } from './cashfree';
import { createPhonePeOrder, verifyPhonePePayment } from './phonepe';
import { createRazorpayOrder, verifyRazorpayPayment } from './razorpay';
import type { CreateOrderParams, OrderResult, VerifyResult, PaymentGateway } from './types';

export async function createOrder(params: CreateOrderParams): Promise<OrderResult> {
  switch (params.gateway) {
    case 'cashfree':
      return createCashfreeOrder(params);
    case 'phonepe':
      return createPhonePeOrder(params);
    case 'razorpay':
      return createRazorpayOrder(params);
    default:
      throw new Error(`Unsupported gateway: ${params.gateway}`);
  }
}

export async function verifyPayment(
  gateway: PaymentGateway,
  orderId: string
): Promise<VerifyResult> {
  switch (gateway) {
    case 'cashfree':
      return verifyCashfreePayment(orderId);
    case 'phonepe':
      return verifyPhonePePayment(orderId);
    case 'razorpay':
      return verifyRazorpayPayment(orderId);
    default:
      throw new Error(`Unsupported gateway: ${gateway}`);
  }
}

export * from './types';
export * from './cashfree';
export * from './phonepe';
export * from './razorpay';
