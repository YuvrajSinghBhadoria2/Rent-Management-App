import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { renderToBuffer } from '@react-pdf/renderer';
import { TenantLedgerPDF } from '@/pdf-templates/TenantLedger';
import React from 'react';

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
        const tenantId = params.id;

        // Check authorization: Owner or the Tenant themselves
        if (user.role !== 'owner' && user.uid !== tenantId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const tenantDoc = await adminDb.collection('tenants').doc(tenantId).get();
        if (!tenantDoc.exists) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }
        const tenant = tenantDoc.data()!;

        // 1. Fetch Bills (Debits)
        const billsSnap = await adminDb.collection('bills')
            .where('tenantId', '==', tenantId)
            .orderBy('createdAt', 'asc')
            .get();

        // 2. Fetch Payments (Credits)
        const paymentsSnap = await adminDb.collection('payments')
            .where('tenantId', '==', tenantId)
            .orderBy('createdAt', 'asc')
            .get();

        const entries: any[] = [];
        let totalDue = 0;

        billsSnap.forEach(doc => {
            const bill = doc.data();
            totalDue += bill.totalAmount;
            entries.push({
                date: bill.createdAt?.toDate ? bill.createdAt.toDate().toLocaleDateString() : 'N/A',
                description: `Bill for ${bill.month}/${bill.year}`,
                amount: bill.totalAmount,
                type: 'debit',
                timestamp: bill.createdAt?.toMillis() || 0
            });
        });

        paymentsSnap.forEach(doc => {
            const payment = doc.data();
            totalDue -= payment.amount;
            entries.push({
                date: payment.createdAt?.toDate ? payment.createdAt.toDate().toLocaleDateString() : 'N/A',
                description: `Payment (${payment.method})`,
                amount: payment.amount,
                type: 'credit',
                timestamp: payment.createdAt?.toMillis() || 0
            });
        });

        // Sort combined entries by timestamp
        entries.sort((a, b) => a.timestamp - b.timestamp);

        const buffer = await renderToBuffer(
            <TenantLedgerPDF
                tenantName={tenant.name || 'Tenant'}
                roomNumber={tenant.roomNumber || 'N/A'}
                buildingName={tenant.currentBuildingName || 'N/A'}
                entries={entries}
                totalDue={totalDue}
            />
        );

        return new Response(new Uint8Array(buffer), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Ledger_${tenant.name}.pdf"`,
            },
        });
    } catch (error) {
        console.error('Ledger PDF Error:', error);
        return NextResponse.json({ error: 'Failed to generate ledger' }, { status: 500 });
    }
}
