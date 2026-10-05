import { NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';
import { generateInvoicePdf } from '@/app/service/subscription/invoice.service';
import { sendInvoiceEmail } from '@/app/service/auth/email.service';

const MAX_ATTEMPTS = 3;
const BATCH_SIZE = 5;

/**
 * GET /api/cron/process-invoice-jobs
 *
 * Secured background job processor — called by VPS cron every minute:
 *   * * * * * curl -s -H "x-cron-secret: $CRON_SECRET" https://yourdomain.com/api/cron/process-invoice-jobs
 *
 * Flow per job:
 *   1. Mark job as "processing"
 *   2. Generate PDF via Puppeteer and store bytes in Invoice.pdfData
 *   3. Send invoice email via Resend
 *   4. Mark job as "completed"
 *   On error: increment attempts; mark "failed" if max attempts exceeded
 */
export async function GET(request: Request) {
  // ── Security: validate cron secret ───────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const incoming = request.headers.get('x-cron-secret');
    if (incoming !== cronSecret) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
  }

  // ── Fetch pending jobs ────────────────────────────────────────────────────
  const jobs = await prisma.backgroundJob.findMany({
    where: {
      type: 'GENERATE_INVOICE_PDF',
      status: 'pending',
      attempts: { lt: MAX_ATTEMPTS },
    },
    orderBy: { createdAt: 'asc' },
    take: BATCH_SIZE,
  });

  if (jobs.length === 0) {
    return NextResponse.json({ success: true, processed: 0 });
  }

  const results: Array<{ jobId: string; status: 'completed' | 'failed'; error?: string }> = [];

  for (const job of jobs) {
    // Claim the job atomically — mark as processing
    await prisma.backgroundJob.update({
      where: { id: job.id },
      data: { status: 'processing', attempts: { increment: 1 } },
    });

    try {
      const payload = job.payload as { invoiceId: string; userId: string };
      const { invoiceId } = payload;

      // 1. Generate PDF and store in DB
      await generateInvoicePdf(invoiceId);

      // 2. Fetch invoice + user to send email
      const invoice = await prisma.invoice.findUniqueOrThrow({
        where: { id: invoiceId },
        include: {
          user: { select: { name: true, email: true } },
        },
      });

      const subscription = await prisma.subscription.findUnique({
        where: { userId: payload.userId },
        select: {
          currentPeriodStart: true,
          currentPeriodEnd: true,
          snapshotPlanName: true,
          snapshotBillingPeriod: true,
        },
      });

      // 3. Send confirmation email
      await sendInvoiceEmail({
        email: invoice.user.email,
        userName: invoice.user.name,
        invoiceNumber: invoice.invoiceNumber,
        planName: subscription?.snapshotPlanName ?? invoice.currency,
        amount: invoice.total,
        currency: invoice.currency,
        billingPeriod: subscription?.snapshotBillingPeriod ?? 'MONTHLY',
        periodStart: subscription?.currentPeriodStart ?? invoice.createdAt,
        periodEnd: subscription?.currentPeriodEnd ?? new Date(),
        invoiceId,
      });

      // 4. Mark job as completed
      await prisma.backgroundJob.update({
        where: { id: job.id },
        data: { status: 'completed' },
      });

      results.push({ jobId: job.id, status: 'completed' });
      console.log(`[CronJob] Invoice PDF generated and email sent for invoice ${invoiceId}`);
    } catch (err: any) {
      const errorMessage = err?.message ?? 'Unknown error';
      const attempts = (job.attempts ?? 0) + 1;

      // Mark as failed if max attempts exceeded, otherwise back to pending for retry
      await prisma.backgroundJob.update({
        where: { id: job.id },
        data: {
          status: attempts >= MAX_ATTEMPTS ? 'failed' : 'pending',
          error: errorMessage,
        },
      });

      results.push({ jobId: job.id, status: 'failed', error: errorMessage });
      console.error(`[CronJob] Failed to process job ${job.id} (attempt ${attempts}):`, err);
    }
  }

  const completed = results.filter((r) => r.status === 'completed').length;
  const failed = results.filter((r) => r.status === 'failed').length;

  return NextResponse.json({ success: true, processed: jobs.length, completed, failed });
}
