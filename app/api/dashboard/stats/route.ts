import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

async function getAuthUser(request: NextRequest) {
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) return null;

    try {
        const { adminAuth } = await import('@/lib/firebase-admin');
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
        const ownerId = user.uid;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Get total buildings
        const buildingsSnap = await adminDb
            .collection('buildings')
            .where('ownerId', '==', ownerId)
            .where('isActive', '==', true)
            .get();
        const totalBuildings = buildingsSnap.docs.length;

        // Get total tenants (from users collection where role is tenant and owned by this owner)
        const tenantsSnap = await adminDb
            .collection('tenants')
            .where('ownerId', '==', ownerId)
            .get();
        const totalTenants = tenantsSnap.docs.length;

        // Get pending dues (unpaid + partial bills)
        const billsSnap = await adminDb
            .collection('bills')
            .where('ownerId', '==', ownerId)
            .where('status', 'in', ['unpaid', 'partial'])
            .get();
        
        let pendingDues = 0;
        billsSnap.docs.forEach(doc => {
            const bill = doc.data();
            pendingDues += (bill.totalAmount - bill.paidAmount);
        });

        // Get open complaints
        const complaintsSnap = await adminDb
            .collection('complaints')
            .where('ownerId', '==', ownerId)
            .where('status', 'in', ['open', 'in_progress'])
            .get();
        const openComplaints = complaintsSnap.docs.length;

        // Get rent collected this month
        const paymentsSnap = await adminDb
            .collection('payments')
            .where('ownerId', '==', ownerId)
            .where('paidAt', '>=', startOfMonth)
            .where('paidAt', '<=', endOfMonth)
            .get();
        
        let rentCollected = 0;
        paymentsSnap.docs.forEach(doc => {
            const payment = doc.data();
            rentCollected += payment.amount;
        });

        return NextResponse.json({
            success: true,
            data: {
                totalBuildings,
                totalTenants,
                pendingDues,
                openComplaints,
                rentCollected,
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
