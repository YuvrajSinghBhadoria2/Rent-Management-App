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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await verifyAuth(request);
  if (!user || user.role !== 'tenant') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const doc = await adminDb.collection('bills').doc(params.id).get();
    
    if (!doc.exists) {
      return NextResponse.json({ success: false, error: 'Bill not found' }, { status: 404 });
    }

    const data = doc.data();

    if (data?.tenantId !== user.uid) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const paymentsSnapshot = await adminDb.collection('payments')
      .where('billId', '==', params.id)
      .orderBy('paidAt', 'desc')
      .get();

    const payments = paymentsSnapshot.docs.map(p => ({
      id: p.id,
      ...p.data(),
      paidAt: p.data().paidAt?.toDate?.()?.toISOString(),
      createdAt: p.data().createdAt?.toDate?.()?.toISOString(),
    }));

    return NextResponse.json({ 
      success: true, 
      data: {
        id: doc.id,
        ...data,
        dueDate: data?.dueDate?.toDate?.()?.toISOString(),
        createdAt: data?.createdAt?.toDate?.()?.toISOString(),
        updatedAt: data?.updatedAt?.toDate?.()?.toISOString(),
        payments,
      }
    });
  } catch (error) {
    console.error('Error fetching bill:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch bill' }, { status: 500 });
  }
}
