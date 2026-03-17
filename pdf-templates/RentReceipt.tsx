import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.ttf', fontWeight: 'normal' },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hjp-Ek-_EeA.ttf', fontWeight: 'bold' },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Inter',
    fontSize: 11,
    color: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  receiptNumber: {
    fontSize: 10,
    color: '#666666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    color: '#666666',
  },
  value: {
    fontWeight: 'bold',
  },
  table: {
    marginTop: 10,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666666',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableCell: {
    fontSize: 10,
  },
  col1: { width: '60%' },
  col2: { width: '40%', textAlign: 'right' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  paidRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
  },
  paidLabel: {
    fontSize: 10,
    color: '#16a34a',
  },
  paidValue: {
    fontSize: 10,
    color: '#16a34a',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 4,
    marginTop: 4,
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#92400e',
  },
  balanceValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#92400e',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#888888',
  },
  paidBadge: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    padding: 4,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

interface LineItem {
  label: string;
  amount: number;
}

interface RentReceiptProps {
  receiptNumber: string;
  date: string;
  tenantName: string;
  buildingName: string;
  roomNumber: string;
  period: string;
  lineItems: LineItem[];
  totalAmount: number;
  paidAmount: number;
  paymentMethod: string;
  transactionId: string;
}

export const RentReceiptPDF = ({
  receiptNumber,
  date,
  tenantName,
  buildingName,
  roomNumber,
  period,
  lineItems,
  totalAmount,
  paidAmount,
  paymentMethod,
  transactionId,
}: RentReceiptProps) => {
  const balance = totalAmount - paidAmount;
  const isPaid = balance <= 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>RentFlow</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.receiptTitle}>Rent Receipt</Text>
            <Text style={styles.receiptNumber}>{receiptNumber}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Receipt Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{date}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Receipt No:</Text>
            <Text style={styles.value}>{receiptNumber}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tenant Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{tenantName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Property:</Text>
            <Text style={styles.value}>{buildingName} - Room {roomNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Period:</Text>
            <Text style={styles.value}>{period}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.col1]}>Description</Text>
              <Text style={[styles.tableHeaderCell, styles.col2]}>Amount (₹)</Text>
            </View>
            {lineItems.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.col1]}>{item.label}</Text>
                <Text style={[styles.tableCell, styles.col2]}>{item.amount.toLocaleString()}</Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{totalAmount.toLocaleString()}</Text>
            </View>
            {paidAmount > 0 && (
              <View style={styles.paidRow}>
                <Text style={styles.paidLabel}>Previously Paid</Text>
                <Text style={styles.paidValue}>-₹{paidAmount.toLocaleString()}</Text>
              </View>
            )}
            {!isPaid && (
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>Balance Due</Text>
                <Text style={styles.balanceValue}>₹{balance.toLocaleString()}</Text>
              </View>
            )}
          </View>
          {isPaid && (
            <View style={styles.paidBadge}>
              <Text>PAID IN FULL</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Payment Method:</Text>
            <Text style={styles.value}>{paymentMethod}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Transaction ID:</Text>
            <Text style={styles.value}>{transactionId}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Generated by RentFlow • {new Date().toLocaleString()}
        </Text>
      </Page>
    </Document>
  );
};

export default RentReceiptPDF;
