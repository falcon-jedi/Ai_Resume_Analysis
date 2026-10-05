// ─────────────────────────────────────────────────────────────────────────────
// PRICING RESPONSE TYPES
// These are the shapes returned by the API and consumed by React Query hooks.
// ─────────────────────────────────────────────────────────────────────────────

import { Currency, TemplateAccess } from '@/app/api/model/enums/currency';

export interface PlanFeatureResponse {
  id: string;
  feature: string;
  available: boolean;
  highlight: boolean;
  order: number;
}

export interface PricingPlanResponse {
  id: string;
  name: string;
  slug: string;
  priceInr: number;
  priceUsd: number;
  currency: Currency | 'INR' | 'USD';
  templateAccess: TemplateAccess | 'FREE' | 'ALL';
  durationDays: number | null; // null = 30-day monthly
  description: string;
  badge: string | null;
  badgeColor: string | null;
  buttonText: string;
  buttonVariant: string; // "solid" | "outline"
  isPopular: boolean;
  displayOrder: number;
  limitAtsAnalysis: number;
  limitAiSuggestion: number;
  features: PlanFeatureResponse[];
}

/**
 * A single row in the Feature Ledger table.
 * values is a Record keyed by plan slug, e.g. { free: "—", pro: "check", enterprise: "Advanced" }
 * "check" → renders check_circle icon; any other string → rendered as text.
 */
export interface ComparisonFeatureResponse {
  id: string;
  title: string;
  values: Record<string, string>;
  order: number;
}

export interface TestimonialResponse {
  id: string;
  name: string;
  designation: string;
  company: string | null;
  image: string | null;
  review: string;
  rating: number;
  order: number;
}

/**
 * The complete shape returned by GET /api/public/pricing
 * Single endpoint — one round-trip for the entire pricing page.
 */
export interface PricingPageResponse {
  plans: PricingPlanResponse[];
  comparison: ComparisonFeatureResponse[];
  testimonials: TestimonialResponse[];
}

export interface PlanLimits {
  limitAtsAnalysis: number;
  limitAiSuggestion: number;
  durationDays: number | null;
  templateAccess: TemplateAccess | string;
}
