import type { Prisma, PrismaClient } from '@prisma/client';
import { SubscriptionPlan, UsageFeature } from '@/app/api/model/enums/subscription';
import type { UsageTrackingRow } from '@/app/api/model/response/subscription';
import { getPlanLimits } from './plan-limit.service';

export { UsageFeature, SubscriptionPlan };
export type { UsageTrackingRow };

// Only ATS and AI are metered — resume and PDF limits removed
const RESETTABLE_FEATURES: string[] = [UsageFeature.ATS_ANALYSIS, UsageFeature.AI_SUGGESTION];

type UsageClient = Prisma.TransactionClient | PrismaClient;

export async function checkAndIncrementUsage(
  tx: UsageClient,
  userId: string,
  feature: UsageFeature | string,
  incrementBy = 1,
) {
  const subscription = await tx.subscription.findUnique({
    where: { userId },
  });

  const isExpired =
    subscription?.plan !== SubscriptionPlan.FREE &&
    subscription?.currentPeriodEnd != null &&
    subscription.currentPeriodEnd < new Date();

  // Resolve limit: stacked `limit` column wins; fall back to plan default
  const planSlug = isExpired ? SubscriptionPlan.FREE : subscription?.plan?.toLowerCase() || 'free';
  const planLimits = await getPlanLimits(planSlug, tx);

  const featureLimitMap: Record<string, keyof typeof planLimits> = {
    [UsageFeature.ATS_ANALYSIS]: 'limitAtsAnalysis',
    [UsageFeature.AI_SUGGESTION]: 'limitAiSuggestion',
  };
  const limitKey = featureLimitMap[feature];
  const defaultLimit = limitKey ? (planLimits[limitKey] as number) : -1;

  const now = new Date();

  // Ensure row exists
  await tx.$executeRaw`
    INSERT INTO "usage_tracking" ("userId", "feature", "used", "lastResetDate", "createdAt", "updatedAt")
    VALUES (${userId}, ${feature}, 0, ${now}, ${now}, ${now})
    ON CONFLICT ("userId", "feature") DO NOTHING
  `;

  const lockedRecords = await tx.$queryRaw<UsageTrackingRow[]>`
    SELECT "used", "limit", "lastResetDate" FROM "usage_tracking"
    WHERE "userId" = ${userId} AND "feature" = ${feature}
    FOR UPDATE
  `;
  const lockedRecord = lockedRecords[0];
  if (!lockedRecord) {
    throw new Error(`Failed to acquire lock for feature: ${feature}`);
  }

  let currentUsed = lockedRecord.used;
  let lastResetDate = lockedRecord.lastResetDate;
  // Stacked limit wins over plan default; -1 means unlimited
  const effectiveLimit = lockedRecord.limit ?? defaultLimit;

  // Anniversary monthly resets for metered features
  if (RESETTABLE_FEATURES.includes(feature)) {
    const cycleStart = new Date(subscription?.currentPeriodStart || now);
    const anniversaryDate = new Date(cycleStart);
    while (anniversaryDate <= now) {
      anniversaryDate.setMonth(anniversaryDate.getMonth() + 1);
    }
    const currentCycleStart = new Date(anniversaryDate);
    currentCycleStart.setMonth(currentCycleStart.getMonth() - 1);

    if (!lastResetDate || lastResetDate < currentCycleStart) {
      currentUsed = 0;
      lastResetDate = now;
    }
  }

  if (effectiveLimit !== -1 && currentUsed + incrementBy > effectiveLimit) {
    const err = new Error(`Usage limit exceeded for feature: ${feature}`);
    (err as Error & { code?: string }).code = 'LIMIT_EXCEEDED';
    throw err;
  }

  return await tx.usageTracking.update({
    where: { userId_feature: { userId, feature } },
    data: {
      used: currentUsed + incrementBy,
      lastResetDate: lastResetDate || now,
    },
  });
}

export async function decrementUsage(
  tx: UsageClient,
  userId: string,
  feature: UsageFeature | string,
  decrementBy = 1,
) {
  const now = new Date();

  await tx.$executeRaw`
    INSERT INTO "usage_tracking" ("userId", "feature", "used", "lastResetDate", "createdAt", "updatedAt")
    VALUES (${userId}, ${feature}, 0, ${now}, ${now}, ${now})
    ON CONFLICT ("userId", "feature") DO NOTHING
  `;

  const lockedRecords = await tx.$queryRaw<UsageTrackingRow[]>`
    SELECT "used", "limit", "lastResetDate" FROM "usage_tracking"
    WHERE "userId" = ${userId} AND "feature" = ${feature}
    FOR UPDATE
  `;
  const lockedRecord = lockedRecords[0];
  if (!lockedRecord) return;

  await tx.usageTracking.update({
    where: { userId_feature: { userId, feature } },
    data: { used: Math.max(0, lockedRecord.used - decrementBy) },
  });
}

export async function getOrSeedUsage(
  tx: UsageClient,
  userId: string,
  feature: UsageFeature | string,
) {
  const subscription = await tx.subscription.findUnique({
    where: { userId },
  });
  const planSlug = subscription?.plan?.toLowerCase() || 'free';
  const planLimits = await getPlanLimits(planSlug, tx);

  const featureLimitMap: Record<string, keyof typeof planLimits> = {
    [UsageFeature.ATS_ANALYSIS]: 'limitAtsAnalysis',
    [UsageFeature.AI_SUGGESTION]: 'limitAiSuggestion',
  };
  const limitKey = featureLimitMap[feature];
  const defaultLimit = limitKey ? (planLimits[limitKey] as number) : -1;

  const now = new Date();

  await tx.$executeRaw`
    INSERT INTO "usage_tracking" ("userId", "feature", "used", "lastResetDate", "createdAt", "updatedAt")
    VALUES (${userId}, ${feature}, 0, ${now}, ${now}, ${now})
    ON CONFLICT ("userId", "feature") DO NOTHING
  `;

  const record = await tx.usageTracking.findUniqueOrThrow({
    where: { userId_feature: { userId, feature } },
  });

  // Use stacked limit if present
  const effectiveLimit = record.limit ?? defaultLimit;

  // Anniversary reset check
  if (RESETTABLE_FEATURES.includes(feature)) {
    const cycleStart = new Date(subscription?.currentPeriodStart || now);
    const anniversaryDate = new Date(cycleStart);
    while (anniversaryDate <= now) {
      anniversaryDate.setMonth(anniversaryDate.getMonth() + 1);
    }
    const currentCycleStart = new Date(anniversaryDate);
    currentCycleStart.setMonth(currentCycleStart.getMonth() - 1);

    if (!record.lastResetDate || record.lastResetDate < currentCycleStart) {
      await tx.usageTracking.update({
        where: { userId_feature: { userId, feature } },
        data: { used: 0, lastResetDate: now },
      });
      return { ...record, used: 0, limit: effectiveLimit };
    }
  }

  return { ...record, limit: effectiveLimit };
}
