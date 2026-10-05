import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/(controller)/auth/[...nextauth]/options';
import { prisma } from '@/app/_lib/prisma';
import { AdminUsersClient } from './users-client';

export const metadata: Metadata = { title: 'Users | JobPatra Admin' };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; plan?: string; page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/app/dashboard');

  const { q = '', plan = '', page: pageStr = '1' } = await searchParams;
  const page = Math.max(1, parseInt(pageStr, 10));
  const PAGE_SIZE = 20;
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' as const } },
            { email: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : {}),
    ...(plan ? { subscription: { plan } } : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: PAGE_SIZE,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        subscription: { select: { plan: true, status: true } },
        _count: { select: { resumes: true, atsAnalyses: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return (
    <AdminUsersClient
      initialUsers={users.map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
      }))}
      total={total}
      page={page}
      totalPages={Math.ceil(total / PAGE_SIZE)}
      initialQ={q}
      initialPlan={plan}
    />
  );
}
