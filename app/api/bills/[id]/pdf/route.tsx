import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import React from 'react';
import { renderToStream } from '@react-pdf/renderer';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const pdfStyles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#333',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
        borderBottomWidth: 2,
        borderBottomColor: '#16a34a',
        paddingBottom: 20,
    },
    brand: {
        fontSize: 24,
        color: '#16a34a',
    },
    title: {
        fontSize: 12,
        marginTop: 5,
        color: '#666',
    },
    statusBadge: {
        backgroundColor: '#dcfce7',
        color: '#166534',
        padding: 5,
        borderRadius: 12,
        fontSize: 10,
        textTransform: 'uppercase',
    },
    grid: {
        flexDirection: 'row',
        gap: 40,
        marginBottom: 40,
    },
    gridCol: {
        flex: 1,
    },
    label: {
        fontSize: 8,
        color: '#999',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    value: {
        fontSize: 10,
    },
    table: {
        marginTop: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#eee',
        overflow: 'hidden',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f9fafb',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tableRow: {
        flexDirection: 'row',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tableTotal: {
        flexDirection: 'row',
        backgroundColor: '#f0fdf4',
        padding: 20,
    },
    colDesc: { flex: 3 },
    colAmt: { flex: 1, textAlign: 'right' },
    footer: {
        marginTop: 60,
        textAlign: 'center',
        color: '#999',
        fontSize: 8,
    }
});

const ReceiptDocument = ({ bill }: { bill: any }) => (
    <Document>
        <Page size="A4" style={pdfStyles.page}>
            <View style={pdfStyles.header}>
                <View>
                    <Text style={pdfStyles.brand}>RentFlow</Text>
                    <Text style={pdfStyles.title}>Payment Settlement Receipt</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={pdfStyles.statusBadge}>Paid</Text>
                    <Text style={{ marginTop: 8, fontSize: 8, color: '#999' }}>
                        ID: RF-{(bill.razorpayPaymentId || bill.id).substring(0, 10).toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={pdfStyles.grid}>
                <View style={pdfStyles.gridCol}>
                    <Text style={pdfStyles.label}>Property Details</Text>
                    <Text style={pdfStyles.value}>{bill.buildingName || 'Building'}</Text>
                    <Text style={pdfStyles.value}>Room {bill.roomNumber || bill.roomId}</Text>
                </View>
                <View style={[pdfStyles.gridCol, { textAlign: 'right' }]}>
                    <Text style={pdfStyles.label}>Billed To</Text>
                    <Text style={pdfStyles.value}>{bill.tenantName || 'Tenant'}</Text>
                    <Text style={pdfStyles.value}>Period: {bill.month} {bill.year}</Text>
                </View>
            </View>

            <View style={pdfStyles.table}>
                <View style={pdfStyles.tableHeader}>
                    <Text style={[pdfStyles.colDesc, pdfStyles.label]}>Description</Text>
                    <Text style={[pdfStyles.colAmt, pdfStyles.label]}>Amount</Text>
                </View>
                <View style={pdfStyles.tableRow}>
                    <Text style={pdfStyles.colDesc}>Monthly Rent ({bill.month} {bill.year})</Text>
                    <Text style={pdfStyles.colAmt}>₹{bill.baseRent.toLocaleString()}</Text>
                </View>
                {bill.lateFee > 0 && (
                    <View style={pdfStyles.tableRow}>
                        <Text style={[pdfStyles.colDesc, { color: '#dc2626' }]}>Late Fees & Penalties</Text>
                        <Text style={[pdfStyles.colAmt, { color: '#dc2626' }]}>₹{bill.lateFee.toLocaleString()}</Text>
                    </View>
                )}
                <View style={pdfStyles.tableTotal}>
                    <Text style={[pdfStyles.colDesc, { fontSize: 14 }]}>Total Amount Paid</Text>
                    <Text style={[pdfStyles.colAmt, { fontSize: 18, color: '#16a34a' }]}>₹{bill.totalAmount.toLocaleString()}</Text>
                </View>
            </View>

            <View style={[pdfStyles.grid, { marginTop: 40 }]}>
                <View style={pdfStyles.gridCol}>
                    <Text style={pdfStyles.label}>Payment Method</Text>
                    <Text style={pdfStyles.value}>{bill.paymentMethod || 'Online'}</Text>
                </View>
                <View style={pdfStyles.gridCol}>
                    <Text style={pdfStyles.label}>Transaction Date</Text>
                    <Text style={pdfStyles.value}>{bill.paidAt ? new Date(bill.paidAt).toLocaleDateString() : '—'}</Text>
                </View>
            </View>

            <View style={pdfStyles.footer}>
                <Text>This is a computer-generated document and does not require a physical signature.</Text>
                <Text style={{ marginTop: 4 }}>Issued by RentFlow Management on behalf of the Property Owner.</Text>
            </View>
        </Page>
    </Document>
);

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
        const billDoc = await adminDb.collection('bills').doc(params.id).get();
        if (!billDoc.exists) {
            return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
        }

        const billData = billDoc.data();

        if (user.role === 'owner' && billData?.ownerId !== user.uid) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        if (user.role === 'tenant' && billData?.tenantId !== user.uid) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const stream = await renderToStream(<ReceiptDocument bill={billData} />);

        return new NextResponse(stream as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Receipt_${billData?.month}_${billData?.year}.pdf"`,
            },
        });
    } catch (error: any) {
        console.error('PDF Generation error:', error);
        return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
    }
}
