import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

async function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user || user.role !== 'tenant') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [userDoc, tenantDoc] = await Promise.all([
      adminDb.collection('users').doc(user.uid).get(),
      adminDb.collection('tenants').doc(user.uid).get(),
    ]);

    const userData = userDoc.data();
    const tenantData = tenantDoc.data();

    let buildingName = null;
    let roomNumber = null;

    if (tenantData?.currentBuildingId) {
      const buildingDoc = await adminDb.collection('buildings').doc(tenantData.currentBuildingId).get();
      buildingName = buildingDoc.data()?.name;
    }

    if (tenantData?.currentRoomId && tenantData?.currentBuildingId) {
      const roomDoc = await adminDb.collection('buildings').doc(tenantData.currentBuildingId)
        .collection('rooms').doc(tenantData.currentRoomId).get();
      roomNumber = roomDoc.data()?.number;
    }

    let leaseEndDate = null;
    if (tenantData?.currentLeaseId) {
      const leaseDoc = await adminDb.collection('leases').doc(tenantData.currentLeaseId).get();
      leaseEndDate = leaseDoc.data()?.endDate?.toDate?.()?.toISOString();
    }

    return NextResponse.json({
      success: true,
      data: {
        uid: user.uid,
        name: userData?.name || user.name,
        email: userData?.email || user.email,
        phone: tenantData?.phone || userData?.phone,
        currentBuildingId: tenantData?.currentBuildingId,
        currentBuildingName: buildingName,
        currentRoomId: tenantData?.currentRoomId,
        currentRoomNumber: roomNumber,
        currentRent: tenantData?.currentRent,
        leaseStartDate: tenantData?.leaseStartDate?.toDate?.()?.toISOString(),
        leaseEndDate,
        leaseStatus: tenantData?.leaseStatus,
      }
    });
  } catch (error) {
    console.error('Error fetching tenant profile:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user || user.role !== 'tenant') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, phone } = body;

    const updates: any = {};
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    updates.updatedAt = new Date();

    await adminDb.collection('users').doc(user.uid).update(updates);

    return NextResponse.json({ success: true, data: { updated: true } });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 });
  }
}
