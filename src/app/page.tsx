import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import type { Metadata } from 'next';

import { authOptions } from '@/app/api/(controller)/auth/[...nextauth]/options';
import { LandingNavbar } from '@/app/app/_components/landing/landing-navbar';
import { LandingHero } from '@/app/app/_components/landing/landing-hero';
import { LandingFeatures } from '@/app/app/_components/landing/landing-features';
import { LandingTestimonials } from '@/app/app/_components/landing/landing-testimonials';
import { LandingCta } from '@/app/app/_components/landing/landing-cta';
import { LandingFaq } from '@/app/app/_components/landing/landing-faq';
import { LandingFooter } from '@/app/app/_components/landing/landing-footer';

export const metadata: Metadata = {
  title: 'JobPatra | AI Career Workshop',
  description:
    'Transform your professional history into a bespoke artifact of value. JobPatra uses artisanal AI to weave your experience into a narrative that captures eyes and passes every digital gatekeeper.',
};

export default async function RootPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/app/dashboard');
  }

  return (
    <div className="landing-root landing-body-bg landing-nib-cursor font-['Hanken_Grotesk'] text-[16px] leading-[24px] text-[#2b1611] overflow-x-hidden min-h-screen">
      <LandingNavbar />

      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingTestimonials />
        <LandingCta />
        <LandingFaq />
      </main>

      <LandingFooter />
    </div>
  );
}
