'use client';

import Link from 'next/link';

export function LandingCta() {
  return (
    <section className="py-14 sm:py-24 px-4 md:px-16 bg-[#FFF8F6]">
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        <h3 className="font-['Playfair_Display'] text-[26px] sm:text-[36px] md:text-[48px] leading-tight md:leading-[56px] md:tracking-[-0.02em] font-bold text-[#370003] mb-4 sm:mb-6">
          Ready to Build a Better Job Search?
        </h3>
        <p className="text-[#564240] font-['Hanken_Grotesk'] text-[15px] sm:text-[18px] leading-[24px] sm:leading-[28px] mb-6 sm:mb-8 max-w-xl">
          Join thousands of professionals crafting resumes that bypass gatekeepers and get hired
          faster.
        </p>
        <Link
          href="/app/signup"
          className="w-full sm:w-auto bg-[#370003] text-white font-['Hanken_Grotesk'] text-[14px] leading-[20px] tracking-[0.05em] font-semibold px-8 sm:px-10 py-3.5 sm:py-4 rounded-full shadow-xl hover:scale-105 transition-transform duration-300 inline-block text-center"
        >
          Get Started for Free
        </Link>
      </div>
    </section>
  );
}
