import { NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';
import { withAdminAuth } from '@/app/api/admin/_lib/with-admin-auth';

const PAGE_SIZE = 20;

export async function GET(request: Request) {
  const auth = await withAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const skip = (page - 1) * PAGE_SIZE;

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      skip,
      take: PAGE_SIZE,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
      // Exclude pdfData blob from list — download via /api/invoice/[id]/download
      omit: { pdfData: true },
    }),
    prisma.invoice.count(),
  ]);

  return NextResponse.json({ invoices, total, page, totalPages: Math.ceil(total / PAGE_SIZE) });
}
