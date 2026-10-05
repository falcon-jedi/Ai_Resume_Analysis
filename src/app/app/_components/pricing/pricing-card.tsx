'use client';
import React from 'react';
import type { PricingPlanResponse } from '@/app/api/model/response/pricing';
import { IconMapper } from '@/app/_components/icons/IconMapper';

interface PricingCardProps {
  plan: PricingPlanResponse;
  currency: 'INR' | 'USD';
  onSelect: (slug: string) => void;
  userPlan?: string | null;
}

export function PricingCard({ plan, currency, onSelect, userPlan }: PricingCardProps) {
  const {
    name,
    slug,
    priceInr,
    priceUsd,
    durationDays,
    description,
    buttonText,
    buttonVariant,
    isPopular,
    features,
  } = plan;

  const symbol = currency === 'USD' ? '$' : '₹';
  const price = currency === 'USD' ? priceUsd : priceInr;
  const billingLabel =
    slug === 'free' ? '/forever' : durationDays ? `/${durationDays} days` : '/month';

  const dynamicTemplateText =
    plan.templateAccess === 'ALL' ? 'Select all templates' : 'Select only free templates';
  const quotaPeriod = durationDays ? `per ${durationDays} days` : 'per month';
  const dynamicQuotaText = `${plan.limitAtsAnalysis || 1} ATS Score & AI Suggestions ${quotaPeriod}`;

  const customFeatures = (features || []).filter((f) => {
    const text = f.feature.toLowerCase();
    const isTemplateDuplicate = text.includes('template');
    const isQuotaDuplicate = text.includes('ats') || text.includes('ai suggestion');
    return !isTemplateDuplicate && !isQuotaDuplicate;
  });

  const displayFeatures = [
    {
      id: '__dyn_template',
      feature: dynamicTemplateText,
      available: true,
      highlight: plan.templateAccess === 'ALL',
    },
    {
      id: '__dyn_quota',
      feature: dynamicQuotaText,
      available: true,
      highlight: false,
    },
    ...customFeatures,
  ];

  // ── Button state based on user's current plan ─────────────────────────────
  const isFreePlan = slug === 'free';
  const isCurrentPlan = userPlan !== null && userPlan !== undefined && userPlan === slug;
  const isOnPaidPlan = userPlan !== null && userPlan !== undefined && userPlan !== 'free';
  // Disable: already on this plan (except renewing is allowed via same button), or free card for paid users
  const isDisabled = isFreePlan && isOnPaidPlan;

  const derivedButtonText = isCurrentPlan
    ? isFreePlan
      ? '✓ Current Plan'
      : ' Renew Plan'
    : isFreePlan && isOnPaidPlan
      ? 'Free'
      : !isFreePlan && isOnPaidPlan && !isCurrentPlan
        ? `Switch to ${name}`
        : buttonText; // DB default

  const cardBg = isPopular
    ? 'bg-[#2b1611] text-white border-[#7a1f1f]'
    : 'bg-[#FFF8F6] text-[#2b1611] border-[#E5D9C8]';
  const descColor = isPopular ? 'text-[#ddc0bd]' : 'text-[#564240]';
  const priceColor = isPopular ? 'text-white' : 'text-[#5b060c]';
  const labelColor = isPopular ? 'text-[#ddc0bd]' : 'text-[#564240]';
  const featureColor = isPopular ? 'text-[#e8d5d3]' : 'text-[#564240]';

  const buttonCls = isDisabled
    ? 'bg-[#e5d9c8] text-[#9e8880] cursor-not-allowed border border-[#ddc0bd]'
    : isCurrentPlan && !isFreePlan
      ? 'bg-[#e8f5e9] text-[#1b5e20] border border-[#a5d6a7] hover:bg-[#d0ead2]'
      : buttonVariant === 'solid' || isPopular
        ? 'bg-[#f6be39] text-[#2b1611] hover:bg-[#e5ad2a]'
        : 'bg-transparent border border-[#5b060c] text-[#5b060c] hover:bg-[#fff0ed]';

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-8 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-lg ${cardBg}`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-[#f6be39] text-[#2b1611] text-[11px] font-bold uppercase tracking-widest px-4 py-1 rounded-full shadow">
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-4">
        <h2 className="font-['Playfair_Display'] text-[22px] font-bold mb-1">{name}</h2>
        <p className={`text-[14px] leading-[20px] ${descColor}`}>{description}</p>
      </div>

      <div className="flex items-baseline mb-6">
        <span className={`text-4xl font-bold font-['Playfair_Display'] ${priceColor}`}>
          {symbol}
          {price}
        </span>
        <span className={`ml-2 text-[14px] font-semibold ${labelColor}`}>{billingLabel}</span>
      </div>

      <ul className="space-y-2.5 mb-8 flex-1">
        {displayFeatures.map((f) => (
          <li key={f.id} className={`flex items-start gap-2.5 text-[14px] ${featureColor}`}>
            <IconMapper
              name={f.available ? 'check_circle' : 'cancel'}
              className={`text-base mt-0.5 shrink-0 ${f.available ? 'text-[#2a7040]' : 'text-[#cba89d]'}`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            />
            <span className={f.highlight ? 'font-semibold' : ''}>{f.feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => !isDisabled && onSelect(slug)}
        disabled={isDisabled}
        className={`w-full py-3 rounded-full text-[14px] font-semibold tracking-wide transition-all active:scale-95 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${buttonCls}`}
      >
        {derivedButtonText}
      </button>
    </div>
  );
}
