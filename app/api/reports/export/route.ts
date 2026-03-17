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

export async function GET(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user || user.role !== 'owner') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));
    const buildingId = searchParams.get('buildingId') || null;

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const billsQuery = adminDb.collection('bills')
      .where('ownerId', '==', user.uid)
      .where('year', '==', year)
      .where('month', '==', month);

    const billsSnapshot = await billsQuery.get();
    const bills = billsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    const paymentsQuery = adminDb.collection('payments')
      .where('ownerId', '==', user.uid)
      .where('paidAt', '>=', adminDb.Timestamp.fromDate(startOfMonth))
      .where('paidAt', '<=', adminDb.Timestamp.fromDate(endOfMonth));

    const paymentsSnapshot = await paymentsQuery.get();
    const payments = paymentsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    const reportData = bills.map(bill => {
      const billPayments = payments.filter(p => p.billId === bill.id);
      const totalPaid = billPayments.reduce((sum, p) => sum + p.amount, 0);
      
      return {
        'S.No': bills.indexOf(bill) + 1,
        'Tenant Name': bill.tenantName || '',
        'Building': bill.buildingName || '',
        'Room': bill.roomNumber || '',
        'Month': `${monthNames[month - 1]} ${year}`,
        'Total Amount': bill.totalAmount || 0,
        'Paid Amount': totalPaid,
        'Balance': (bill.totalAmount || 0) - totalPaid,
        'Status': bill.status || 'unpaid',
      };
    });

    if (format === 'excel') {
      const XLSX = require('xlsx');
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(reportData);
      
      ws['!cols'] = [
        { wch: 5 },
        { wch: 20 },
        { wch: 20 },
        { wch: 10 },
        { wch: 15 },
        { wch: 12 },
        { wch: 12 },
        { wch: 10 },
        { wch: 10 },
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Collection Report');
      
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="collection-report-${monthNames[month-1]}-${year}.xlsx"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        month: monthNames[month - 1],
        year,
        report: reportData,
        summary: {
          totalBills: bills.length,
          totalAmount: bills.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
          totalPaid: payments.reduce((sum, p) => sum + p.amount, 0),
          totalBalance: bills.reduce((sum, b) => {
            const billPayments = payments.filter(p => p.billId === b.id);
            const paid = billPayments.reduce((s, p) => s + p.amount, 0);
            return sum + ((b.totalAmount || 0) - paid);
          }, 0),
        },
      },
    });
  } catch (error) {
    console.error('Error generating export:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate export' }, { status: 500 });
  }
}
