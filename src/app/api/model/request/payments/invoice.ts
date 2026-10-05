import type { Currency } from '@/app/api/model/enums/currency';
import type { BillingPeriod } from '@/app/api/model/enums/subscription';

export interface CreateInvoiceDTO {
  userId: string;
  paymentId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  planName: string;
  billingPeriod: BillingPeriod | string;
  amount: number;
  currency: Currency | string;
}

export interface SendInvoiceEmailParams {
  email: string;
  userName: string | null;
  invoiceNumber: string;
  planName: string;
  amount: number;
  currency: Currency | string;
  billingPeriod: BillingPeriod | string;
  periodStart: Date;
  periodEnd: Date;
  invoiceId: string;
}
