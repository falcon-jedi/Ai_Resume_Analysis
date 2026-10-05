'use client';

import { LandingNavbar } from '@/app/app/_components/landing/landing-navbar';
import { LandingFooter } from '@/app/app/_components/landing/landing-footer';
import { Toaster } from 'sonner';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="landing-body-bg landing-nib-cursor font-['Hanken_Grotesk'] text-[16px] leading-[24px] text-[#2b1611] overflow-x-hidden min-h-screen relative">
      {/* Tactile Paper Texture Overlay */}
      <div className="fixed inset-0 auth-paper-texture pointer-events-none z-50"></div>
      <Toaster position="top-right" richColors />
      <LandingNavbar />
      <main className="relative z-10">{children}</main>
      <LandingFooter />
    </div>
  );
}
