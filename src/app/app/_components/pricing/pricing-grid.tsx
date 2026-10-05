import React from 'react';
import { PricingCard } from './pricing-card';
import type { PricingPlanResponse } from '@/app/api/model/response/pricing';

interface PricingGridProps {
  plans: PricingPlanResponse[];
  currency: 'INR' | 'USD';
  onSelectPlan: (slug: string) => void;
  userPlan?: string | null;
}

export function PricingGrid({ plans, currency, onSelectPlan, userPlan }: PricingGridProps) {
  const getContainerLayout = (count: number) => {
    switch (count) {
      case 1:
        return 'grid grid-cols-1 max-w-md';
      case 2:
        return 'grid grid-cols-1 md:grid-cols-2 max-w-4xl';
      case 3:
        return 'grid grid-cols-1 md:grid-cols-3 max-w-6xl';
      default:
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl';
    }
  };

  return (
    <div
      className={`mx-auto ${getContainerLayout(plans.length)} gap-8 mb-24 items-stretch justify-center w-full`}
    >
      {plans.map((plan) => (
        <PricingCard
          key={plan.id}
          plan={plan}
          currency={currency}
          onSelect={onSelectPlan}
          userPlan={userPlan}
        />
      ))}
    </div>
  );
}
