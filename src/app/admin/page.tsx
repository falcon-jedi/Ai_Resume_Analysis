import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/(controller)/auth/[...nextauth]/options';
import { prisma } from '@/app/_lib/prisma';
import { AdminDashboardClient } from './_components/admin-dashboard-client';

export const metadata: Metadata = {
  title: 'Admin Overview | JobPatra',
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/app/dashboard');

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsersThisMonth,
    activeSubscriptions,
    totalRevenue,
    pendingFeedback,
    recentPayments,
    userGrowthRaw,
    revenueByDay,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.subscription.count({ where: { status: 'ACTIVE', plan: { not: 'FREE' } } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'COMPLETED' } }),
    prisma.feedback.count({ where: { status: 'NEW' } }),
    prisma.payment.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
      SELECT DATE_TRUNC('day', "createdAt") as day, COUNT(*)::bigint as count
      FROM users
      WHERE "createdAt" >= NOW() - INTERVAL '14 days'
      GROUP BY day ORDER BY day ASC
    `,
    prisma.$queryRaw<Array<{ day: Date; revenue: number }>>`
      SELECT DATE_TRUNC('day', "createdAt") as day, SUM(amount)::float as revenue
      FROM payments
      WHERE status = 'COMPLETED' AND "createdAt" >= NOW() - INTERVAL '14 days'
      GROUP BY day ORDER BY day ASC
    `,
  ]);

  const stats = {
    totalUsers,
    newUsersThisMonth,
    activeSubscriptions,
    totalRevenue: totalRevenue._sum.amount ?? 0,
    pendingFeedback,
  };

  const chartData = userGrowthRaw.map((r) => ({
    date: new Date(r.day).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    users: Number(r.count),
    revenue:
      revenueByDay.find((rv) => new Date(rv.day).toDateString() === new Date(r.day).toDateString())
        ?.revenue ?? 0,
  }));

  const recentActivity = recentPayments.map((p) => ({
    id: p.id,
    userName: p.user.name ?? p.user.email,
    amount: p.amount,
    currency: p.currency,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <AdminDashboardClient stats={stats} chartData={chartData} recentActivity={recentActivity} />
  );
}
