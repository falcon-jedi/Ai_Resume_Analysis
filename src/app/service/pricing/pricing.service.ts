import { prisma } from '@/app/_lib/prisma';
import { buildKey, getOrSet, invalidate } from '@/app/_lib/cache';
import { Currency, TemplateAccess } from '@/app/api/model/enums/currency';
import type {
  PricingPageResponse,
  PricingPlanResponse,
  ComparisonFeatureResponse,
  TestimonialResponse,
} from '@/app/api/model/response/pricing';

// ─────────────────────────────────────────────────────────────────────────────
// SEED DATA — used when DB tables are empty or not yet migrated
// ─────────────────────────────────────────────────────────────────────────────

const SEED_PLANS = [
  {
    id: 'plan_free',
    name: 'Free',
    slug: 'free',
    priceInr: 0,
    priceUsd: 0,
    currency: 'INR',
    templateAccess: 'FREE',
    durationDays: null as number | null,
    description: 'Lifetime free access for basic job seeking.',
    badge: null as string | null,
    badgeColor: null as string | null,
    buttonText: 'Select Plan',
    buttonVariant: 'outline',
    isPopular: false,
    displayOrder: 0,
    isActive: true,
    limitAtsAnalysis: 1,
    limitAiSuggestion: 1,
    features: [
      {
        id: 'ff1',
        feature: 'Select only free templates',
        available: true,
        highlight: false,
        order: 0,
      },
      {
        id: 'ff2',
        feature: '1 ATS Score & AI Suggestion per month',
        available: true,
        highlight: false,
        order: 1,
      },
    ],
  },
  {
    id: 'plan_pro',
    name: 'Pro',
    slug: 'pro',
    priceInr: 99,
    priceUsd: 1.2,
    currency: 'INR',
    templateAccess: 'ALL',
    durationDays: null as number | null,
    description: 'All templates and standard AI checking limit.',
    badge: 'Most Popular' as string | null,
    badgeColor: 'primary' as string | null,
    buttonText: 'Upgrade to Pro',
    buttonVariant: 'solid',
    isPopular: true,
    displayOrder: 1,
    isActive: true,
    limitAtsAnalysis: 15,
    limitAiSuggestion: 15,
    features: [
      { id: 'pf1', feature: 'Select all templates', available: true, highlight: true, order: 0 },
      {
        id: 'pf2',
        feature: '15 ATS Score & AI Suggestions per month',
        available: true,
        highlight: false,
        order: 1,
      },
    ],
  },
  {
    id: 'plan_enterprise',
    name: 'Enterprise',
    slug: 'enterprise',
    priceInr: 149,
    priceUsd: 1.8,
    currency: 'INR',
    templateAccess: 'ALL',
    durationDays: null as number | null,
    description: 'For power users needing higher checking limits.',
    badge: null as string | null,
    badgeColor: null as string | null,
    buttonText: 'Upgrade to Enterprise',
    buttonVariant: 'outline',
    isPopular: false,
    displayOrder: 2,
    isActive: true,
    limitAtsAnalysis: 25,
    limitAiSuggestion: 25,
    features: [
      { id: 'ef1', feature: 'Select all templates', available: true, highlight: true, order: 0 },
      {
        id: 'ef2',
        feature: '25 ATS Score & AI Suggestions per month',
        available: true,
        highlight: false,
        order: 1,
      },
    ],
  },
];

const SEED_COMPARISON: ComparisonFeatureResponse[] = [
  {
    id: 'cf1',
    title: 'Resume Builder',
    values: { free: 'Basic', pro: 'Advanced', enterprise: 'Advanced' },
    order: 0,
  },
  {
    id: 'cf2',
    title: 'ATS Optimization',
    values: { free: '—', pro: 'check', enterprise: 'check' },
    order: 1,
  },
  {
    id: 'cf3',
    title: 'AI Writing Assistant',
    values: { free: 'Limited', pro: 'Unlimited', enterprise: 'Unlimited' },
    order: 2,
  },
  {
    id: 'cf4',
    title: 'Template Access',
    values: { free: 'Free only', pro: 'All', enterprise: 'All' },
    order: 3,
  },
];

const SEED_TESTIMONIALS: TestimonialResponse[] = [
  {
    id: 't1',
    name: 'Eleanor Vance',
    designation: 'Senior Product Manager at TechFlow',
    company: 'TechFlow',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCBIiym9vzN3Gqu8IzaK42NgnKgF9ZPvJ5QELA2cCMETmmaP92NvR3K5agyluIhzXVPQDctoe8XJEXN6FO-MpLCvdnDO6c2MU_U5IttDHm5zPVeQhKIF80t9krhOj-dJYGRSKppJuHK9IX26MvM2d_NVHcJisZZN5-ZZ0cC9RWu8VdtUeMR0sjgjBAizEU80eEamqu_JnKNzm97sDCekPwSW5Ijplsi0L73X2ROtWCsOgR5uGK9_5U9Kb1bPnMM4d25jsXdZBnHVXAd',
    review:
      'JobPatra transformed my job search. Within two weeks of upgrading to Pro, I landed three interviews at Fortune 500 companies. The ATS analysis is a game-changer.',
    rating: 5,
    order: 0,
  },
];

