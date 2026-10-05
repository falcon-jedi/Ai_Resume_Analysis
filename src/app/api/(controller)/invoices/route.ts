import { requireAuth } from '@/app/api/(controller)/_util/auth-guard';
import { prisma } from '@/app/_lib/prisma';
import { NextResponse } from 'next/server';

/**
 * GET /api/invoices
 *
 * Returns the authenticated user's invoice history, newest first.
 * Only safe/non-binary fields are returned (pdfData is excluded).
 */
export async function GET() {
  try {
    const authResult = await requireAuth();
    if (authResult.error) return authResult.error;
    const userId = authResult.session.user.id;

    const invoices = await prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        invoiceNumber: true,
        subtotal: true,
        taxAmount: true,
        total: true,
        currency: true,
        status: true,
        lineItems: true,
        pdfUrl: true,
        razorpayOrderId: true,
        razorpayPaymentId: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, invoices });
  } catch (err) {
    console.error('[GET /api/invoices]', err);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch invoices' },
      { status: 500 },
    );
  }
}
