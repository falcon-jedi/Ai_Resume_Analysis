'use client';

import { useQuery } from '@tanstack/react-query';
import { getSubscriptionStatusClient } from '@/app/api/client/payments/payments-client';

export const subscriptionKeys = {
  all: ['subscription'] as const,
  status: () => [...subscriptionKeys.all, 'status'] as const,
};

export function useSubscriptionStatus() {
  return useQuery({
    queryKey: subscriptionKeys.status(),
    queryFn: getSubscriptionStatusClient,
  });
}
