'use client';

import { useQuery } from '@tanstack/react-query';
import { getPricingClient } from '@/app/api/client/pricing/pricing-client';

export const pricingKeys = {
  all: ['pricing'] as const,
  page: (currency: string) => [...pricingKeys.all, 'page', currency] as const,
};

export function usePricing(currency: 'INR' | 'USD' = 'INR') {
  return useQuery({
    queryKey: pricingKeys.page(currency),
    queryFn: () => getPricingClient(currency),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
