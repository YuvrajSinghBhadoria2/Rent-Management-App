import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

const tenantSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    phone: z.string().min(10, 'Valid phone is required'),
    email: z.string().email().optional().or(z.literal('')),
    permanentAddress: z.string().min(1, 'Address is required'),
    kyc: z.object({
        type: z.enum(['aadhaar', 'pan', 'voter_id']),
        number: z.string().min(1, 'ID number is required'),
        frontUrl: z.string().nullable().optional(),
        backUrl: z.string().nullable().optional(),
    }),
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

export async function GET(request: NextRequest) {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'owner') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const tenantsSnap = await adminDb
            .collection('tenants')
            .where('ownerId', '==', user.uid)
            .where('isActive', '==', true)
            .orderBy('createdAt', 'desc')
            .get();

        const tenants = tenantsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return NextResponse.json({ success: true, data: tenants });
    } catch (error) {
        console.error('Error fetching tenants:', error);
        return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'owner') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const validated = tenantSchema.parse(body);

        const tenantRef = await adminDb.collection('tenants').add({
            ...validated,
            ownerId: user.uid,
            isActive: true,
            currentLeaseId: null,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({
            success: true,
            data: { id: tenantRef.id }
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating tenant:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create tenant' }, { status: 500 });
    }
}
