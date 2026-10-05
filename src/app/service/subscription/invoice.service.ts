import type { Prisma } from '@prisma/client';
import { prisma } from '@/app/_lib/prisma';
import { generatePdf } from '@/app/service/resume/pdf.service';
import type { CreateInvoiceDTO } from '@/app/api/model/request/payments/invoice';

export type { CreateInvoiceDTO };

type TxClient = Prisma.TransactionClient;

// ─────────────────────────────────────────────────────────────────────────────
// CREATE INVOICE (called inside activateUserSubscription transaction)
// ─────────────────────────────────────────────────────────────────────────────

export async function createInvoice(
  tx: TxClient,
  {
    userId,
    paymentId,
    razorpayOrderId,
    razorpayPaymentId,
    planName,
    billingPeriod,
    amount,
    currency,
  }: CreateInvoiceDTO,
) {
  // Sequential invoice number: JP-YYYY-NNNNNN
  const invoiceCount = await tx.invoice.count();
  const invoiceNumber = `JP-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(6, '0')}`;

  const invoice = await tx.invoice.create({
    data: {
      userId,
      paymentId,
      razorpayOrderId,
      razorpayPaymentId,
      invoiceNumber,
      subtotal: amount,
      taxAmount: 0,
      total: amount,
      currency,
      status: 'paid',
      lineItems: [
        {
          description: `${planName} Plan — ${billingPeriod}`,
          quantity: 1,
          unitPrice: amount,
          amount,
        },
      ],
      // pdfData and pdfUrl are null — set asynchronously by the cron job
    },
  });

  // Enqueue background job for async PDF generation
  await tx.backgroundJob.create({
    data: {
      type: 'GENERATE_INVOICE_PDF',
      payload: {
        invoiceId: invoice.id,
        userId,
      },
      status: 'pending',
    },
  });

  return invoice;
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERATE PDF (called by cron job processor, outside any transaction)
// ─────────────────────────────────────────────────────────────────────────────

export async function generateInvoicePdf(invoiceId: string): Promise<void> {
  // Fetch invoice with user details
  const invoice = await prisma.invoice.findUniqueOrThrow({
    where: { id: invoiceId },
    include: { user: { select: { name: true, email: true } } },
  });

  // Build HTML and render to PDF
  const html = buildInvoiceHtml(invoice, invoice.user);
  const pdfBuffer = await generatePdf(html);

  // Store PDF bytes and set internal download URL.
  // Prisma's Bytes field is typed as Uint8Array<ArrayBuffer> (concrete), but
  // Buffer has buffer: ArrayBufferLike (which includes SharedArrayBuffer).
  // Slicing produces a concrete ArrayBuffer copy that satisfies the type.
  const pdfUint8 = new Uint8Array(
    pdfBuffer.buffer.slice(pdfBuffer.byteOffset, pdfBuffer.byteOffset + pdfBuffer.byteLength),
  ) as Uint8Array<ArrayBuffer>;
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      pdfData: pdfUint8,
      pdfUrl: `/api/invoice/${invoiceId}/download`,
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// HTML INVOICE TEMPLATE
// Renders a clean, formal A4 receipt. Brand colours are used in the header
// and accent elements; the body stays professional/neutral for legal use.
// ─────────────────────────────────────────────────────────────────────────────

function buildInvoiceHtml(
  invoice: {
    invoiceNumber: string;
    createdAt: Date;
    subtotal: number;
    taxAmount: number;
    total: number;
    currency: string;
    status: string;
    lineItems: unknown;
    razorpayOrderId: string;
    razorpayPaymentId: string;
  },
  user: { name: string | null; email: string },
): string {
  const lineItems = invoice.lineItems as Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: invoice.currency,
      minimumFractionDigits: 2,
    }).format(n);

  const dateStr = new Date(invoice.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const lineItemsHtml = lineItems
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f3eae1;font-size:14px;color:#2b1611;">${item.description}</td>
        <td style="padding:12px 0;border-bottom:1px solid #f3eae1;text-align:center;font-size:14px;color:#564240;">${item.quantity}</td>
        <td style="padding:12px 0;border-bottom:1px solid #f3eae1;text-align:right;font-size:14px;color:#564240;">${fmt(item.unitPrice)}</td>
        <td style="padding:12px 0;border-bottom:1px solid #f3eae1;text-align:right;font-size:14px;font-weight:600;color:#2b1611;">${fmt(item.amount)}</td>
      </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Hanken Grotesk', Arial, sans-serif; background: #fff; color: #2b1611; }
    .page { width: 794px; min-height: 1123px; margin: 0 auto; padding: 60px; }
  </style>
</head>
<body>
  <div class="page">

    <!-- Header -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:48px;">
      <tr>
        <td>
          <div style="font-family:'Hanken Grotesk',Arial,sans-serif;font-size:26px;font-weight:700;color:#5b060c;letter-spacing:-0.5px;">
            JobPatra
          </div>
          <div style="font-size:11px;color:#8a716f;letter-spacing:0.15em;text-transform:uppercase;margin-top:4px;">
            AI Career Workshop
          </div>
        </td>
        <td style="text-align:right;">
          <div style="font-size:11px;color:#8a716f;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:6px;">Invoice</div>
          <div style="font-size:22px;font-weight:700;color:#2b1611;">${invoice.invoiceNumber}</div>
          <div style="font-size:12px;color:#564240;margin-top:4px;">${dateStr}</div>
          <div style="display:inline-block;margin-top:8px;padding:4px 12px;background:#e8f5e9;border-radius:4px;font-size:11px;font-weight:600;color:#2e7d32;letter-spacing:0.08em;text-transform:uppercase;">
            ${invoice.status.toUpperCase()}
          </div>
        </td>
      </tr>
    </table>

    <!-- Divider -->
    <div style="height:2px;background:linear-gradient(to right,#5b060c,#ddc0bd);margin-bottom:40px;"></div>

    <!-- Bill To -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:40px;">
      <tr>
        <td width="50%">
          <div style="font-size:10px;color:#8a716f;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:10px;">Billed To</div>
          <div style="font-size:15px;font-weight:600;color:#2b1611;">${user.name || 'Valued Customer'}</div>
          <div style="font-size:13px;color:#564240;margin-top:4px;">${user.email}</div>
        </td>
        <td width="50%" style="text-align:right;">
          <div style="font-size:10px;color:#8a716f;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:10px;">Issued By</div>
          <div style="font-size:13px;color:#564240;">JobPatra Technologies</div>
          <div style="font-size:13px;color:#564240;margin-top:2px;">support@jobpatra.in</div>
        </td>
      </tr>
    </table>

    <!-- Line Items Table -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <thead>
        <tr style="border-bottom:2px solid #ddc0bd;">
          <th style="padding:10px 0;text-align:left;font-size:11px;color:#8a716f;letter-spacing:0.1em;text-transform:uppercase;font-weight:600;">Description</th>
          <th style="padding:10px 0;text-align:center;font-size:11px;color:#8a716f;letter-spacing:0.1em;text-transform:uppercase;font-weight:600;">Qty</th>
          <th style="padding:10px 0;text-align:right;font-size:11px;color:#8a716f;letter-spacing:0.1em;text-transform:uppercase;font-weight:600;">Unit Price</th>
          <th style="padding:10px 0;text-align:right;font-size:11px;color:#8a716f;letter-spacing:0.1em;text-transform:uppercase;font-weight:600;">Amount</th>
        </tr>
      </thead>
      <tbody>${lineItemsHtml}</tbody>
    </table>

    <!-- Totals -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:48px;">
      <tr>
        <td width="60%"></td>
        <td width="40%">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#564240;">Subtotal</td>
              <td style="padding:6px 0;font-size:13px;color:#564240;text-align:right;">${fmt(invoice.subtotal)}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#564240;">Tax</td>
              <td style="padding:6px 0;font-size:13px;color:#564240;text-align:right;">${fmt(invoice.taxAmount)}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding:4px 0;"><div style="height:1px;background:#ddc0bd;"></div></td>
            </tr>
            <tr>
              <td style="padding:10px 0 6px;font-size:16px;font-weight:700;color:#2b1611;">Total</td>
              <td style="padding:10px 0 6px;font-size:16px;font-weight:700;color:#5b060c;text-align:right;">${fmt(invoice.total)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Payment Reference -->
    <div style="background:#fff8f6;border:1px solid #f3eae1;padding:20px;margin-bottom:48px;">
      <div style="font-size:10px;color:#8a716f;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:12px;">Payment Reference</div>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:12px;color:#564240;padding-bottom:6px;">Razorpay Order ID</td>
          <td style="font-size:12px;color:#2b1611;font-weight:500;text-align:right;padding-bottom:6px;">${invoice.razorpayOrderId}</td>
        </tr>
        <tr>
          <td style="font-size:12px;color:#564240;">Razorpay Payment ID</td>
          <td style="font-size:12px;color:#2b1611;font-weight:500;text-align:right;">${invoice.razorpayPaymentId}</td>
        </tr>
      </table>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #f3eae1;padding-top:24px;text-align:center;">
      <div style="font-size:12px;color:#8a716f;">
        Thank you for your purchase. This is a computer-generated invoice and does not require a signature.
      </div>
      <div style="font-size:11px;color:#b0908e;margin-top:8px;">
        JobPatra &bull; support@jobpatra.in &bull; jobpatra.in
      </div>
    </div>

  </div>
</body>
</html>`;
}
