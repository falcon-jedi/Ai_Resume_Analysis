import { NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';
import { withAdminAuth } from '@/app/api/admin/_lib/with-admin-auth';

export async function GET() {
  const auth = await withAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsersThisMonth,
    activeSubscriptions,
    totalRevenue,
    pendingFeedback,
    totalFeedback,
    recentPayments,
    userGrowth,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.subscription.count({ where: { status: 'ACTIVE', plan: { not: 'FREE' } } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'COMPLETED' },
    }),
    prisma.feedback.count({ where: { status: 'NEW' } }),
    prisma.feedback.count(),
    // Last 7 payments for recent activity
    prisma.payment.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' },
      take: 7,
      select: { amount: true, currency: true, createdAt: true },
    }),
    // User growth: count per day for last 14 days
    prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
      SELECT DATE("createdAt") as date, COUNT(*)::bigint as count
      FROM users
      WHERE "createdAt" >= NOW() - INTERVAL '14 days'
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `,
  ]);

  return NextResponse.json({
    totalUsers,
    newUsersThisMonth,
    activeSubscriptions,
    totalRevenue: totalRevenue._sum.amount ?? 0,
    pendingFeedback,
    totalFeedback,
    recentPayments,
    userGrowth: userGrowth.map((r) => ({
      date: r.date,
      count: Number(r.count),
    })),
  });
}
