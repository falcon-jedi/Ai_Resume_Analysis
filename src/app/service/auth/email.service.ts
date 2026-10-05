import { Resend } from 'resend';
import { Currency } from '@/app/api/model/enums/currency';
import { BillingPeriod } from '@/app/api/model/enums/subscription';
import type { SendInvoiceEmailParams } from '@/app/api/model/request/payments/invoice';

export { Currency, BillingPeriod };
export type { SendInvoiceEmailParams };

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@jobpatra.in';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Send email verification link to a new user.
 */
export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: `JobPatra <${FROM_EMAIL}>`,
    to: email,
    subject: 'Verify your email address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verify Your Email</h2>
        <p>Click the button below to verify your email address:</p>
        <a href="${verifyUrl}"
           style="display: inline-block; padding: 12px 24px; background-color: #4F46E5;
                  color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Verify Email
        </a>
        <p style="color: #6B7280; font-size: 14px;">
          This link expires in 1 hour. If you didn't create an account, ignore this email.
        </p>
        <p style="color: #9CA3AF; font-size: 12px;">
          If the button doesn't work, copy and paste this URL:<br/>
          ${verifyUrl}
        </p>
      </div>
    `,
  });
}

/**
 * Send password reset link.
 */
export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${APP_URL}/app/reset-password?token=${token}`;

  await resend.emails.send({
    from: `JobPatra <${FROM_EMAIL}>`,
    to: email,
    subject: 'Reset your password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset Your Password</h2>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}"
           style="display: inline-block; padding: 12px 24px; background-color: #4F46E5;
                  color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #6B7280; font-size: 14px;">
          This link expires in 1 hour. If you didn't request a password reset, ignore this email.
        </p>
        <p style="color: #9CA3AF; font-size: 12px;">
          If the button doesn't work, copy and paste this URL:<br/>
          ${resetUrl}
        </p>
      </div>
    `,
  });
}

/**
 * Send payment confirmation + invoice download email.
 * Called by the cron job after the PDF has been generated and stored.
 */
export async function sendInvoiceEmail({
  email,
  userName,
  invoiceNumber,
  planName,
  amount,
  currency,
  billingPeriod,
  periodStart,
  periodEnd,
  invoiceId,
}: SendInvoiceEmailParams): Promise<void> {
  const downloadUrl = `${APP_URL}/api/invoice/${invoiceId}/download`;

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(n);

  const fmtDate = (d: Date) =>
    d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const greeting = userName ? `Hi ${userName},` : 'Hi there,';
  const periodLabel = billingPeriod === 'QUARTERLY' ? 'Quarterly' : 'Monthly';

  await resend.emails.send({
    from: `JobPatra <${FROM_EMAIL}>`,
    to: email,
    subject: `Your JobPatra invoice ${invoiceNumber} — ${planName} ${periodLabel}`,
    html: `
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">

        <!-- Header -->
        <div style="background:#5b060c;padding:32px 40px;text-align:center;">
          <div style="color:#fff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">JobPatra</div>
          <div style="color:#ddc0bd;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin-top:4px;">AI Career Workshop</div>
        </div>

        <!-- Body -->
        <div style="padding:40px;">
          <p style="font-size:16px;color:#2b1611;margin-bottom:24px;">${greeting}</p>
          <p style="font-size:15px;color:#564240;margin-bottom:32px;line-height:1.6;">
            Thank you for your subscription! Your <strong>${planName} ${periodLabel}</strong> plan is now active.
            Your invoice is ready to download below.
          </p>

          <!-- Invoice Box -->
          <div style="background:#fff8f6;border:1px solid #f3eae1;border-radius:4px;padding:24px;margin-bottom:32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:12px;color:#8a716f;letter-spacing:0.1em;text-transform:uppercase;padding-bottom:4px;">Invoice Number</td>
                <td style="text-align:right;font-size:13px;font-weight:600;color:#2b1611;">${invoiceNumber}</td>
              </tr>
              <tr>
                <td style="font-size:12px;color:#8a716f;letter-spacing:0.1em;text-transform:uppercase;padding:6px 0 4px;">Plan</td>
                <td style="text-align:right;font-size:13px;color:#564240;">${planName} (${periodLabel})</td>
              </tr>
              <tr>
                <td style="font-size:12px;color:#8a716f;letter-spacing:0.1em;text-transform:uppercase;padding:6px 0 4px;">Period</td>
                <td style="text-align:right;font-size:13px;color:#564240;">${fmtDate(periodStart)} – ${fmtDate(periodEnd)}</td>
              </tr>
              <tr>
                <td colspan="2"><div style="height:1px;background:#ddc0bd;margin:12px 0;"></div></td>
              </tr>
              <tr>
                <td style="font-size:14px;font-weight:700;color:#2b1611;">Amount Paid</td>
                <td style="text-align:right;font-size:16px;font-weight:700;color:#5b060c;">${fmt(amount)}</td>
              </tr>
            </table>
          </div>

          <!-- CTA -->
          <div style="text-align:center;margin-bottom:32px;">
            <a href="${downloadUrl}"
               style="display:inline-block;padding:14px 32px;background:#5b060c;color:#fff;
                      text-decoration:none;font-size:14px;font-weight:600;letter-spacing:0.05em;">
              Download Invoice PDF
            </a>
          </div>

          <p style="font-size:13px;color:#8a716f;line-height:1.6;margin-bottom:8px;">
            If the button doesn't work, copy and paste this URL:<br/>
            <a href="${downloadUrl}" style="color:#5b060c;word-break:break-all;">${downloadUrl}</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="background:#fff8f6;border-top:1px solid #f3eae1;padding:24px 40px;text-align:center;">
          <p style="font-size:12px;color:#8a716f;margin:0;">
            JobPatra &bull; support@jobpatra.in &bull; jobpatra.in
          </p>
          <p style="font-size:11px;color:#b0908e;margin-top:6px;">
            You received this email because you made a purchase on JobPatra.
          </p>
        </div>

      </div>
    `,
  });
}
