import { Resend } from 'resend';
import { FeedbackType } from '@/app/api/model/enums/feedback';
import type { FeedbackRequestDTO, FeedbackEmailParams } from '@/app/api/model/request/feedback';
import type { FeedbackSubmitResponse } from '@/app/api/model/response/feedback';

export { FeedbackType };
export type { FeedbackRequestDTO, FeedbackEmailParams, FeedbackSubmitResponse };

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@jobpatra.in';
const FEEDBACK_TO_EMAIL = process.env.FEEDBACK_TO_EMAIL || 'support@jobpatra.in';

/**
 * Sends user confirmation + admin notification emails concurrently.
 * Uses Promise.allSettled so a failed admin email never breaks the response.
 */
export async function sendFeedbackEmails(params: FeedbackEmailParams): Promise<void> {
  const { userName, userEmail, type, rating, subject, message, pageUrl, submittedAt } = params;

  const typeLabel: Record<string, string> = {
    [FeedbackType.BUG]: '🐛 Bug Report',
    [FeedbackType.FEATURE]: '💡 Feature Request',
    [FeedbackType.GENERAL]: '💬 General Feedback',
    [FeedbackType.COMPLIMENT]: '⭐ Compliment',
  };

  const stars = rating ? '★'.repeat(rating) + '☆'.repeat(5 - rating) : 'Not rated';

  // ── User confirmation ──────────────────────────────────────────────────────
  const userHtml = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #2b1611;">
      <div style="background: #370003; padding: 24px 32px;">
        <h1 style="color: #FFF8EE; font-size: 24px; margin: 0;">JobPatra</h1>
      </div>
      <div style="padding: 32px; background: #FFF8EE; border: 1px solid #E5D9C8;">
        <h2 style="color: #370003; font-size: 22px; margin-top: 0;">
          Thank you for your feedback, ${userName}!
        </h2>
        <p style="color: #564240; font-size: 15px; line-height: 1.6;">
          We received your <strong>${typeLabel[type] ?? type}</strong> and truly appreciate you taking
          the time to share it with us. Our team reviews every submission and uses your input to make
          JobPatra better for everyone.
        </p>
        <div style="background: #fff; border: 1px solid #E5D9C8; border-left: 4px solid #370003;
                    padding: 16px 20px; margin: 24px 0; border-radius: 4px;">
          <p style="margin: 0; color: #564240; font-size: 14px; font-style: italic;">
            "${message}"
          </p>
        </div>
        <p style="color: #564240; font-size: 14px;">
          If you need to follow up or have more to share, just reply to this email.
        </p>
        <p style="color: #564240; font-size: 14px; margin-bottom: 0;">
          — The JobPatra Team
        </p>
      </div>
      <div style="padding: 16px 32px; background: #fff0ee; text-align: center;">
        <p style="color: #8a716f; font-size: 12px; margin: 0;">
          © 2026 JobPatra. Elevating professional storytelling through the digital nib.
        </p>
      </div>
    </div>
  `;

  // ── Admin notification ─────────────────────────────────────────────────────
  const adminHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #2b1611;">
      <div style="background: #370003; padding: 20px 32px;">
        <h1 style="color: #FFF8EE; font-size: 20px; margin: 0;">
          New Feedback — ${typeLabel[type] ?? type}
        </h1>
      </div>
      <div style="padding: 32px; background: #FFF8EE; border: 1px solid #E5D9C8;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 8px 12px; background: #fff0ee; font-weight: bold; width: 140px; border: 1px solid #E5D9C8;">User</td>
            <td style="padding: 8px 12px; border: 1px solid #E5D9C8;">${userName} &lt;${userEmail}&gt;</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; background: #fff0ee; font-weight: bold; border: 1px solid #E5D9C8;">Type</td>
            <td style="padding: 8px 12px; border: 1px solid #E5D9C8;">${typeLabel[type] ?? type}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; background: #fff0ee; font-weight: bold; border: 1px solid #E5D9C8;">Rating</td>
            <td style="padding: 8px 12px; border: 1px solid #E5D9C8;">${stars}</td>
          </tr>
          ${
            subject
              ? `
          <tr>
            <td style="padding: 8px 12px; background: #fff0ee; font-weight: bold; border: 1px solid #E5D9C8;">Subject</td>
            <td style="padding: 8px 12px; border: 1px solid #E5D9C8;">${subject}</td>
          </tr>
          `
              : ''
          }
          <tr>
            <td style="padding: 8px 12px; background: #fff0ee; font-weight: bold; border: 1px solid #E5D9C8;">Message</td>
            <td style="padding: 8px 12px; border: 1px solid #E5D9C8; white-space: pre-wrap;">${message}</td>
          </tr>
          ${
            pageUrl
              ? `
          <tr>
            <td style="padding: 8px 12px; background: #fff0ee; font-weight: bold; border: 1px solid #E5D9C8;">Page URL</td>
            <td style="padding: 8px 12px; border: 1px solid #E5D9C8;">${pageUrl}</td>
          </tr>
          `
              : ''
          }
          <tr>
            <td style="padding: 8px 12px; background: #fff0ee; font-weight: bold; border: 1px solid #E5D9C8;">Submitted</td>
            <td style="padding: 8px 12px; border: 1px solid #E5D9C8;">${submittedAt.toISOString()}</td>
          </tr>
        </table>
      </div>
    </div>
  `;

  await Promise.allSettled([
    resend.emails.send({
      from: `JobPatra <${FEEDBACK_TO_EMAIL}>`,
      to: userEmail,
      subject: `Thank you for your feedback, ${userName}!`,
      html: userHtml,
    }),
    resend.emails.send({
      from: `JobPatra Feedback <${FROM_EMAIL}>`,
      to: FEEDBACK_TO_EMAIL,
      subject: `[Feedback] ${type} from ${userName}`,
      html: adminHtml,
    }),
  ]);
}
