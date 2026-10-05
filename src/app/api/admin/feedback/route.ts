import { NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';
import { withAdminAuth } from '@/app/api/admin/_lib/with-admin-auth';

const PAGE_SIZE = 20;

export async function GET(request: Request) {
  const auth = await withAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') ?? ''; // BUG | FEATURE | GENERAL | COMPLIMENT
  const status = searchParams.get('status') ?? ''; // NEW | IN_PROGRESS | RESOLVED | CLOSED
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
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
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.feedback.count({ where }),
  ]);

  return NextResponse.json({
    feedbacks,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  });
}
