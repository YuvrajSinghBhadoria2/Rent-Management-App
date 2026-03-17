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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const complaintId = params.id;
    const complaintDoc = await adminDb.collection('complaints').doc(complaintId).get();

    if (!complaintDoc.exists) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    const data = complaintDoc.data();

    // Access control
    if (user.role === 'owner' && data?.ownerId !== user.uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (user.role === 'tenant' && data?.tenantId !== user.uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get comments/updates
    const commentsSnapshot = await adminDb.collection('complaints').doc(complaintId)
      .collection('comments').orderBy('createdAt', 'asc').get();

    const comments = commentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        id: complaintDoc.id,
        ...data,
        createdAt: data?.createdAt?.toDate?.()?.toISOString(),
        updatedAt: data?.updatedAt?.toDate?.()?.toISOString(),
        comments // Backward compatibility with some UI that might still use this field
      }
    });
  } catch (error: any) {
    console.error('Complaint Detail GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch complaint' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const complaintId = params.id;
    const body = await request.json();
    const { status, ownerComment, content } = body; // Support both naming conventions

    const complaintRef = adminDb.collection('complaints').doc(complaintId);
    const complaintDoc = await complaintRef.get();

    if (!complaintDoc.exists) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    const data = complaintDoc.data();

    // Access control
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

    const commentText = ownerComment || content;
    if (commentText) {
      const commentData = {
        authorId: user.uid,
        authorName: user.name || user.email,
        authorRole: user.role,
        content: commentText.trim(),
        createdAt: new Date(),
      };

      await adminDb.collection('complaints').doc(complaintId)
        .collection('comments').add(commentData);
    }

    await complaintRef.update(updateData);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Complaint Detail PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update complaint' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Post is used for adding comments in some existing code
  return PATCH(request, { params });
}
