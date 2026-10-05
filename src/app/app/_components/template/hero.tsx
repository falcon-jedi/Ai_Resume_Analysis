'use client';

import React from 'react';

export function Hero() {
  return (
    <section className="relative pt-24 sm:pt-28 md:pt-32 pb-8 sm:pb-12 md:pb-16 px-4 md:px-16 max-w-7xl mx-auto w-full flex flex-col items-center text-center">
      <div className="absolute inset-0 bg-gradient-to-b from-[#fff0ee]/70 via-[#FFF8EE]/40 to-transparent pointer-events-none -z-10 rounded-3xl" />

      <span className="font-['Hanken_Grotesk'] text-[11px] sm:text-[12px] leading-[16px] tracking-[0.2em] text-[#5b060c] uppercase mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3 font-semibold">
        <span className="w-6 sm:w-8 h-px bg-[#5b060c]/30"></span>
        The Ledger Collection
        <span className="w-6 sm:w-8 h-px bg-[#5b060c]/30"></span>
      </span>

      <h1 className="font-['Playfair_Display'] text-[28px] sm:text-[38px] md:text-[56px] leading-[34px] sm:leading-[46px] md:leading-[64px] font-bold text-[#2b1611] mb-3 sm:mb-6 max-w-3xl tracking-tight">
        Professional Resume Templates
      </h1>

      <p className="font-['Hanken_Grotesk'] text-[14px] sm:text-[16px] md:text-[18px] leading-[22px] sm:leading-[26px] md:leading-[28px] text-[#564240] max-w-2xl leading-relaxed">
        Curated by career experts and refined by AI. Each template is meticulously crafted to
        navigate ATS filters while presenting your narrative with undeniable elegance.
      </p>
    </section>
  );
}
