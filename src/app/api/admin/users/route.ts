import { NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';
import { withAdminAuth } from '@/app/api/admin/_lib/with-admin-auth';

const PAGE_SIZE = 20;

export async function GET(request: Request) {
  const auth = await withAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('q') ?? '';
  const plan = searchParams.get('plan') ?? ''; // FREE | PRO | ENTERPRISE
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
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
        image: true,
        role: true,
        createdAt: true,
        subscription: {
          select: { plan: true, status: true, currentPeriodEnd: true },
        },
        _count: { select: { resumes: true, atsAnalyses: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    users,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  });
}

export async function DELETE(request: Request) {
  const auth = await withAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('id');
  if (!userId)
    return NextResponse.json({ success: false, message: 'Missing user ID' }, { status: 400 });

  await prisma.user.delete({ where: { id: userId } });

  const { logAdminAction } = await import('@/app/api/admin/_lib/log-admin-action');
  await logAdminAction({
    adminId: auth.session.user.id,
    action: 'DELETE_USER',
    target: userId,
    details: {},
    request,
  });

  return NextResponse.json({ success: true });
}
