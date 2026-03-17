import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

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
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let query = adminDb.collection('complaints');

    if (user.role === 'owner') {
      query = query.where('ownerId', '==', user.uid) as any;
    } else {
      query = query.where('tenantId', '==', user.uid) as any;
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    const complaints = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    }));

    return NextResponse.json({ success: true, data: complaints });
  } catch (error: any) {
    console.error('Complaints GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch complaints' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user || user.role !== 'tenant') {
    return NextResponse.json({ error: 'Only tenants can raise complaints' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, category, priority } = body;

    if (!title || !description || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get tenant info to auto-fill building/owner details
    const tenantDoc = await adminDb.collection('tenants').doc(user.uid).get();
    const tenantData = tenantDoc.data();

    if (!tenantData || !tenantData.currentBuildingId) {
      return NextResponse.json({ error: 'Active lease not found' }, { status: 400 });
    }

    const complaintData = {
      title,
      description,
      category,
      priority: priority || 'normal',
      buildingId: tenantData.currentBuildingId,
      ownerId: tenantData.ownerId,
      tenantId: user.uid,
      tenantName: tenantData.name || user.email,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
      updates: []
    };

    const docRef = await adminDb.collection('complaints').add(complaintData);

    return NextResponse.json({
      success: true,
      data: { id: docRef.id }
    });
  } catch (error: any) {
    console.error('Complaints POST error:', error);
    return NextResponse.json({ error: 'Failed to create complaint' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { complaintId, status, ownerComment } = body;

    if (!complaintId) {
      return NextResponse.json({ error: 'Complaint ID is required' }, { status: 400 });
    }

    const complaintRef = adminDb.collection('complaints').doc(complaintId);
    const complaint = await complaintRef.get();

    if (!complaint.exists) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    const data = complaint.data();
    // Security check
    if (user.role === 'owner' && data?.ownerId !== user.uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (user.role === 'tenant' && data?.tenantId !== user.uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (status) updateData.status = status;
    if (ownerComment) {
      const updates = data?.updates || [];
      updates.push({
        comment: ownerComment,
        authorRole: user.role,
        authorName: user.name || user.email,
        createdAt: new Date(),
      });
      updateData.updates = updates;
    }

    await complaintRef.update(updateData);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Complaints PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update complaint' }, { status: 500 });
  }
}
