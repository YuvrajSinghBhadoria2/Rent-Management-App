import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

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

export async function POST(request: NextRequest) {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'owner') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { buildingIds, title, message } = await request.json();

        if (!buildingIds || buildingIds.length === 0 || !title || !message) {
            return NextResponse.json({ error: 'Missing broadcast details' }, { status: 400 });
        }

        // 1. Fetch all tenants in selected buildings
        let tenantIds: string[] = [];

        for (const bId of buildingIds) {
            const leasesSnap = await adminDb.collection('leases')
                .where('buildingId', '==', bId)
                .where('status', '==', 'active')
                .get();

            leasesSnap.forEach(doc => {
                tenantIds.push(doc.data().tenantId);
            });
        }

        // Remove duplicates
        tenantIds = Array.from(new Set(tenantIds));

        // 2. Create broadcast record
        const broadcastRef = await adminDb.collection('broadcastMessages').add({
            ownerId: user.uid,
            buildingIds,
            title,
            message,
            tenantCount: tenantIds.length,
            createdAt: FieldValue.serverTimestamp(),
        });

        // 3. Create notifications for each tenant
        const batch = adminDb.batch();
        tenantIds.forEach(tId => {
            const notifRef = adminDb.collection('notifications').doc();
            batch.set(notifRef, {
                userId: tId,
                type: 'broadcast',
                title,
                message,
                isRead: false,
                link: `/broadcasts/${broadcastRef.id}`, // Optional link
                createdAt: FieldValue.serverTimestamp(),
            });
        });

        await batch.commit();

        return NextResponse.json({
            success: true,
            message: `Broadcast successfully sent to ${tenantIds.length} tenants`
        });
    } catch (error: any) {
        console.error('Broadcast Error:', error);
        return NextResponse.json({ error: 'Failed to send broadcast' }, { status: 500 });
    }
}
