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
    padding: 50,
    fontFamily: 'Inter',
    fontSize: 11,
    color: '#1a1a1a',
    lineHeight: 1.6,
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    textDecoration: 'underline',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: 140,
  },
  value: {
    flex: 1,
    fontWeight: 'bold',
  },
  terms: {
    marginBottom: 8,
    textAlign: 'justify',
  },
  termsNumber: {
    width: 20,
    fontWeight: 'bold',
  },
  termsText: {
    flex: 1,
  },
  signatureBlock: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '45%',
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    marginBottom: 8,
    paddingBottom: 4,
  },
  signatureLabel: {
    fontSize: 10,
    color: '#666666',
  },
  dateLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    width: 100,
    marginBottom: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: 'center',
    fontSize: 9,
    color: '#888888',
  },
});

interface LeaseAgreementProps {
  agreementDate: string;
  landlordName: string;
  landlordAddress: string;
  landlordPhone: string;
  tenantName: string;
  tenantAddress: string;
  tenantPhone: string;
  idType: string;
  idNumber: string;
  propertyAddress: string;
  roomNumber: string;
  floorNumber: string;
  rentStartDate: string;
  monthlyRent: number;
  securityDeposit: number;
  lockInMonths: number;
  noticePeriodDays: number;
  dueDateDay: number;
}

export const LeaseAgreementPDF = ({
  agreementDate,
  landlordName,
  landlordAddress,
  landlordPhone,
  tenantName,
  tenantAddress,
  tenantPhone,
  idType,
  idNumber,
  propertyAddress,
  roomNumber,
  floorNumber,
  rentStartDate,
  monthlyRent,
  securityDeposit,
  lockInMonths,
  noticePeriodDays,
  dueDateDay,
}: LeaseAgreementProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>RESIDENTIAL RENTAL AGREEMENT</Text>
          <Text style={styles.subtitle}>This Agreement is made on {agreementDate}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. PARTIES</Text>
          <Text style={{ marginBottom: 10 }}>This Rental Agreement (&quot;Agreement&quot;) is entered into between:</Text>
          <View style={styles.row}>
            <Text style={styles.label}>LANDLORD:</Text>
            <Text style={styles.value}>{landlordName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>{landlordAddress}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{landlordPhone}</Text>
          </View>
          <View style={{ marginTop: 10 }}>
            <Text style={styles.row}>
              <Text style={styles.label}>TENANT:</Text>
              <Text style={styles.value}>{tenantName}</Text>
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>{tenantAddress}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{tenantPhone}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>ID Proof:</Text>
            <Text style={styles.value}>{idType}: {idNumber}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. PROPERTY</Text>
          <Text style={{ marginBottom: 10 }}>The Landlord agrees to rent to the Tenant the following property:</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>{propertyAddress}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Room No.:</Text>
            <Text style={styles.value}>{roomNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Floor:</Text>
            <Text style={styles.value}>{floorNumber}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. TERMS AND CONDITIONS</Text>
          
          <View style={styles.terms}>
            <Text style={styles.termsNumber}>3.1</Text>
            <Text style={styles.termsText}> <Text style={styles.value}>Rent Commencement:</Text> The tenancy shall commence on {rentStartDate}.</Text>
          </View>
          
          <View style={styles.terms}>
            <Text style={styles.termsNumber}>3.2</Text>
            <Text style={styles.termsText}> <Text style={styles.value}>Monthly Rent:</Text> The Tenant agrees to pay ₹{monthlyRent.toLocaleString()} ({monthlyRent} rupees) per month, due by the {dueDateDay}th of each month.</Text>
          </View>
          
          <View style={styles.terms}>
            <Text style={styles.termsNumber}>3.3</Text>
            <Text style={styles.termsText}> <Text style={styles.value}>Security Deposit:</Text> A refundable security deposit of ₹{securityDeposit.toLocaleString()} ({securityDeposit} rupees) has been paid by the Tenant.</Text>
          </View>
          
          <View style={styles.terms}>
            <Text style={styles.termsNumber}>3.4</Text>
            <Text style={styles.termsText}> <Text style={styles.value}>Lock-in Period:</Text> Both parties agree to a lock-in period of {lockInMonths} months. Early termination during this period shall attract penalty as per terms.</Text>
          </View>
          
          <View style={styles.terms}>
            <Text style={styles.termsNumber}>3.5</Text>
            <Text style={styles.termsText}> <Text style={styles.value}>Notice Period:</Text> Either party may terminate this agreement by giving {noticePeriodDays} days written notice after the lock-in period.</Text>
          </View>
          
          <View style={styles.terms}>
            <Text style={styles.termsNumber}>3.6</Text>
            <Text style={styles.termsText}> <Text style={styles.value}>Late Payment:</Text> Rent paid after the due date shall attract a late fee as per the Landlord&apos;s policy.</Text>
          </View>
          
          <View style={styles.terms}>
            <Text style={styles.termsNumber}>3.7</Text>
            <Text style={styles.termsText}> <Text style={styles.value}>Subletting:</Text> The Tenant shall not sublet or transfer the premises without written consent from the Landlord.</Text>
          </View>
          
          <View style={styles.terms}>
            <Text style={styles.termsNumber}>3.8</Text>
            <Text style={styles.termsText}> <Text style={styles.value}>Maintenance:</Text> The Tenant shall maintain the premises in good condition and shall be responsible for any damages beyond normal wear and tear.</Text>
          </View>
        </View>

        <View style={styles.signatureBlock}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>LANDLORD</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Date: _____________</Text>
            <Text style={{ marginTop: 5 }}>{landlordName}</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>TENANT</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Date: _____________</Text>
            <Text style={{ marginTop: 5 }}>{tenantName}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Generated by RentFlow • Rental Management Made Simple
        </Text>
      </Page>
    </Document>
  );
};

export default LeaseAgreementPDF;
