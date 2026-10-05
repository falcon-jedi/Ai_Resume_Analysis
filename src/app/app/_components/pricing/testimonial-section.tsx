import { IconMapper } from '@/app/_components/icons/IconMapper';
import React from 'react';
import type { TestimonialResponse } from '@/app/api/model/response/pricing';

interface TestimonialSectionProps {
  testimonials: TestimonialResponse[];
}

export function TestimonialSection({ testimonials }: TestimonialSectionProps) {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="mt-32 flex flex-col gap-20">
      {testimonials.map((t) => (
        <div key={t.id} className="text-center max-w-3xl mx-auto">
          <IconMapper name="format_quote" className="text-[#5b060c] text-4xl mb-6 select-none" />
          <p className="font-['Playfair_Display'] text-[32px] leading-[40px] italic text-[#2b1611] leading-relaxed mb-8">
            &ldquo;{t.review}&rdquo;
          </p>
          <div className="flex items-center justify-center gap-4">
            {t.image && (
              <div className="w-12 h-12 rounded-full border border-[#ddc0bd] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="w-full h-full object-cover" src={t.image} alt={t.name} />
              </div>
            )}
            <div className="text-left">
              <div className="font-bold text-[#2b1611] font-['Hanken_Grotesk'] text-[14px] leading-[20px] tracking-[0.05em] uppercase tracking-wide">
                {t.name}
              </div>
              <div className="text-[#564240] font-['Hanken_Grotesk'] text-[12px] leading-[16px] font-medium">
                {t.designation}
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
