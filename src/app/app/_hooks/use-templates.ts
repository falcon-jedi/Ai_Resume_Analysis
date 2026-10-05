'use client';

import { useQuery } from '@tanstack/react-query';
import { listTemplatesClient, getTemplateClient } from '@/app/api/client/resume/resume-client';

export const templateKeys = {
  all: ['templates'] as const,
  lists: () => [...templateKeys.all, 'list'] as const,
  detail: (id: string) => [...templateKeys.all, 'detail', id] as const,
};

export function useTemplates() {
  return useQuery({
    queryKey: templateKeys.lists(),
    queryFn: listTemplatesClient,
    staleTime: 5 * 60 * 1000, // templates rarely change — 5 min cache
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: templateKeys.detail(id),
    queryFn: () => getTemplateClient(id),
    enabled: !!id,
  });
}
