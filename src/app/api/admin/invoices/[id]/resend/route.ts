import { NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';
import { withAdminAuth } from '@/app/api/admin/_lib/with-admin-auth';
import { logAdminAction } from '@/app/api/admin/_lib/log-admin-action';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await withAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!invoice) {
    return NextResponse.json({ success: false, message: 'Invoice not found' }, { status: 404 });
  }

  if (!invoice.pdfUrl) {
    return NextResponse.json(
      { success: false, message: 'PDF not yet generated. Try again shortly.' },
      { status: 422 },
    );
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: invoice.userId },
    select: {
      currentPeriodStart: true,
      currentPeriodEnd: true,
      snapshotPlanName: true,
      snapshotBillingPeriod: true,
    },
  });

  const { sendInvoiceEmail } = await import('@/app/service/auth/email.service');
  await sendInvoiceEmail({
    email: invoice.user.email,
    userName: invoice.user.name,
    invoiceNumber: invoice.invoiceNumber,
    planName: subscription?.snapshotPlanName ?? 'Pro',
    amount: invoice.total,
    currency: invoice.currency,
    billingPeriod: subscription?.snapshotBillingPeriod ?? 'MONTHLY',
    periodStart: subscription?.currentPeriodStart ?? invoice.createdAt,
    periodEnd: subscription?.currentPeriodEnd ?? new Date(),
    invoiceId: id,
  });

  await logAdminAction({
    adminId: auth.session.user.id,
    action: 'RESEND_INVOICE_EMAIL',
    target: id,
    details: { invoiceNumber: invoice.invoiceNumber, toEmail: invoice.user.email },
    request,
  });

  return NextResponse.json({ success: true });
}
