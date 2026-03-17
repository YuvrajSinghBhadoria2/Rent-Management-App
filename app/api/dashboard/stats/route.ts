import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { startOfMonth, endOfMonth } from 'date-fns';

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
        const uid = user.uid;
        const now = new Date();
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);

        // 1. Total Buildings
        const buildingsSnap = await adminDb.collection('buildings')
            .where('ownerId', '==', uid)
            .where('isActive', '==', true)
            .get();
        const totalBuildings = buildingsSnap.size;

        // 2. Total Tenants
        const tenantsSnap = await adminDb.collection('tenants')
            .where('ownerId', '==', uid)
            .get();
        const totalTenants = tenantsSnap.size;

        // 3. Pending Dues (pending + overdue)
        const billsSnap = await adminDb.collection('bills')
            .where('ownerId', '==', uid)
            .where('status', 'in', ['pending', 'overdue'])
            .get();

        let pendingDues = 0;
        billsSnap.forEach((doc: any) => {
            const bill = doc.data();
            pendingDues += (bill.totalAmount || 0) - (bill.paidAmount || 0);
        });

        // 4. Open Complaints
        const complaintsSnap = await adminDb.collection('complaints')
            .where('ownerId', '==', uid)
            .where('status', 'in', ['open', 'in_progress'])
            .get();
        const openComplaints = complaintsSnap.size;

        // 5. Rent Collected This Month
        const paymentsSnap = await adminDb.collection('payments')
            .where('ownerId', '==', uid)
            .where('createdAt', '>=', monthStart)
            .where('createdAt', '<=', monthEnd)
            .get();

        let rentCollected = 0;
        paymentsSnap.forEach((doc: any) => {
            rentCollected += doc.data().amount || 0;
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
        console.error('Dashboard stats error:', error);
        return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
    }
}
