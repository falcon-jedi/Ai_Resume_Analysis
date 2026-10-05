import { prisma } from '@/app/_lib/prisma';
import type { Prisma } from '@prisma/client';
import type { PlanLimits } from '@/app/api/model/response/pricing';
import { buildKey, getOrSet, invalidate, invalidatePattern } from '@/app/_lib/cache';

export type { PlanLimits };

const CACHE_TTL_SECONDS = 5 * 60; // 5 minutes

type PlanLimitClient = typeof prisma | Prisma.TransactionClient;

export async function getPlanLimits(
  planSlug: string,
  db: PlanLimitClient = prisma,
): Promise<PlanLimits> {
  const normalized = planSlug.toLowerCase();
  const cacheKey = buildKey('cache', 'plan-limits', normalized);

  return getOrSet(
    cacheKey,
    async () => {
      let plan = await db.pricingPlan.findUnique({
        where: { slug: normalized },
      });

      if (!plan) {
        console.warn(
          `[PlanLimitService] Plan '${planSlug}' not found in database. Triggering pricing seed...`,
        );
        if (db !== prisma) {
          throw new Error(`Plan limits configuration not found for plan slug: ${planSlug}`);
        }

        const { seedPricingData } = await import('@/app/service/pricing/pricing.service');
        await seedPricingData();

        plan = await db.pricingPlan.findUnique({
          where: { slug: normalized },
        });
      }

      if (!plan) {
        throw new Error(
          `Plan limits configuration not found in database for plan slug: ${planSlug}`,
        );
      }

      return {
        limitAtsAnalysis: plan.limitAtsAnalysis,
        limitAiSuggestion: plan.limitAiSuggestion,
        durationDays: plan.durationDays,
        templateAccess: plan.templateAccess,
      } satisfies PlanLimits;
    },
    CACHE_TTL_SECONDS,
  );
}

export async function invalidatePlanLimitsCache(slugs?: string[]): Promise<void> {
  if (slugs && slugs.length > 0) {
    await invalidate(...slugs.map((s) => buildKey('cache', 'plan-limits', s.toLowerCase())));
  } else {
    // Dynamically invalidate all plan limit cache keys matching the wildcard pattern
    await invalidatePattern(buildKey('cache', 'plan-limits', '*'));
  }
}
