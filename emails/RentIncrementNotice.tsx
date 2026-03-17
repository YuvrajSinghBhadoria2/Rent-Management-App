import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Text,
} from '@react-email/components';
import * as React from 'react';

interface RentIncrementNoticeProps {
    tenantName?: string;
    newAmount?: number;
    effectiveDate?: string;
}

export const RentIncrementNoticeEmail = ({
    tenantName = 'Tenant',
    newAmount = 0,
    effectiveDate = '',
}: RentIncrementNoticeProps) => {
    return (
        <Html>
            <Head />
            <Preview>Important: Notice of Rent Revision</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={heading}>Rent Revision Notice</Heading>
                    <Text style={text}>Hi {tenantName},</Text>
                    <Text style={text}>
                        This is to inform you that your monthly rent has been revised. The new rent of <strong>₹{newAmount.toLocaleString()}</strong> will be effective from <strong>{effectiveDate}</strong>.
                    </Text>
                    <Text style={text}>
                        All subsequent bills generated after this date will reflect the new amount.
                    </Text>
                    <Hr style={hr} />
                    <Text style={footer}>RentFlow Team</Text>
                </Container>
            </Body>
        </Html>
    );
};

export default RentIncrementNoticeEmail;

const main = { backgroundColor: '#f6f9fc', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif' };
const container = { backgroundColor: '#ffffff', margin: '0 auto', padding: '20px 0 48px' };
const heading = { fontSize: '24px', fontWeight: 'bold', textAlign: 'center' as const, margin: '30px 0', color: '#1a1a1a' };
const text = { fontSize: '16px', lineHeight: '26px', color: '#484848', padding: '0 40px' };
const hr = { borderColor: '#cccccc', margin: '20px 0' };
const footer = { color: '#8898aa', fontSize: '12px', textAlign: 'center' as const };
