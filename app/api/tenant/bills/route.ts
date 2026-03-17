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
    const snapshot = await adminDb.collection('bills')
      .where('tenantId', '==', user.uid)
      .orderBy('createdAt', 'desc')
      .get();

    const bills = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        month: data.month,
        year: data.year,
        totalAmount: data.totalAmount,
        paidAmount: data.paidAmount,
        status: data.status,
        dueDate: data.dueDate?.toDate?.()?.toISOString(),
        buildingName: data.buildingName,
        roomNumber: data.roomNumber,
        createdAt: data.createdAt?.toDate?.()?.toISOString(),
      };
    });

    return NextResponse.json({ success: true, data: bills });
  } catch (error) {
    console.error('Error fetching tenant bills:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch bills' }, { status: 500 });
  }
}
