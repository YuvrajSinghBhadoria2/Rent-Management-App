import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

const tenantUpdateSchema = z.object({
    name: z.string().min(1).optional(),
    phone: z.string().min(10).optional(),
    email: z.string().email().optional().or(z.literal('')).optional(),
    permanentAddress: z.string().min(1).optional(),
    kyc: z.object({
        type: z.enum(['aadhaar', 'pan', 'voter_id']),
        number: z.string().min(1),
        frontUrl: z.string().nullable(),
        backUrl: z.string().nullable(),
    }).optional(),
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

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'owner') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const tenantDoc = await adminDb.collection('tenants').doc(params.id).get();

        if (!tenantDoc.exists || tenantDoc.data()?.ownerId !== user.uid) {
            return NextResponse.json({ error: 'Tenant not found or unauthorized' }, { status: 404 });
        }

        const tenantData = tenantDoc.data();

        // Also fetch current lease details if exists
        let leaseData = null;
        if (tenantData?.currentLeaseId) {
            const leaseDoc = await adminDb.collection('leases').doc(tenantData.currentLeaseId).get();
            if (leaseDoc.exists) {
                leaseData = { id: leaseDoc.id, ...leaseDoc.data() };
            }
        }

        return NextResponse.json({
            success: true,
            data: { id: tenantDoc.id, ...tenantData, currentLease: leaseData }
        });
    } catch (error) {
        console.error('Error fetching tenant:', error);
        return NextResponse.json({ error: 'Failed to fetch tenant' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'owner') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const validated = tenantUpdateSchema.parse(body);

        const tenantRef = adminDb.collection('tenants').doc(params.id);
        const tenantDoc = await tenantRef.get();

        if (!tenantDoc.exists || tenantDoc.data()?.ownerId !== user.uid) {
            return NextResponse.json({ error: 'Tenant not found or unauthorized' }, { status: 404 });
        }

        await tenantRef.update({
            ...validated,
            updatedAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating tenant:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to update tenant' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'owner') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const tenantRef = adminDb.collection('tenants').doc(params.id);
        const tenantDoc = await tenantRef.get();

        if (!tenantDoc.exists || tenantDoc.data()?.ownerId !== user.uid) {
            return NextResponse.json({ error: 'Tenant not found or unauthorized' }, { status: 404 });
        }

        // Soft delete
        await tenantRef.update({
            isActive: false,
            updatedAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting tenant:', error);
        return NextResponse.json({ error: 'Failed to delete tenant' }, { status: 500 });
    }
}
