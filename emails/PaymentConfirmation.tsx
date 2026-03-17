import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface PaymentConfirmationProps {
  recipientName?: string;
  amount?: number;
  paymentMethod?: string;
  transactionId?: string;
  billMonth?: string;
  receiptLink?: string;
  isTenant?: boolean;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const PaymentConfirmationEmail = ({
  recipientName = 'User',
  amount = 10000,
  paymentMethod = 'Online',
  transactionId = 'TXN123456',
  billMonth = 'January 2025',
  receiptLink = `${baseUrl}/bills`,
  isTenant = true,
}: PaymentConfirmationProps) => {
  const previewText = `Payment of ₹${amount.toLocaleString()} confirmed`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src={`${baseUrl}/logo.png`}
            width="40"
            height="40"
            alt="RentFlow"
            style={logo}
          />
          <Heading style={heading}>Payment Confirmed!</Heading>
          <Text style={text}>
            Hi {recipientName},
          </Text>
          <Text style={text}>
            Your payment of <strong>₹{amount.toLocaleString()}</strong> for {billMonth} has been successfully processed.
          </Text>

          <Section style={detailsSection}>
            <Text style={detailLabel}>
              Amount: <strong>₹{amount.toLocaleString()}</strong>
            </Text>
            <Text style={detailLabel}>
              Payment Method: <strong>{paymentMethod}</strong>
            </Text>
            <Text style={detailLabel}>
              Transaction ID: <strong>{transactionId}</strong>
            </Text>
            <Text style={detailLabel}>
              Period: <strong>{billMonth}</strong>
            </Text>
          </Section>

          {isTenant && (
            <Text style={text}>
              Thank you for your payment! Your rent is now cleared for this month.
            </Text>
          )}

          <Hr style={hr} />
          <Text style={footer}>
            RentFlow - Rental Management Made Simple
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default PaymentConfirmationEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 0',
  maxWidth: '600px',
};

const logo = {
  margin: '0 auto',
  display: 'block',
};

const heading = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#16a34a',
  textAlign: 'center' as const,
  margin: '30px 0',
};

const text = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#1a1a1a',
  margin: '16px 0',
};

const detailsSection = {
  backgroundColor: '#f9fafb',
  padding: '20px',
  borderRadius: '8px',
  margin: '24px 0',
};

const detailLabel = {
  fontSize: '14px',
  color: '#666666',
  margin: '8px 0',
};

const hr = {
  border: 'none',
  borderTop: '1px solid #e6e6e6',
  margin: '30px 0',
};

const footer = {
  fontSize: '14px',
  color: '#888888',
  textAlign: 'center' as const,
  margin: '0',
};
