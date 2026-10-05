import type { SubscriptionPlan, SubscriptionStatus } from '@/app/api/model/enums/subscription';

export interface UsageTrackingRow {
  used: number;
  limit: number | null;
  lastResetDate: Date | null;
}

export interface SubscriptionUsageItem {
  current: number;
  max: number | null;
  percent: number;
}

export interface SubscriptionStatusResponse {
  success: boolean;
  subscription: {
    plan: SubscriptionPlan | string;
    status: SubscriptionStatus | string;
    planName: string;
    templateAccess: string;
    currentPeriodStart: Date | string;
    currentPeriodEnd: Date | string | null;
  };
  usage: {
    atsScans: SubscriptionUsageItem;
    aiOptimizations: SubscriptionUsageItem;
  };
}
