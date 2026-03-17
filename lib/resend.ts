import Resend from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendEmail({
  to,
  subject,
  react,
  text,
}: {
  to: string;
  subject: string;
  react?: React.ReactElement;
  text?: string;
}) {
  if (!resend) {
    console.log('Resend not configured. Would send email to:', to);
    console.log('Subject:', subject);
    return { success: false, error: 'Resend not configured' };
  }

  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'RentFlow <noreply@yourdomain.com>',
      to,
      subject,
      react,
      text,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}

export async function sendTenantInvite({
  to,
  tenantName,
  ownerName,
  inviteLink,
}: {
  to: string;
  tenantName: string;
  ownerName: string;
  inviteLink: string;
}) {
  const { TenantInviteEmail } = await import('@/emails/TenantInvite');
  
  return sendEmail({
    to,
    subject: `You've been added to RentFlow by ${ownerName}`,
    react: TenantInviteEmail({ tenantName, ownerName, inviteLink }),
  });
}

export async function sendNewBill({
  to,
  tenantName,
  month,
  year,
  amount,
  dueDate,
}: {
  to: string;
  tenantName: string;
  month: string;
  year: number;
  amount: number;
  dueDate: string;
}) {
  const { NewBillPublishedEmail } = await import('@/emails/NewBillPublished');
  
  return sendEmail({
    to,
    subject: `Your ${month} ${year} bill is ready - ₹${amount.toLocaleString()}`,
    react: NewBillPublishedEmail({ tenantName, month, year, amount, dueDate }),
  });
}

export async function sendPaymentConfirmation({
  to,
  recipientName,
  amount,
  paymentMethod,
  transactionId,
  billMonth,
  isTenant,
}: {
  to: string;
  recipientName: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  billMonth: string;
  isTenant?: boolean;
}) {
  const { PaymentConfirmationEmail } = await import('@/emails/PaymentConfirmation');
  
  return sendEmail({
    to,
    subject: `Payment of ₹${amount.toLocaleString()} confirmed`,
    react: PaymentConfirmationEmail({
      recipientName,
      amount,
      paymentMethod,
      transactionId,
      billMonth,
      isTenant,
    }),
  });
}

export async function sendRentDueReminder({
  to,
  tenantName,
  amount,
  dueDate,
  daysUntilDue,
}: {
  to: string;
  tenantName: string;
  amount: number;
  dueDate: string;
  daysUntilDue: number;
}) {
  const { RentDueReminderEmail } = await import('@/emails/RentDueReminder');
  
  const subject = daysUntilDue === 0 
    ? `Rent due today - ₹${amount.toLocaleString()}` 
    : daysUntilDue < 0
    ? `Rent overdue - ₹${amount.toLocaleString()}`
    : `Rent due in ${daysUntilDue} days - ₹${amount.toLocaleString()}`;
  
  return sendEmail({
    to,
    subject,
    react: RentDueReminderEmail({ tenantName, amount, dueDate, daysUntilDue }),
  });
}
