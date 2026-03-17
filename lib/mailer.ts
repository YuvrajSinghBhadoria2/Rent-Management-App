import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
    to: string | string[];
    subject: string;
    react: React.ReactElement;
}

export async function sendEmail({ to, subject, react }: SendEmailParams) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY not found. Skipping email send.');
        return { success: false, error: 'API Key missing' };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'RentFlow <notifications@rentflow.in>',
            to,
            subject,
            react,
        });

        if (error) {
            console.error('Resend Error:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Mailer Exception:', error);
        return { success: false, error };
    }
}
