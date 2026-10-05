import { apiFetch } from '@/app/api/client/_utils/api-client';
import { CreateOrderRequest, VerifyPaymentRequest } from '@/app/api/model/request/payments/order';
import {
  CreateOrderResponse,
  VerifyPaymentResponse,
} from '@/app/api/model/response/payments/order';

export async function createOrderClient(request: CreateOrderRequest): Promise<CreateOrderResponse> {
  return apiFetch<CreateOrderResponse>('/api/payments/create-order', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function verifyPaymentClient(
  request: VerifyPaymentRequest,
): Promise<VerifyPaymentResponse> {
  return apiFetch<VerifyPaymentResponse>('/api/payments/verify', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function getSubscriptionStatusClient(): Promise<any> {
  return apiFetch<any>('/api/subscription/status');
}

export async function getInvoicesClient(): Promise<any> {
  return apiFetch<any>('/api/invoices');
}
