import {
  activateUserSubscription,
  failUserPayment,
} from '@/app/service/subscription/subscription.service';
import { BillingPeriod } from '@/app/api/model/enums/subscription';
import { prisma } from '@/app/_lib/prisma';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('x-razorpay-signature');
    const razorpayEventId = request.headers.get('x-razorpay-event-id');

    if (!signature) {
      return NextResponse.json(
        { success: false, message: 'Missing webhook signature' },
        { status: 400 },
      );
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('RAZORPAY_WEBHOOK_SECRET is not configured');
      return NextResponse.json(
        { success: false, message: 'Webhook signature secret is not configured' },
        { status: 500 },
      );
    }

    // ── 1. Verify signature against RAW body BEFORE parsing JSON ─────────
    const rawBody = await request.text();
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
    const signatureBuffer = Buffer.from(signature, 'utf-8');

    if (
      expectedBuffer.length !== signatureBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
    ) {
      return NextResponse.json(
        { success: false, message: 'Invalid webhook signature verification' },
        { status: 400 },
      );
    }

    const eventData = JSON.parse(rawBody);
    const eventName = eventData.event;

    // ── 2. Idempotency via x-razorpay-event-id ────────────────────────────
    // An atomic INSERT with UNIQUE constraint on eventId prevents double-processing
    // even if Razorpay retries the same webhook concurrently.
    if (razorpayEventId) {
      try {
        await prisma.webhookEvent.create({
          data: {
            eventId: razorpayEventId,
            eventType: eventName,
            payload: eventData,
          },
        });
      } catch (err: any) {
        if (err.code === 'P2002') {
          // Unique constraint violation — event already processed
          console.log(`[Razorpay Webhook] Duplicate event ${razorpayEventId} — skipping.`);
          return NextResponse.json({ received: true });
        }
        throw err;
      }
    }

    console.log(`[Razorpay Webhook] Event: ${eventName}`, { eventId: razorpayEventId });

    // ── 3. Handle payment events ──────────────────────────────────────────
    if (eventName === 'payment.captured' || eventName === 'order.paid') {
      const paymentEntity = eventData.payload.payment?.entity;
      if (!paymentEntity) {
        return NextResponse.json(
          { success: false, message: 'Payment entity payload is missing' },
          { status: 400 },
        );
      }

      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      const amount = paymentEntity.amount / 100;
      const currency = paymentEntity.currency;
      const notes = paymentEntity.notes || {};

      if (!orderId || !notes.userId || !notes.planSlug || !notes.billingPeriod) {
        console.warn(
          '[Razorpay Webhook] Missing order details or metadata in notes:',
          paymentEntity,
        );
        return NextResponse.json(
          { success: false, message: 'Missing order details or metadata notes' },
          { status: 400 },
        );
      }

      try {
        await activateUserSubscription({
          userId: notes.userId,
          planSlug: notes.planSlug,
          billingPeriod: notes.billingPeriod as BillingPeriod,
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId,
          amount,
          currency,
        });

        // ── Fire-and-forget: trigger cron to generate invoice PDF immediately ──
        // This runs async in the background so the webhook returns 200 OK instantly.
        // The VPS system cron (every minute) acts as the reliable retry safety net.
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const cronSecret = process.env.CRON_SECRET;
        if (cronSecret) {
          fetch(`${appUrl}/api/cron/process-invoice-jobs`, {
            method: 'GET',
            headers: { 'x-cron-secret': cronSecret },
          }).catch((err) => {
            // Non-fatal: VPS cron will pick it up on next tick
            console.warn('[Razorpay Webhook] Fire-and-forget cron trigger failed:', err?.message);
          });
        }
      } catch (err: any) {
        if (err.message === 'PAYMENT_ALREADY_COMPLETED') {
          return NextResponse.json({ received: true });
        }
        throw err;
      }

      console.log(
        `[Razorpay Webhook] Successfully activated plan: ${notes.planSlug} for user: ${notes.userId}`,
      );
    } else if (eventName === 'payment.failed') {
      const paymentEntity = eventData.payload.payment?.entity;
      if (paymentEntity?.order_id) {
        await failUserPayment(paymentEntity.order_id);
        console.log(`[Razorpay Webhook] Payment failed for order: ${paymentEntity.order_id}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[POST /api/webhooks/razorpay]', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error processing webhook' },
      { status: 500 },
    );
  }
}
