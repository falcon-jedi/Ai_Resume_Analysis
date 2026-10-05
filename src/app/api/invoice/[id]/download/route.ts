import { requireAuth } from '@/app/api/(controller)/_util/auth-guard';
import { prisma } from '@/app/_lib/prisma';
import { NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/invoice/[id]/download
 *
 * Auth-gated PDF download route. Only the invoice owner can download.
 * Streams the PDF bytes stored in Invoice.pdfData back to the browser.
 */
export async function GET(_req: Request, { params }: Params) {
  try {
    const authResult = await requireAuth();
    if (authResult.error) return authResult.error;
    const userId = authResult.session.user.id;

    const { id: invoiceId } = await params;

    // Fetch invoice — ownership check is part of the query
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: {
        userId: true,
        invoiceNumber: true,
        pdfData: true,
        pdfUrl: true,
      },
    });

    if (!invoice || invoice.userId !== userId) {
      return NextResponse.json({ success: false, message: 'Invoice not found' }, { status: 404 });
    }

    if (!invoice.pdfData) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invoice PDF is still being generated. Please try again in a moment.',
        },
        { status: 202 },
      );
    }

    // Stream PDF to client
    return new Response(invoice.pdfData, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
        'Content-Length': invoice.pdfData.length.toString(),
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (err) {
    console.error('[GET /api/invoice/:id/download]', err);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve invoice' },
      { status: 500 },
    );
  }
}
