'use client';
import { IconMapper } from '@/app/_components/icons/IconMapper';

import React from 'react';

export function WhyChoose() {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-16 py-12 sm:py-20">
      <div className="text-center mb-10 sm:mb-14">
        <span className="font-['Hanken_Grotesk'] text-[11px] sm:text-[12px] uppercase tracking-[0.2em] font-semibold text-[#795900] block mb-2">
          Precision Engineering
        </span>
        <h2 className="font-['Playfair_Display'] text-[26px] sm:text-[32px] md:text-[40px] leading-tight sm:leading-[40px] md:leading-[48px] font-bold text-[#2b1611]">
          Crafted for Success
        </h2>
        <div className="h-1 w-16 sm:w-20 bg-[#5b060c] mx-auto mt-3 sm:mt-4 rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {/* Card 1 */}
        <div className="bg-white p-6 sm:p-8 flex flex-col items-center text-center space-y-3 sm:space-y-4 rounded-xl border border-[#E5D9C8] shadow-sm hover:shadow-md transition-shadow">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#ffe9e5] flex items-center justify-center text-[#5b060c]">
            <IconMapper name="verified" className="text-[28px] sm:text-[32px]" />
          </div>
          <h3 className="font-['Playfair_Display'] text-[20px] sm:text-[22px] font-semibold text-[#2b1611]">
            ATS Optimized
          </h3>
          <p className="font-['Hanken_Grotesk'] text-[14px] sm:text-[15px] leading-[22px] sm:leading-[24px] text-[#564240]">
            Our layouts are rigorously tested against modern parsing systems to ensure your details
            never get lost in applicant tracking software.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 sm:p-8 flex flex-col items-center text-center space-y-3 sm:space-y-4 rounded-xl border border-[#E5D9C8] shadow-sm hover:shadow-md transition-shadow">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#ffe9e5] flex items-center justify-center text-[#5b060c]">
            <IconMapper name="edit_note" className="text-[28px] sm:text-[32px]" />
          </div>
          <h3 className="font-['Playfair_Display'] text-[20px] sm:text-[22px] font-semibold text-[#2b1611]">
            AI Ready
          </h3>
          <p className="font-['Hanken_Grotesk'] text-[14px] sm:text-[15px] leading-[22px] sm:leading-[24px] text-[#564240]">
            Integrated with our AI workshop, tailoring every line of experience to match the
            specific job description you&apos;re targeting.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 sm:p-8 flex flex-col items-center text-center space-y-3 sm:space-y-4 rounded-xl border border-[#E5D9C8] shadow-sm hover:shadow-md transition-shadow">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#ffe9e5] flex items-center justify-center text-[#5b060c]">
            <IconMapper name="picture_as_pdf" className="text-[28px] sm:text-[32px]" />
          </div>
          <h3 className="font-['Playfair_Display'] text-[20px] sm:text-[22px] font-semibold text-[#2b1611]">
            Instant Export
          </h3>
          <p className="font-['Hanken_Grotesk'] text-[14px] sm:text-[15px] leading-[22px] sm:leading-[24px] text-[#564240]">
            High-resolution vector PDF generation ensures your resume looks as crisp on paper as it
            does on a hiring manager&apos;s screen.
          </p>
        </div>
      </div>
    </section>
  );
}
