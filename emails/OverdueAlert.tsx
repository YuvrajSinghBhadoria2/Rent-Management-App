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

interface OverdueAlertProps {
    tenantName?: string;
    amount?: number;
    daysOverdue?: number;
    billLink?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const OverdueAlertEmail = ({
    tenantName = 'Tenant',
    amount = 0,
    daysOverdue = 1,
    billLink = `${baseUrl}/home`,
}: OverdueAlertProps) => {
    return (
        <Html>
            <Head />
            <Preview>URGENT: Your rent is overdue</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={heading}>Payment Overdue</Heading>
                    <Text style={text}>Hi {tenantName},</Text>
                    <Text style={text}>
                        This is a reminder that your rent payment of <strong>₹{amount.toLocaleString()}</strong> is now <strong>{daysOverdue} day(s) overdue</strong>.
                    </Text>
                    <Section style={buttonContainer}>
                        <Link href={billLink} style={button}>
                            Pay Now
                        </Link>
                    </Section>
                    <Text style={text}>
                        Please clear your dues immediately to avoid late fees or penalties.
                    </Text>
                    <Hr style={hr} />
                    <Text style={footer}>RentFlow Notifications</Text>
                </Container>
            </Body>
        </Html>
    );
};

export default OverdueAlertEmail;

const main = { backgroundColor: '#f6f9fc', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif' };
const container = { backgroundColor: '#ffffff', margin: '0 auto', padding: '20px 0 48px', marginBottom: '64px' };
const heading = { fontSize: '24px', fontWeight: 'bold', textAlign: 'center' as const, margin: '30px 0', color: '#dc2626' };
const text = { fontSize: '16px', lineHeight: '26px', color: '#484848', padding: '0 40px' };
const buttonContainer = { textAlign: 'center' as const, margin: '33px 0' };
const button = { backgroundColor: '#2563eb', borderRadius: '3px', color: '#fff', fontSize: '16px', textDecoration: 'none', textAlign: 'center' as const, display: 'block', padding: '12px' };
const hr = { borderColor: '#cccccc', margin: '20px 0' };
const footer = { color: '#8898aa', fontSize: '12px', textAlign: 'center' as const };
