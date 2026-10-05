'use client';
import { IconMapper } from '@/app/_components/icons/IconMapper';

import React from 'react';

export interface BenefitItem {
  icon: string;
  title: string;
  description: string;
}

export interface AuthCardLayoutProps {
  tag?: string;
  headline?: React.ReactNode;
  benefits?: BenefitItem[];
  children: React.ReactNode;
}

export const AUTH_PAGE_CONFIGS = {
  signup: {
    tag: 'The AI Workshop',
    headline: (
      <>
        Crafting your <br /> professional <br />{' '}
        <span className="italic text-[#5b060c]">artifact.</span>
      </>
    ),
    benefits: [
      {
        icon: 'history_edu',
        title: 'Premium Typography',
        description:
          'Your career story deserves more than a standard font. We treat every resume like a bespoke letterpress workshop.',
      },
      {
        icon: 'mail',
        title: 'Delivering Opportunity',
        description:
          "JobPatra isn't just a builder; it's a delivery mechanism for your next high-stakes career introduction.",
      },
    ],
  },
  login: {
    tag: 'Welcome Back',
    headline: (
      <>
        Step into your <br /> bespoke letterpress <br />{' '}
        <span className="italic text-[#5b060c]">workshop.</span>
      </>
    ),
    benefits: [
      {
        icon: 'auto_awesome',
        title: 'AI-Powered Optimization',
        description:
          'Continue tailoring your resumes with live ATS score optimization and smart content suggestions.',
      },
      {
        icon: 'folder_managed',
        title: 'Active Portfolio',
        description:
          'Access all your customized resumes and track job applications seamlessly in one dashboard.',
      },
    ],
  },
  forgotPassword: {
    tag: 'Account Recovery',
    headline: (
      <>
        Recover access <br /> to your career <br />{' '}
        <span className="italic text-[#5b060c]">workshop.</span>
      </>
    ),
    benefits: [
      {
        icon: 'lock_reset',
        title: 'Encrypted Recovery',
        description:
          'We generate an encrypted single-use link sent straight to your email to reset your credentials safely.',
      },
      {
        icon: 'shield',
        title: 'Protected Artifacts',
        description:
          'Your resumes and career data remain safe and private throughout the password recovery process.',
      },
    ],
  },
  resetPassword: {
    tag: 'Security Credentials',
    headline: (
      <>
        Establish your <br /> new security <br />{' '}
        <span className="italic text-[#5b060c]">credentials.</span>
      </>
    ),
    benefits: [
      {
        icon: 'key',
        title: 'Enhanced Protection',
        description:
          'Update your password to restore immediate access to your resumes and account settings.',
      },
      {
        icon: 'verified',
        title: 'Instant Validation',
        description:
          'Once updated, you can instantly log in and resume building your professional artifacts.',
      },
    ],
  },
};

export function AuthCardLayout({
  tag = AUTH_PAGE_CONFIGS.signup.tag,
  headline = AUTH_PAGE_CONFIGS.signup.headline,
  benefits = AUTH_PAGE_CONFIGS.signup.benefits,
  children,
}: AuthCardLayoutProps) {
  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col justify-between relative z-20">
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:flex-row gap-12 items-stretch py-12">
        {/* Branding & Benefits Section */}
        <div className="flex-1 flex flex-col justify-center space-y-8 pr-0 md:pr-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-[1px] bg-[#5b060c]"></span>
              <span className="font-['Hanken_Grotesk'] text-[14px] leading-[20px] tracking-[0.2em] font-semibold text-[#5b060c] uppercase">
                {tag}
              </span>
            </div>
            <h2 className="font-['Playfair_Display'] text-[32px] md:text-[48px] md:leading-[56px] md:tracking-[-0.02em] font-bold leading-tight text-[#2b1611]">
              {headline}
            </h2>
          </div>

          <div className="space-y-6">
            {benefits.map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="mt-1 flex-shrink-0 w-6 h-6 flex items-center justify-center border border-[#ddc0bd] rounded-full">
                  <IconMapper name={item.icon} className="text-[16px] text-[#795900]" />
                </div>
                <div>
                  <p className="font-['Hanken_Grotesk'] text-[14px] leading-[20px] tracking-[0.05em] font-bold text-[#2b1611]">
                    {item.title}
                  </p>
                  <p className="text-[#564240] font-['Hanken_Grotesk'] text-[16px] leading-[24px]">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Decorative Postal Stamp */}
          <div className="pt-8 opacity-45 grayscale hover:grayscale-0 transition-all duration-500 hidden md:block">
            <div className="w-32 h-40 bg-[#ffe9e4] border-[3px] border-dashed border-[#ddc0bd] p-4 flex flex-col justify-between">
              <div className="flex justify-end">
                <div className="w-8 h-8 rounded-full bg-[#ddc0bd]/30"></div>
              </div>
              <div className="text-[10px] font-['Hanken_Grotesk'] leading-tight text-[#564240]">
                EST. 2026
                <br />
                CAREER ARCHIVE
                <br />
                OFFICIAL SEAL
              </div>
            </div>
          </div>
        </div>

        {/* Auth Sheet Section */}
        <div className="flex-1 flex items-center justify-center">
          <div className="auth-sheet-base auth-sheet p-8 md:p-12 w-full max-w-[480px] mx-auto rounded-none relative">
            {children}

            {/* Nib Icon Detail */}
            <div className="absolute -bottom-6 -right-6 hidden md:block">
              <div className="w-12 h-12 auth-wax-seal rounded-full flex items-center justify-center bg-gradient-to-br from-[#795900] to-[#a23c39] shadow-lg">
                <IconMapper name="edit_note" className="text-white text-xl" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
