import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Table,
  Row,
  Cell,
} from '@react-email/components';
import * as React from 'react';

interface NewBillPublishedProps {
  tenantName?: string;
  month?: string;
  year?: number;
  amount?: number;
  dueDate?: string;
  billLink?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const NewBillPublishedEmail = ({
  tenantName = 'Tenant',
  month = 'January',
  year = 2025,
  amount = 10000,
  dueDate = '5th',
  billLink = `${baseUrl}/bills`,
}: NewBillPublishedProps) => {
  const previewText = `Your ${month} ${year} bill is ready - ₹${amount}`;

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
          <Heading style={heading}>New Bill Generated</Heading>
          <Text style={text}>
            Hi {tenantName},
          </Text>
          <Text style={text}>
            Your rent bill for <strong>{month} {year}</strong> has been generated.
          </Text>

          <Table style={amountTable}>
            <Row>
              <Cell style={amountLabel}>Amount Due</Cell>
              <Cell style={amountValue}>₹{amount.toLocaleString()}</Cell>
            </Row>
            <Row>
              <Cell style={amountLabel}>Due Date</Cell>
              <Cell style={amountValue}>{dueDate} of each month</Cell>
            </Row>
          </Table>

          <Section style={buttonContainer}>
            <Link href={billLink} style={button}>
              View Bill
            </Link>
          </Section>

          <Text style={text}>
            Please make your payment by the due date to avoid late fees.
          </Text>

          <Hr style={hr} />
          <Text style={footer}>
            RentFlow - Rental Management Made Simple
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default NewBillPublishedEmail;

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
  color: '#1a1a1a',
  textAlign: 'center' as const,
  margin: '30px 0',
};

const text = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#1a1a1a',
  margin: '16px 0',
};

const amountTable = {
  width: '100%',
  margin: '24px 0',
  borderCollapse: 'collapse' as const,
};

const amountLabel = {
  padding: '12px',
  fontSize: '16px',
  color: '#666666',
  borderBottom: '1px solid #e6e6e6',
};

const amountValue = {
  padding: '12px',
  fontSize: '16px',
  fontWeight: '600',
  textAlign: 'right' as const,
  borderBottom: '1px solid #e6e6e6',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '500',
  textDecoration: 'none',
  display: 'inline-block',
  padding: '14px 28px',
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
