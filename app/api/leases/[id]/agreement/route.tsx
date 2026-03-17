import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { renderToBuffer } from '@react-pdf/renderer';
import { LeaseAgreementPDF } from '@/pdf-templates/LeaseAgreement';
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
        const leaseId = params.id;
        const leaseDoc = await adminDb.collection('leases').doc(leaseId).get();

        if (!leaseDoc.exists) {
            return NextResponse.json({ error: 'Lease not found' }, { status: 404 });
        }

        const lease = leaseDoc.data()!;

        // Check authorization: Owner or the Tenant themselves
        if (user.role !== 'owner' && user.uid !== lease.tenantId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch Owner/Building info
        const ownerDoc = await adminDb.collection('users').doc(lease.ownerId).get();
        const owner = ownerDoc.data()!;

        // In a real app, you'd fetch building details too for address
        const buildingDoc = await adminDb.collection('buildings').doc(lease.buildingId).get();
        const building = buildingDoc.data()!;

        // Fetch Tenant profile details
        const tenantDoc = await adminDb.collection('tenants').doc(lease.tenantId).get();
        const tenant = tenantDoc.data()!;

        const buffer = await renderToBuffer(
            <LeaseAgreementPDF
                agreementDate={lease.createdAt?.toDate ? lease.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString()}
                landlordName={owner.name}
                landlordAddress={building.address || 'N/A'}
                landlordPhone={owner.phone || 'N/A'}
                tenantName={lease.tenantName}
                tenantAddress={tenant.permanentAddress || 'N/A'}
                tenantPhone={tenant.phone || 'N/A'}
                idType={tenant.idType || 'ID'}
                idNumber={tenant.idNumber || 'N/A'}
                propertyAddress={building.address || 'N/A'}
                roomNumber={lease.roomNumber}
                floorNumber="N/A"
                rentStartDate={lease.startDate?.toDate ? lease.startDate.toDate().toLocaleDateString() : 'N/A'}
                monthlyRent={lease.rentAmount}
                securityDeposit={lease.securityDeposit}
                lockInMonths={lease.lockInMonths}
                noticePeriodDays={lease.noticePeriodDays}
                dueDateDay={building.dueDateDay || 5}
            />
        );

        return new Response(new Uint8Array(buffer), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="LeaseAgreement_${lease.roomNumber}.pdf"`,
            },
        });
    } catch (error) {
        console.error('Agreement PDF Error:', error);
        return NextResponse.json({ error: 'Failed to generate agreement' }, { status: 500 });
    }
}
