export type PaymentGateway = 'cashfree' | 'phonepe' | 'razorpay';

export interface CreateOrderParams {
  gateway: PaymentGateway;
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  returnUrl: string;
}

export interface OrderResult {
  gateway: PaymentGateway;
  orderId: string;
  cashfreeSessionId?: string;
  razorpayOrderId?: string;
  phonePeRedirectUrl?: string;
}

export interface VerifyResult {
  success: boolean;
  gatewayPaymentId: string;
  amount: number;
}
