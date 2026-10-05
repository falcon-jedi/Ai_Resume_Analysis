export interface CreateOrderResponse {
  success: boolean;
  orderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  isFree?: boolean;
  message?: string;
  customer?: {
    name?: string | null;
    email?: string | null;
  };
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  data?: any;
}
