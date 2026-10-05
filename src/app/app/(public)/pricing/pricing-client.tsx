'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePricing } from '@/app/app/_hooks/use-pricing';
import { useSubscriptionStatus } from '@/app/app/_hooks/use-subscription';
import { PricingGrid } from '../../_components/pricing/pricing-grid';
import { ComparisonTable } from '../../_components/pricing/comparison-table';
import { TestimonialSection } from '../../_components/pricing/testimonial-section';
import { PaymentProcessingOverlay } from '../../_components/pricing/payment-processing-overlay';
import { BillingPeriod } from '@/app/api/model/enums/subscription';
import { createOrderClient, verifyPaymentClient } from '@/app/api/client/payments/payments-client';
import { getSessionClient } from '@/app/api/client/auth/auth-client';
import { IconMapper } from '@/app/_components/icons/IconMapper';

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

interface Props {
  currency: 'INR' | 'USD';
}

export function PricingClient({ currency }: Props) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPlanName, setProcessingPlanName] = useState<string | undefined>(undefined);
  const { data, isLoading, isError } = usePricing(currency);
  const { data: subStatus } = useSubscriptionStatus();
  // null = unauthenticated or loading; 'free' | 'pro' | 'plus' etc. = logged-in user
  const userPlan =
    (subStatus?.subscription?.plan?.toLowerCase() as string | null | undefined) ?? null;

  const handleSelectPlan = async (slug: string) => {
    try {
      const session = await getSessionClient();
      if (!session) {
        router.push(`/app/login?redirect=/app/subscription&plan=${slug}&interval=monthly`);
        return;
      }

      const plan = data?.plans?.find((p) => p.slug === slug);

      const orderRes = await createOrderClient({
        planSlug: slug,
        billingPeriod: BillingPeriod.MONTHLY,
        currency,
      });

      if (!orderRes.success) {
        alert(orderRes.message || 'Failed to initiate payment.');
        return;
      }

      if (orderRes.isFree) {
        router.push('/app/settings?section=subscription&payment=success');
        router.refresh();
        return;
      }

      if (!(window as any).Razorpay) {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          alert('Failed to load payment gateway script. Please check your internet connection.');
          return;
        }
      }

      const options = {
        key: orderRes.keyId,
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: 'JobPatra',
        description: `Upgrade to ${slug.toUpperCase()} Plan`,
        order_id: orderRes.orderId,
        handler: async function (response: any) {
          try {
            setProcessingPlanName(plan?.name);
            setIsProcessing(true);

            const verifyRes = await verifyPaymentClient({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planSlug: slug,
              billingPeriod: BillingPeriod.MONTHLY,
            });

            if (verifyRes.success) {
              router.push('/app/settings?section=subscription&payment=success');
              router.refresh();
            } else {
              setIsProcessing(false);
              alert(verifyRes.message || 'Signature verification failed. Please contact support.');
            }
          } catch (err: any) {
            setIsProcessing(false);
            alert(err.message || 'An error occurred during payment verification.');
          }
        },
        prefill: {
          name: orderRes.customer?.name || '',
          email: orderRes.customer?.email || '',
        },
        theme: { color: '#5b060c' },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      alert(err.message || 'An error occurred during checkout initialization.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFF8EE] text-[#2b1611]">
        <main className="pt-32 pb-20 px-4 md:px-16 max-w-7xl mx-auto animate-pulse">
          <div className="h-12 w-80 bg-[#ddc0bd]/20 rounded mx-auto mb-4" />
          <div className="h-6 w-96 bg-[#ddc0bd]/20 rounded mx-auto mb-16" />
          <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="bg-[#FFF8F6] border border-[#E5D9C8] p-8 rounded-2xl h-96" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-[#FFF8EE] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#564240] mb-6">Could not load pricing plans. Please try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-[#370003] text-white font-semibold rounded-full hover:scale-105 transition-transform"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8EE] text-[#2b1611] font-['Hanken_Grotesk']">
      {isProcessing && <PaymentProcessingOverlay planName={processingPlanName} />}
      <main className="pt-28 pb-20 px-4 md:px-16 max-w-7xl mx-auto">
        <header className="text-center mb-16 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#fff0ee] text-[#370003] border border-[#E5D9C8] mb-4 shadow-sm">
            <IconMapper name="workspace_premium" className="text-sm text-[#f6be39]" /> Transparent
            Pricing &amp; Plans
          </div>
          <h1 className="font-['Playfair_Display'] text-[36px] md:text-[52px] leading-[44px] md:leading-[60px] font-bold mb-4 text-[#370003]">
            Invest in Your Future
          </h1>
          <p className="text-[#564240] max-w-2xl mx-auto text-[18px] leading-[28px]">
            Select the toolset that fits your career stage. Prices shown in{' '}
            <strong>{currency}</strong>.
          </p>
        </header>

        <PricingGrid
          plans={data.plans}
          currency={currency}
          onSelectPlan={handleSelectPlan}
          userPlan={userPlan}
        />
        <ComparisonTable plans={data.plans} comparison={data.comparison} />
        <TestimonialSection testimonials={data.testimonials} />
      </main>
    </div>
  );
}
