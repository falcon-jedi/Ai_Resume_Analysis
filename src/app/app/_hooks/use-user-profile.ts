'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUserProfileClient,
  updateUserMetaClient,
} from '@/app/api/client/user/user-profile-client';
import type { UpdateUserMetaDTO } from '@/app/api/model/request/user/user-profile';

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const profileKeys = {
  all: ['user-profile'] as const,
  detail: () => [...profileKeys.all, 'detail'] as const,
};

// ─── GET PROFILE ──────────────────────────────────────────────────────────────
// Fetches user meta + profileResumeId without creating a profile resume.

export function useUserProfile() {
  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: getUserProfileClient,
    staleTime: 5 * 60 * 1000, // 5 min — profile meta rarely changes
  });
}

// ─── UPDATE META ──────────────────────────────────────────────────────────────
// Updates name / jobTitle / industry / image on the User row.

export function useUpdateUserMeta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUserMetaDTO) => updateUserMetaClient(data),
    onSuccess: (updated) => {
      qc.setQueryData(profileKeys.detail(), updated);
    },
  });
}
