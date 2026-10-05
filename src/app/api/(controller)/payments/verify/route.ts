import { requireAuth } from '@/app/api/(controller)/_util/auth-guard';
import {
  activateUserSubscription,
  failUserPayment,
} from '@/app/service/subscription/subscription.service';
import { VerifyPaymentRequest } from '@/app/api/model/request/payments/order';
import { VerifyPaymentResponse } from '@/app/api/model/response/payments/order';
import { prisma } from '@/app/_lib/prisma';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const authResult = await requireAuth();
    if (authResult.error) return authResult.error;
    const userId = authResult.session.user.id;

    const body: VerifyPaymentRequest = await request.json();
    const razorpayOrderId = body.razorpayOrderId || body.razorpay_order_id;
    const razorpayPaymentId = body.razorpayPaymentId || body.razorpay_payment_id;
    const razorpaySignature = body.razorpaySignature || body.razorpay_signature;
    const { planSlug, billingPeriod } = body;

    // 1. Basic validation
    if (
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature ||
      !planSlug ||
      !billingPeriod
    ) {
      return NextResponse.json<VerifyPaymentResponse>(
        { success: false, message: 'Missing required validation fields' },
        { status: 400 },
      );
    }

    // 2. Validate cryptographic signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error('Razorpay secret is not configured in environment variables');
      return NextResponse.json<VerifyPaymentResponse>(
        { success: false, message: 'Payment configuration error' },
        { status: 500 },
      );
    }

    const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
    const generatedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    const generatedBuffer = Buffer.from(generatedSignature, 'utf-8');
    const signatureBuffer = Buffer.from(razorpaySignature, 'utf-8');

    let isSignatureValid = false;
    if (generatedBuffer.length === signatureBuffer.length) {
      isSignatureValid = crypto.timingSafeEqual(generatedBuffer, signatureBuffer);
    }

    if (!isSignatureValid) {
      await failUserPayment(razorpayOrderId);
      return NextResponse.json<VerifyPaymentResponse>(
        { success: false, message: 'Cryptographic signature verification failed' },
        { status: 400 },
      );
    }

    // 3. Find matching payment order audit
    const paymentRecord = await prisma.payment.findUnique({
      where: { razorpayOrderId },
    });

    if (!paymentRecord) {
      return NextResponse.json<VerifyPaymentResponse>(
        { success: false, message: 'Corresponding payment order record not found' },
        { status: 404 },
      );
    }

    // 4. Activate the subscription and complete the transaction ledger
    try {
      await activateUserSubscription({
        userId,
        planSlug,
        billingPeriod,
        razorpayOrderId,
        razorpayPaymentId,
        amount: paymentRecord.amount,
        currency: paymentRecord.currency,
      });

      // Fetch the final subscription and invoice to return a rich response
      const [subscription, invoice] = await Promise.all([
        prisma.subscription.findUnique({ where: { userId } }),
        prisma.invoice.findFirst({
          where: { razorpayOrderId },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            invoiceNumber: true,
            total: true,
            currency: true,
            status: true,
            pdfUrl: true,
            createdAt: true,
          },
        }),
      ]);

      return NextResponse.json<VerifyPaymentResponse>({
        success: true,
        message: 'Payment verified and subscription activated successfully',
        data: {
          subscription: {
            plan: subscription?.plan,
            planName: subscription?.snapshotPlanName,
            status: subscription?.status,
            currentPeriodStart: subscription?.currentPeriodStart,
            currentPeriodEnd: subscription?.currentPeriodEnd,
            limits: {
              atsScans: subscription?.snapshotLimitAts,
              aiSuggestions: subscription?.snapshotLimitAi,
              templateAccess: subscription?.snapshotTemplateAccess,
            },
          },
          invoice: invoice
            ? {
                invoiceNumber: invoice.invoiceNumber,
                total: invoice.total,
                currency: invoice.currency,
                status: invoice.status,
                // pdfUrl is null until the cron job generates it asynchronously
                pdfUrl: invoice.pdfUrl,
                createdAt: invoice.createdAt,
              }
            : null,
          razorpay: {
            orderId: razorpayOrderId,
            paymentId: razorpayPaymentId,
          },
        },
      });
    } catch (err: any) {
      if (err.message === 'PAYMENT_ALREADY_COMPLETED') {
        return NextResponse.json<VerifyPaymentResponse>({
          success: true,
          message: 'Payment verified and subscription activated successfully',
        });
      }
      throw err;
    }
  } catch (err) {
    console.error('[POST /api/payments/verify]', err);
    return NextResponse.json<VerifyPaymentResponse>(
      { success: false, message: 'Internal server error during verification' },
      { status: 500 },
    );
  }
}
