import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

const offlinePaymentSchema = z.object({
    method: z.enum(['cash', 'upi', 'cheque', 'bank_transfer']),
    amount: z.number().min(0),
    notes: z.string().optional(),
    paymentDate: z.string().optional(),
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

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'owner') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const validated = offlinePaymentSchema.parse(body);

        const billRef = adminDb.collection('bills').doc(params.id);
        const billDoc = await billRef.get();

        if (!billDoc.exists || billDoc.data()?.ownerId !== user.uid) {
            return NextResponse.json({ error: 'Bill not found or unauthorized' }, { status: 404 });
        }

        if (billDoc.data()?.status === 'paid') {
            return NextResponse.json({ error: 'Bill is already marked as paid' }, { status: 400 });
        }

        // Update Bill
        await billRef.update({
            status: 'paid',
            paidAt: validated.paymentDate ? new Date(validated.paymentDate) : FieldValue.serverTimestamp(),
            paymentMethod: validated.method,
            offlineNotes: validated.notes || '',
            updatedAt: FieldValue.serverTimestamp(),
        });

        // Record in Payments collection
        await adminDb.collection('payments').add({
            billId: params.id,
            tenantId: billDoc.data()?.tenantId,
            ownerId: user.uid,
            amount: validated.amount,
            method: validated.method,
            status: 'success',
            type: 'offline',
            notes: validated.notes || '',
            createdAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ success: true, message: 'Offline payment recorded successfully' });
    } catch (error) {
        console.error('Error recording offline payment:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
    }
}
