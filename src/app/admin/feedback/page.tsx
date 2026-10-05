import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/(controller)/auth/[...nextauth]/options';
import { prisma } from '@/app/_lib/prisma';
import { AdminFeedbackClient } from './feedback-client';

export const metadata: Metadata = { title: 'Feedback | JobPatra Admin' };

export default async function AdminFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string; page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/app/dashboard');

  const { type = '', status = '', page: pageStr = '1' } = await searchParams;
  const page = Math.max(1, parseInt(pageStr, 10));
  const PAGE_SIZE = 20;
  const skip = (page - 1) * PAGE_SIZE;
  const where = {
    ...(type ? { type } : {}),
    ...(status ? { status } : {}),
  };

  const [feedbacks, total] = await Promise.all([
    prisma.feedback.findMany({
      where,
      skip,
      take: PAGE_SIZE,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.feedback.count({ where }),
  ]);

  return (
    <AdminFeedbackClient
      initialFeedbacks={feedbacks.map((f) => ({
        ...f,
        createdAt: f.createdAt.toISOString(),
        updatedAt: f.updatedAt.toISOString(),
      }))}
      total={total}
      page={page}
      totalPages={Math.ceil(total / PAGE_SIZE)}
      initialType={type}
      initialStatus={status}
    />
  );
}
