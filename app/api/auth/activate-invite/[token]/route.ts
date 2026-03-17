import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const token = params.token;

    const tokenDoc = await adminDb.collection('inviteTokens').doc(token).get();

    if (!tokenDoc.exists) {
      return NextResponse.json({ success: false, error: 'Invalid invite token' }, { status: 404 });
    }

    const tokenData = tokenDoc.data();

    if (tokenData?.isUsed) {
      return NextResponse.json({ success: false, error: 'Invite token already used' }, { status: 400 });
    }

    if (tokenData?.expiresAt && tokenData.expiresAt.toDate() < new Date()) {
      return NextResponse.json({ success: false, error: 'Invite token expired' }, { status: 400 });
    }

    const userDoc = await adminDb.collection('users').doc(tokenData?.tenantUserId).get();
    const userData = userDoc.data();

    return NextResponse.json({
      success: true,
      data: {
        email: userData?.email,
        name: userData?.name,
      }
    });
  } catch (error) {
    console.error('Error validating invite token:', error);
    return NextResponse.json({ success: false, error: 'Failed to validate token' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const token = params.token;
    const body = await request.json();
    const { password } = body;

    if (!password || password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const tokenDoc = await adminDb.collection('inviteTokens').doc(token).get();

    if (!tokenDoc.exists) {
      return NextResponse.json({ success: false, error: 'Invalid invite token' }, { status: 404 });
    }

    const tokenData = tokenDoc.data();

    if (tokenData?.isUsed) {
      return NextResponse.json({ success: false, error: 'Invite token already used' }, { status: 400 });
    }

    if (tokenData?.expiresAt && tokenData.expiresAt.toDate() < new Date()) {
      return NextResponse.json({ success: false, error: 'Invite token expired' }, { status: 400 });
    }

    const userId = tokenData?.tenantUserId;

    await adminAuth.updateUser(userId, {
      password,
    });

    await adminDb.collection('inviteTokens').doc(token).update({
      isUsed: true,
      usedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, data: { message: 'Password set successfully' } });
  } catch (error) {
    console.error('Error activating invite:', error);
    return NextResponse.json({ success: false, error: 'Failed to activate invite' }, { status: 500 });
  }
}
