import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { startOfMonth, subMonths, format, endOfMonth } from 'date-fns';

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

    // 1. Monthly Collections (Last 12 Months for a broader view)
    const monthlyCollections = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(monthStart);

      const paymentsSnap = await adminDb.collection('payments')
        .where('ownerId', '==', uid)
        .where('createdAt', '>=', monthStart)
        .where('createdAt', '<=', monthEnd)
        .get();

      let total = 0;
      paymentsSnap.forEach(doc => { total += doc.data().amount || 0; });

      monthlyCollections.push({
        month: format(monthStart, 'MMM yyyy'),
        amount: total
      });
    }

    // 2. Real-time Portfolio Stats
    const buildingsSnap = await adminDb.collection('buildings')
      .where('ownerId', '==', uid)
      .where('isActive', '==', true)
      .get();

    let totalRooms = 0;
    let occupiedRooms = 0;
    let pendingDuesTotal = 0;

    const buildingsData = await Promise.all(buildingsSnap.docs.map(async (bDoc) => {
      const bId = bDoc.id;
      const bData = bDoc.data();

      // Count rooms for this building
      const roomsSnap = await adminDb.collection('buildings').doc(bId).collection('rooms').get();
      const bTotalRooms = roomsSnap.size;
      const bOccupiedRooms = roomsSnap.docs.filter(r => r.data().status === 'occupied' || r.data().occupiedBeds > 0).length;

      totalRooms += bTotalRooms;
      occupiedRooms += bOccupiedRooms;

      // Pending dues for this building
      const billsSnap = await adminDb.collection('bills')
        .where('buildingId', '==', bId)
        .where('status', 'in', ['pending', 'overdue'])
        .get();

      let bPending = 0;
      billsSnap.forEach(doc => {
        const bill = doc.data();
        bPending += (bill.totalAmount || 0) - (bill.paidAmount || 0);
      });

      pendingDuesTotal += bPending;

      return {
        id: bId,
        name: bData.name,
        totalRooms: bTotalRooms,
        occupiedRooms: bOccupiedRooms,
        pendingDues: bPending,
        occupancyRate: bTotalRooms > 0 ? Math.round((bOccupiedRooms / bTotalRooms) * 100) : 0
      };
    }));

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalBuildings: buildingsSnap.size,
          totalRooms,
          occupiedRooms,
          occupancyRate: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
          pendingDuesTotal
        },
        monthlyCollections,
        buildings: buildingsData
      }
    });
  } catch (error: any) {
    console.error('Reports API error:', error);
    return NextResponse.json({ error: 'Failed to generate financial reports' }, { status: 500 });
  }
}
