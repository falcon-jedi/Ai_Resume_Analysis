import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/(controller)/auth/[...nextauth]/options';
import { prisma } from '@/app/_lib/prisma';
import { AdminInvoicesClient } from './invoices-client';

export const metadata: Metadata = { title: 'Invoices | JobPatra Admin' };

const PAGE_SIZE = 20;

export default async function AdminInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/app/dashboard');

  const { page: pageStr = '1' } = await searchParams;
  const page = Math.max(1, parseInt(pageStr, 10));
  const skip = (page - 1) * PAGE_SIZE;

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      skip,
      take: PAGE_SIZE,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
      omit: { pdfData: true },
    }),
    prisma.invoice.count(),
  ]);

  return (
    <AdminInvoicesClient
      initialInvoices={invoices.map((inv) => ({
        ...inv,
        lineItems: inv.lineItems as unknown[],
        createdAt: inv.createdAt.toISOString(),
      }))}
      total={total}
      page={page}
      totalPages={Math.ceil(total / PAGE_SIZE)}
    />
  );
}
