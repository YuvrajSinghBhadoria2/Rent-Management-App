import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import Razorpay from 'razorpay';

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

async function getAuthUser(request: NextRequest) {
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) return null;

    try {
        const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
        return decodedToken;
    } catch (error) {
        return null;
    }
}

export async function POST(request: NextRequest) {
    const user = await getAuthUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { billId } = await request.json();
        if (!billId) {
            return NextResponse.json({ error: 'Bill ID is required' }, { status: 400 });
        }

        const billDoc = await adminDb.collection('bills').doc(billId).get();
        if (!billDoc.exists) {
            return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
        }

        const bill = billDoc.data();

        // Verify ownership (tenant can only pay their own bills)
        if (user.role === 'tenant' && bill?.tenantId !== user.uid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Owner can also initiate payment for verification/test (optional)
        if (user.role === 'owner' && bill?.ownerId !== user.uid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (bill?.status === 'paid') {
            return NextResponse.json({ error: 'Bill is already paid' }, { status: 400 });
        }

        // Create Razorpay Order
        const options = {
            amount: Math.round(bill?.totalAmount * 100), // Amount in paise
            currency: 'INR',
            receipt: `receipt_${billId}`,
            notes: {
                billId,
                tenantId: bill?.tenantId,
                month: bill?.month,
                year: bill?.year,
            },
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({
            success: true,
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                billId,
                razorpayKeyId: process.env.RAZORPAY_KEY_ID,
            },
        });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
    }
}
