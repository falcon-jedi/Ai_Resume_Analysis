import { requireAuth } from '@/app/api/(controller)/_util/auth-guard';
import { getPricingPage } from '@/app/service/pricing/pricing.service';
import { activateUserSubscription } from '@/app/service/subscription/subscription.service';
import { BillingPeriod } from '@/app/api/model/enums/subscription';
import { CreateOrderRequest } from '@/app/api/model/request/payments/order';
import { CreateOrderResponse } from '@/app/api/model/response/payments/order';
import { prisma } from '@/app/_lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const authResult = await requireAuth();
    if (authResult.error) return authResult.error;
    const userId = authResult.session.user.id;

    const body: CreateOrderRequest = await request.json();
    const { planSlug, billingPeriod, currency = 'INR' } = body;

    // 1. Basic validation
    if (!planSlug || !billingPeriod) {
      return NextResponse.json<CreateOrderResponse>(
        { success: false, message: 'Missing planSlug or billingPeriod' },
        { status: 400 },
      );
    }

    if (!Object.values(BillingPeriod).includes(billingPeriod)) {
      return NextResponse.json<CreateOrderResponse>(
        { success: false, message: 'Invalid billingPeriod' },
        { status: 400 },
      );
    }

    if (!['INR', 'USD'].includes(currency.toUpperCase())) {
      return NextResponse.json<CreateOrderResponse>(
        { success: false, message: 'Invalid currency' },
        { status: 400 },
      );
    }

    // 2. Fetch pricing data to secure accurate pricing
    const pricing = await getPricingPage(currency.toUpperCase());
    const plan = pricing.plans.find((p) => p.slug === planSlug.toLowerCase());

    if (!plan) {
      return NextResponse.json<CreateOrderResponse>(
        { success: false, message: 'Pricing plan not found' },
        { status: 404 },
      );
    }

    const price = currency.toUpperCase() === 'USD' ? plan.priceUsd : plan.priceInr;

    // 3. Handle free plan tier bypass
    if (price === 0) {
      // Block downgrade if user has an active paid subscription
      const existingSub = await prisma.subscription.findUnique({
        where: { userId },
        select: { plan: true, status: true, currentPeriodEnd: true },
      });
      const isActivePaid =
        existingSub?.plan !== 'FREE' &&
        existingSub?.status === 'ACTIVE' &&
        existingSub?.currentPeriodEnd &&
        existingSub.currentPeriodEnd > new Date();
      if (isActivePaid) {
        return NextResponse.json<CreateOrderResponse>(
          {
            success: false,
            message: 'You cannot switch to the Free plan while on an active paid subscription.',
          },
          { status: 400 },
        );
      }

      const uniqueId = `free_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await activateUserSubscription({
        userId,
        planSlug: plan.slug,
        billingPeriod,
        razorpayOrderId: uniqueId,
        razorpayPaymentId: uniqueId,
        amount: 0,
        currency: currency.toUpperCase(),
      });

      return NextResponse.json<CreateOrderResponse>({
        success: true,
        isFree: true,
        message: 'Free subscription activated successfully',
      });
    }

    // 4. Create or fetch Customer on Razorpay API
    const authHeader =
      'Basic ' +
      Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString(
        'base64',
      );

    // Fetch local user to verify customer ID state
    const localUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    let razorpayCustomerId = localUser?.razorpayCustomerId;

    if (!razorpayCustomerId) {
      try {
        const customerResponse = await fetch('https://api.razorpay.com/v1/customers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
          },
          body: JSON.stringify({
            name: authResult.session.user.name || 'JobPatra User',
            email: authResult.session.user.email,
            fail_existing: 0,
          }),
        });

        if (customerResponse.ok) {
          const customerData = await customerResponse.json();
          await prisma.user.update({
            where: { id: userId },
            data: {
              razorpayCustomerId: customerData.id,
            },
          });
          razorpayCustomerId = customerData.id;
        } else {
          console.error('[Razorpay Customer Creation Error]', await customerResponse.text());
        }
      } catch (custErr) {
        console.error('Failed to create Razorpay customer:', custErr);
      }
    }

    const amountInSubunits = Math.round(price * 100);

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        amount: amountInSubunits,
        currency: currency.toUpperCase(),
        receipt: `receipt_${userId.substring(0, 8)}_${Date.now()}`,
        notes: {
          userId,
          planSlug: plan.slug,
          billingPeriod,
          razorpayCustomerId: razorpayCustomerId || '',
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('[Razorpay Order Creation Failed]', errorData);
      return NextResponse.json<CreateOrderResponse>(
        { success: false, message: 'Payment gateway order creation failed' },
        { status: 500 },
      );
    }

    const orderData = await response.json();

    // 5. Store pending payment audit record
    await prisma.payment.create({
      data: {
        userId,
        razorpayOrderId: orderData.id,
        amount: price,
        currency: currency.toUpperCase(),
        status: 'PENDING',
      },
    });

    return NextResponse.json<CreateOrderResponse>({
      success: true,
      orderId: orderData.id,
      amount: amountInSubunits,
      currency: currency.toUpperCase(),
      keyId: process.env.RAZORPAY_KEY_ID,
      customer: {
        name: authResult.session.user.name,
        email: authResult.session.user.email,
      },
    });
  } catch (err) {
    console.error('[POST /api/payments/create-order]', err);
    return NextResponse.json<CreateOrderResponse>(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    );
  }
}