// [ignoring loop detection]
export async function seedPricingData(): Promise<void> {
  for (const plan of SEED_PLANS) {
    const { features, ...planData } = plan;
    await prisma.pricingPlan.upsert({
      where: { slug: planData.slug },
      update: {
        limitAtsAnalysis: planData.limitAtsAnalysis,
        limitAiSuggestion: planData.limitAiSuggestion,
        templateAccess: planData.templateAccess,
      },
      create: {
        ...planData,
        features: {
          create: features.map((f) => ({
            feature: f.feature,
            available: f.available,
            highlight: f.highlight,
            order: f.order,
          })),
        },
      },
    });
  }

  for (const cf of SEED_COMPARISON) {
    await prisma.comparisonFeature.upsert({
      where: { id: cf.id },
      update: {},
      create: { id: cf.id, title: cf.title, values: cf.values, order: cf.order },
    });
  }

  for (const t of SEED_TESTIMONIALS) {
    await prisma.testimonial.upsert({
      where: { id: t.id },
      update: {},
      create: t,
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FORMAT HELPER
// ─────────────────────────────────────────────────────────────────────────────

function formatPlan(plan: {
  id: string;
  name: string;
  slug: string;
  priceInr: number;
  priceUsd: number;
  currency: string;
  templateAccess: string;
  durationDays: number | null;
  description: string;
  badge: string | null;
  badgeColor: string | null;
  buttonText: string;
  buttonVariant: string;
  isPopular: boolean;
  displayOrder: number;
  limitAtsAnalysis: number;
  limitAiSuggestion: number;
  features: {
    id: string;
    feature: string;
    available: boolean;
    highlight: boolean;
    order: number;
  }[];
}): PricingPlanResponse {
  return {
    id: plan.id,
    name: plan.name,
    slug: plan.slug,
    priceInr: plan.priceInr,
    priceUsd: plan.priceUsd,
    currency: (plan.currency as Currency) || Currency.INR,
    templateAccess: (plan.templateAccess as TemplateAccess) || TemplateAccess.FREE,
    durationDays: plan.durationDays,
    description: plan.description,
    badge: plan.badge,
    badgeColor: plan.badgeColor,
    buttonText: plan.buttonText,
    buttonVariant: plan.buttonVariant,
    isPopular: plan.isPopular,
    displayOrder: plan.displayOrder,
    limitAtsAnalysis: plan.limitAtsAnalysis ?? 1,
    limitAiSuggestion: plan.limitAiSuggestion ?? 1,
    features: plan.features.map((f) => ({
      id: f.id,
      feature: f.feature,
      available: f.available,
      highlight: f.highlight,
      order: f.order,
    })),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SERVICE FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

const PRICING_CACHE_KEY = buildKey('cache', 'pricing');
const PRICING_CACHE_TTL = 60 * 60; // 1 hour

export async function getPricingPage(_currency: string = 'INR'): Promise<PricingPageResponse> {
  return getOrSet(
    PRICING_CACHE_KEY,
    async () => {
      try {
        const [plans, comparison, testimonials] = await Promise.all([
          prisma.pricingPlan.findMany({
            where: { isActive: true },
            orderBy: { displayOrder: 'asc' },
            include: { features: { orderBy: { order: 'asc' } } },
          }),
          prisma.comparisonFeature.findMany({ orderBy: { order: 'asc' } }),
          prisma.testimonial.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
          }),
        ]);

        if (plans.length === 0) {
          await seedPricingData();
          return getPricingPage(_currency);
        }

        return {
          plans: plans.map(formatPlan),
          comparison: comparison.map((c) => ({
            id: c.id,
            title: c.title,
            values: c.values as Record<string, string>,
            order: c.order,
          })),
          testimonials: testimonials.map((t) => ({
            id: t.id,
            name: t.name,
            designation: t.designation,
            company: t.company,
            image: t.image,
            review: t.review,
            rating: t.rating,
            order: t.order,
          })),
        };
      } catch (err) {
        console.warn('[pricing.service] DB unavailable, using static fallback:', err);
        return {
          plans: SEED_PLANS.map(formatPlan),
          comparison: SEED_COMPARISON,
          testimonials: SEED_TESTIMONIALS,
        };
      }
    },
    PRICING_CACHE_TTL,
  );
}

/** Delete the pricing cache — call after any admin mutation to plans, features, or testimonials. */
export async function invalidatePricingCache(): Promise<void> {
  await invalidate(PRICING_CACHE_KEY);
}
