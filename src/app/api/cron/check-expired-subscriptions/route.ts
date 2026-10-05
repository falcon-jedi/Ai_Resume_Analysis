import { NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';

// Batch expiry cleanup — runs every 30 minutes via external scheduler.
// Lazy expiry (expireSubscriptionIfDue) already handles active users;
// this cron catches users who haven't logged in since their plan expired.
// Credits are preserved: UsageTracking is NOT touched.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('x-cron-secret') !== secret) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();

  const { count } = await prisma.subscription.updateMany({
    where: {
      status: 'ACTIVE',
      plan: { not: 'FREE' },
      currentPeriodEnd: { lt: now },
    },
    data: {
      plan: 'FREE',
      status: 'EXPIRED',
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    },
  });

  console.info(
    `[check-expired-subscriptions] Downgraded ${count} expired subscription(s) to FREE.`,
  );

  return NextResponse.json({ success: true, updated: count });
}
