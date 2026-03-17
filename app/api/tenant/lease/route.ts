import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

async function getAuthUser(request: NextRequest) {
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) return null;

    try {
        const { adminAuth } = await import('@/lib/firebase-admin');
        const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
        return decodedToken;
    } catch {
        return null;
    }
}

export async function GET(request: NextRequest) {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'tenant') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const tenantId = user.uid;

        // Get tenant data to find current lease
        const tenantDoc = await adminDb.collection('tenants').doc(tenantId).get();
        const tenantData = tenantDoc.data();

        if (!tenantData?.currentLeaseId) {
            return NextResponse.json({ success: true, data: null });
        }

        // Get lease data
        const leaseDoc = await adminDb.collection('leases').doc(tenantData.currentLeaseId).get();
        
        if (!leaseDoc.exists) {
            return NextResponse.json({ success: true, data: null });
        }

        const leaseData = leaseDoc.data();

        return NextResponse.json({
            success: true,
            data: {
                id: leaseDoc.id,
                ...leaseData,
            }
        });
    } catch (error) {
        console.error('Error fetching tenant lease:', error);
        return NextResponse.json({ error: 'Failed to fetch lease' }, { status: 500 });
    }
}
