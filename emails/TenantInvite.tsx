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
} from '@react-email/components';
import * as React from 'react';

interface TenantInviteProps {
  tenantName?: string;
  ownerName?: string;
  inviteLink?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const TenantInviteEmail = ({
  tenantName = 'Tenant',
  ownerName = 'Owner',
  inviteLink = `${baseUrl}/invite/abc123`,
}: TenantInviteProps) => {
  const previewText = `You've been added to RentFlow by ${ownerName}`;

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
          <Heading style={heading}>Welcome to RentFlow!</Heading>
          <Text style={text}>
            Hi {tenantName},
          </Text>
          <Text style={text}>
            {ownerName} has added you as a tenant on RentFlow. You can now view your rent bills, make payments, and raise maintenance requests all in one place.
          </Text>
          <Section style={buttonContainer}>
            <Link href={inviteLink} style={button}>
              Set Your Password
            </Link>
          </Section>
          <Text style={text}>
            This link will expire in 72 hours. If you didn&apos;t expect this email, please ignore it.
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

export default TenantInviteEmail;

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
  textAlign: 'center' as const,
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
