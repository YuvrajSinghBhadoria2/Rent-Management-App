import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

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
  if (!user || user.role !== 'owner') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [userDoc, settingsDoc] = await Promise.all([
      adminDb.collection('users').doc(user.uid).get(),
      adminDb.collection('settings').doc(user.uid).get(),
    ]);

    const userData = userDoc.data();
    const settingsData = settingsDoc.data();

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          name: userData?.name || '',
          email: userData?.email || '',
          phone: userData?.phone || null,
        },
        notifications: settingsData?.notifications || {
          emailBills: true,
          emailPayments: true,
          emailComplaints: true,
          pushReminders: true,
        },
        payments: settingsData?.payments || {
          cashfreeEnabled: true,
          phonepeEnabled: true,
          razorpayEnabled: true,
        },
      }
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user || user.role !== 'owner') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { profile, notifications, payments } = body;

    if (profile) {
      await adminDb.collection('users').doc(user.uid).update({
        ...profile,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    if (notifications || payments) {
      const settingsRef = adminDb.collection('settings').doc(user.uid);
      const updateData: any = {};
      
      if (notifications) updateData.notifications = notifications;
      if (payments) updateData.payments = payments;
      
      await settingsRef.set(updateData, { merge: true });
    }

    return NextResponse.json({ success: true, data: { updated: true } });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 });
  }
}
