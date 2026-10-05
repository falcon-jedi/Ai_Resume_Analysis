import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/(controller)/auth/[...nextauth]/options';
import { prisma } from '@/app/_lib/prisma';
import { AdminSubscriptionsClient } from './subscriptions-client';

export const metadata: Metadata = { title: 'Subscriptions | JobPatra Admin' };

export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/app/dashboard');

  const { status = '', page: pageStr = '1' } = await searchParams;
  const page = Math.max(1, parseInt(pageStr, 10));
  const PAGE_SIZE = 20;
  const skip = (page - 1) * PAGE_SIZE;
  const where = status ? { status } : {};

  const [subscriptions, total] = await Promise.all([
    prisma.subscription.findMany({
      where,
      skip,
      take: PAGE_SIZE,
      orderBy: { updatedAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.subscription.count({ where }),
  ]);

  return (
    <AdminSubscriptionsClient
      initialSubs={subscriptions.map((s) => ({
        ...s,
        currentPeriodStart: s.currentPeriodStart.toISOString(),
        currentPeriodEnd: s.currentPeriodEnd?.toISOString() ?? null,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      }))}
      total={total}
      page={page}
      totalPages={Math.ceil(total / PAGE_SIZE)}
      initialStatus={status}
    />
  );
}
