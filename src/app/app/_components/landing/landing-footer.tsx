'use client';
import { IconMapper } from '@/app/_components/icons/IconMapper';

import Link from 'next/link';
import { Logo } from '@/app/app/_components/common/logo';

export function LandingFooter() {
  return (
    <footer className="w-full bg-[#fff0ee] border-t border-[#E5D9C8] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8 sm:mb-12">
          {/* Brand Col */}
          <div className="col-span-1">
            <Link href="/" className="inline-block mb-4">
              <Logo
                iconClassName="h-6 w-auto"
                textClassName="font-['Playfair_Display'] text-xl font-semibold text-[#370003]"
              />
            </Link>
            <p className="text-[#564240] font-['Hanken_Grotesk'] text-sm">
              Elevating professional storytelling through the digital nib.
            </p>
          </div>

          {/* Product Links */}
          <div className="flex flex-col gap-3">
            <h4 className="font-['Hanken_Grotesk'] text-xs font-semibold text-[#370003] uppercase tracking-widest mb-2">
              Product
            </h4>
            <Link
              className="text-[#564240] font-['Hanken_Grotesk'] text-sm hover:text-[#370003] transition-colors"
              href="/app/templates"
            >
              Templates
            </Link>
            <Link
              className="text-[#564240] font-['Hanken_Grotesk'] text-sm hover:text-[#370003] transition-colors"
              href="/#features"
            >
              AI Editor
            </Link>
            <Link
              className="text-[#564240] font-['Hanken_Grotesk'] text-sm hover:text-[#370003] transition-colors"
              href="/app/ats-checker"
            >
              ATS Score
            </Link>
          </div>

          {/* Company Links */}
          <div className="flex flex-col gap-3">
            <h4 className="font-['Hanken_Grotesk'] text-xs font-semibold text-[#370003] uppercase tracking-widest mb-2">
              Company
            </h4>
            <Link
              className="text-[#564240] font-['Hanken_Grotesk'] text-sm hover:text-[#370003] transition-colors"
              href="/app/contact"
            >
              Contact &amp; Feedback
            </Link>
            <Link
              className="text-[#564240] font-['Hanken_Grotesk'] text-sm hover:text-[#370003] transition-colors"
              href="/app/about"
            >
              About Us
            </Link>
            <Link
              className="text-[#564240] font-['Hanken_Grotesk'] text-sm hover:text-[#370003] transition-colors"
              href="/app/privacy"
            >
              Privacy Policy
            </Link>
            <Link
              className="text-[#564240] font-['Hanken_Grotesk'] text-sm hover:text-[#370003] transition-colors"
              href="/app/terms"
            >
              Terms of Service
            </Link>
          </div>

          {/* Connect */}
          <div className="flex flex-col gap-3">
            <h4 className="font-['Hanken_Grotesk'] text-xs font-semibold text-[#370003] uppercase tracking-widest mb-2">
              Connect
            </h4>
            <div className="flex flex-col gap-3">
              <a
                href="mailto:support@jobpatra.in"
                className="flex items-center gap-2.5 text-[#564240] hover:text-[#370003] transition-colors text-sm font-['Hanken_Grotesk'] group"
                title="Email Support"
              >
                <div className="w-8 h-8 rounded-full bg-white border border-[#E5D9C8] flex items-center justify-center text-[#370003] group-hover:bg-[#fff0ed] group-hover:border-[#7a1f1f]/40 transition-all shrink-0">
                  <IconMapper name="mail" className="text-base" />
                </div>
                <span className="truncate">support@jobpatra.in</span>
              </a>

              <a
                href="https://www.linkedin.com/in/abhitsahu/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-[#564240] hover:text-[#370003] transition-colors text-sm font-['Hanken_Grotesk'] group"
                title="Founder LinkedIn Profile"
              >
                <div className="w-8 h-8 rounded-full bg-white border border-[#E5D9C8] flex items-center justify-center text-[#370003] group-hover:bg-[#fff0ed] group-hover:border-[#7a1f1f]/40 transition-all shrink-0">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45c-.96 0-1.74.78-1.74 1.74s.78 1.74 1.74 1.74 1.74-.78 1.74-1.74c0-.96-.78-1.74-1.74-1.74Z" />
                  </svg>
                </div>
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[#E5D9C8] flex flex-col sm:flex-row justify-between gap-4 text-[#564240] font-['Hanken_Grotesk'] text-xs">
          <p>© 2026 JobPatra. All rights reserved.</p>
          <p>Crafted for the modern professional.</p>
        </div>
      </div>
    </footer>
  );
}
