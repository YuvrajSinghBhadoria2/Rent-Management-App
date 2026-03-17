import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Button,
} from '@react-email/components';
import * as React from 'react';

interface RentDueReminderProps {
  tenantName?: string;
  amount?: number;
  dueDate?: string;
  daysUntilDue?: number;
  billLink?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const RentDueReminderEmail = ({
  tenantName = 'Tenant',
  amount = 10000,
  dueDate = '5th',
  daysUntilDue = 3,
  billLink = `${baseUrl}/bills`,
}: RentDueReminderProps) => {
  const previewText = daysUntilDue === 0 
    ? `Rent due today - ₹${amount.toLocaleString()}` 
    : `Rent due in ${daysUntilDue} days - ₹${amount.toLocaleString()}`;

  const isUrgent = daysUntilDue === 0 || daysUntilDue < 0;

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
          <Heading style={isUrgent ? headingUrgent : heading}>
            {isUrgent ? 'Rent Due Today!' : 'Rent Due Reminder'}
          </Heading>
          <Text style={text}>
            Hi {tenantName},
          </Text>
          <Text style={text}>
            This is a friendly reminder that your rent payment of <strong>₹{amount.toLocaleString()}</strong> is due on the <strong>{dueDate}</strong> of this month.
          </Text>

          {daysUntilDue > 0 && (
            <Section style={daysSection}>
              <Text style={daysText}>
                {daysUntilDue} {daysUntilDue === 1 ? 'day' : 'days'} remaining
              </Text>
            </Section>
          )}

          {daysUntilDue <= 0 && (
            <Section style={urgentSection}>
              <Text style={urgentText}>
                Please make your payment as soon as possible to avoid late fees.
              </Text>
            </Section>
          )}

          <Section style={buttonContainer}>
            <Button href={billLink} style={button}>
              Pay Now
            </Button>
          </Section>

          <Text style={text}>
            You can view and pay your bill through the RentFlow portal.
          </Text>

          <Text style={footer}>
            RentFlow - Rental Management Made Simple
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default RentDueReminderEmail;

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

const headingUrgent = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#dc2626',
  textAlign: 'center' as const,
  margin: '30px 0',
};

const text = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#1a1a1a',
  margin: '16px 0',
};

const daysSection = {
  backgroundColor: '#fef3c7',
  padding: '16px',
  borderRadius: '8px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const daysText = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#92400e',
  margin: '0',
};

const urgentSection = {
  backgroundColor: '#fee2e2',
  padding: '16px',
  borderRadius: '8px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const urgentText: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: '500',
  color: '#dc2626',
  margin: '0',
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

const footer: React.CSSProperties = {
  fontSize: '14px',
  color: '#888888',
  textAlign: 'center' as const,
  margin: '0',
};
