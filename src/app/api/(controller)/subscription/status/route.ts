import { requireAuth } from '@/app/api/(controller)/_util/auth-guard';
import { prisma } from '@/app/_lib/prisma';
import { NextResponse } from 'next/server';
import { getOrSeedUsage } from '@/app/service/subscription/usage.service';
import { expireSubscriptionIfDue } from '@/app/service/subscription/subscription.service';

export async function GET() {
  try {
    const authResult = await requireAuth();
    if (authResult.error) return authResult.error;
    const userId = authResult.session.user.id;

    let subscription = await prisma.subscription.findUnique({ where: { userId } });

    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: { userId, plan: 'FREE', status: 'ACTIVE' },
      });
    }

    subscription = await expireSubscriptionIfDue(userId, subscription);

    const [atsUsage, aiUsage] = await Promise.all([
      getOrSeedUsage(prisma, userId, 'ATS_ANALYSIS'),
      getOrSeedUsage(prisma, userId, 'AI_SUGGESTION'),
    ]);

    const planName = (() => {
      const map: Record<string, string> = {
        FREE: 'Free',
        PRO: 'Pro',
        ENTERPRISE: 'Enterprise',
        PLUS: 'Plus',
      };
      return (
        map[subscription.plan.toUpperCase()] || subscription.snapshotPlanName || subscription.plan
      );
    })();

    const templateAccess =
      subscription.snapshotTemplateAccess ||
      (subscription.plan.toUpperCase() === 'FREE' ? 'FREE' : 'ALL');

    return NextResponse.json({
      success: true,
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        planName,
        templateAccess,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
      },
      usage: {
        atsScans: {
          current: atsUsage.used,
          max: atsUsage.limit,
          percent:
            atsUsage.limit && atsUsage.limit !== -1
              ? Math.min(100, Math.round((atsUsage.used / atsUsage.limit) * 100))
              : 0,
        },
        aiOptimizations: {
          current: aiUsage.used,
          max: aiUsage.limit,
          percent:
            aiUsage.limit && aiUsage.limit !== -1
              ? Math.min(100, Math.round((aiUsage.used / aiUsage.limit) * 100))
              : 0,
        },
      },
    });
  } catch (err: any) {
    console.error('[GET /api/subscription/status]', err);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
