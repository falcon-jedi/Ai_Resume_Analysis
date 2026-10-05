import { apiFetch } from '@/app/api/client/_utils/api-client';
import type { FeedbackRequestDTO } from '@/app/api/model/request/feedback';
import type { FeedbackSubmitResponse } from '@/app/api/model/response/feedback';

export async function submitFeedbackClient(
  input: FeedbackRequestDTO,
): Promise<FeedbackSubmitResponse> {
  return apiFetch<FeedbackSubmitResponse>('/api/feedback', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
