import { Currency, TemplateAccess } from '@/app/api/model/enums/currency';

export interface PlanFeatureInput {
  feature: string;
  available: boolean;
  highlight?: boolean;
  order?: number;
}

export interface CreatePricingPlanRequest {
  name: string;
  slug: string;
  description: string;
  buttonText?: string;
  priceInr: number;
  priceUsd: number;
  currency?: Currency | 'INR' | 'USD';
  templateAccess: TemplateAccess | 'FREE' | 'ALL';
  durationDays?: number | null;
  limitAtsAnalysis: number;
  limitAiSuggestion: number;
  isPopular?: boolean;
  displayOrder?: number;
  features?: PlanFeatureInput[];
}

export interface UpdatePricingPlanRequest {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  buttonText?: string;
  priceInr?: number;
  priceUsd?: number;
  currency?: Currency | 'INR' | 'USD';
  templateAccess?: TemplateAccess | 'FREE' | 'ALL';
  durationDays?: number | null;
  limitAtsAnalysis?: number;
  limitAiSuggestion?: number;
  isPopular?: boolean;
  displayOrder?: number;
  isActive?: boolean;
  features?: PlanFeatureInput[];
}

export interface ReorderPricingPlansRequest {
  orders: Array<{ id: string; displayOrder: number }>;
}
