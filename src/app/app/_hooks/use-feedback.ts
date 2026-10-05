'use client';

import { useMutation } from '@tanstack/react-query';
import { submitFeedbackClient } from '@/app/api/client/feedback/feedback-client';
import type { FeedbackRequestDTO } from '@/app/api/model/request/feedback';
import type { FeedbackSubmitResponse } from '@/app/api/model/response/feedback';

export function useSubmitFeedback() {
  return useMutation<FeedbackSubmitResponse, Error, FeedbackRequestDTO>({
    mutationFn: (data: FeedbackRequestDTO) => submitFeedbackClient(data),
  });
}
