import React from 'react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { PricingClient } from './pricing-client';

export const metadata: Metadata = {
  title: 'Pricing Plans | JobPatra - AI Career Workshop',
  description:
    'Choose the perfect plan for your career growth. Monthly billing, advanced ATS optimization, resume templates, and AI writing assistant.',
};

function getCurrency(countryCode: string | null): 'INR' | 'USD' {
  if (countryCode === 'IN') return 'INR';
  // NEXT_PUBLIC_DEFAULT_CURRENCY for local dev (e.g. USD)
  const envCurrency = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY;
  if (envCurrency === 'USD') return 'USD';
  return 'INR'; // default to INR (primary market)
}

export default async function PricingPage() {
  const hdrs = await headers();
  const country = hdrs.get('x-vercel-ip-country') || hdrs.get('cf-ipcountry') || null;
  const currency = getCurrency(country);
  return <PricingClient currency={currency} />;
}
