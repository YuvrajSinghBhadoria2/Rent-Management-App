import { NextRequest, NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/payments';
import { recordPayment } from '@/lib/payments/settlement';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { orderId, gateway, razorpay_payment_id } = body;

        if (!orderId || !gateway) {
            return NextResponse.json({ error: 'Missing orderId or gateway' }, { status: 400 });
        }

        // For Razorpay, we can verify with the payment_id or rely on the signature (already done in client or here)
        // Here we use the unified verifyPayment helper
        const verification = await verifyPayment(gateway, orderId);

        if (verification.success) {
            await recordPayment(orderId, razorpay_payment_id || verification.gatewayPaymentId);
            return NextResponse.json({ success: true, message: 'Payment verified and recorded' });
        } else {
            return NextResponse.json({ error: 'Payment verification failed at gateway' }, { status: 400 });
        }
    } catch (error: any) {
        console.error('Payment Verification Error:', error);
        return NextResponse.json({ error: error.message || 'Payment verification failed' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const gateway = searchParams.get('gateway') as any;

    if (!orderId || !gateway) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/home?error=Missing details`);
    }

    try {
        const verification = await verifyPayment(gateway, orderId);

        if (verification.success) {
            await recordPayment(orderId, verification.gatewayPaymentId);
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/home?success=Payment recorded`);
        } else {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/home?error=Verification failed`);
        }
    } catch (error) {
        console.error('Redirect Verification Error:', error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/home?error=System error`);
    }
}
