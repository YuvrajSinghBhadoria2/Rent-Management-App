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

        // Get tenant data
        const tenantDoc = await adminDb.collection('tenants').doc(tenantId).get();
        const tenantData = tenantDoc.data();

        // Get pending bills count
        const billsSnap = await adminDb
            .collection('bills')
            .where('tenantId', '==', tenantId)
            .where('status', 'in', ['unpaid', 'partial'])
            .get();
        const pendingBills = billsSnap.docs.length;

        // Get open complaints count
        const complaintsSnap = await adminDb
            .collection('complaints')
            .where('tenantId', '==', tenantId)
            .where('status', 'in', ['open', 'in_progress'])
            .get();
        const openComplaints = complaintsSnap.docs.length;

        return NextResponse.json({
            success: true,
            data: {
                tenant: tenantData ? {
                    currentBuildingId: tenantData.currentBuildingId,
                    currentRoomId: tenantData.currentRoomId,
                    currentRent: tenantData.currentRent,
                    leaseStatus: tenantData.leaseStatus,
                } : null,
                pendingBills,
                openComplaints,
            }
        });
    } catch (error) {
        console.error('Error fetching tenant dashboard:', error);
        return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 });
    }
}
