import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

async function getAuthUser(request: NextRequest) {
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) return null;

    try {
        const { adminAuth } = await import('@/lib/firebase-admin');
        const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
        return decodedToken;
    } catch {
        return null;
    }
}

export async function GET(request: NextRequest) {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'tenant') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const tenantId = user.uid;

        // Get tenant data
        const tenantDoc = await adminDb.collection('tenants').doc(tenantId).get();
        const tenantData = tenantDoc.data();

        if (!tenantData?.currentRoomId) {
            return NextResponse.json({ success: true, data: null });
        }

        // Get room data
        const roomDoc = await adminDb
            .collection('buildings')
            .doc(tenantData.currentBuildingId)
            .collection('rooms')
            .doc(tenantData.currentRoomId)
            .get();

        if (!roomDoc.exists) {
            return NextResponse.json({ success: true, data: null });
        }

        const roomData = roomDoc.data();

        // Get building name
        const buildingDoc = await adminDb
            .collection('buildings')
            .doc(tenantData.currentBuildingId)
            .get();
        const buildingData = buildingDoc.data();

        return NextResponse.json({
            success: true,
            data: {
                id: roomDoc.id,
                ...roomData,
                buildingName: buildingData?.name || 'Unknown Building',
            }
        });
    } catch (error) {
        console.error('Error fetching tenant room:', error);
        return NextResponse.json({ error: 'Failed to fetch room' }, { status: 500 });
    }
}
