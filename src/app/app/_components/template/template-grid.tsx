'use client';
import { IconMapper } from '@/app/_components/icons/IconMapper';

import React from 'react';
import { TemplateCard } from './template-card';
import type { TemplateData } from './template-card';

interface TemplateGridProps {
  templates: TemplateData[];
  /** When false, isPremium templates show a lock overlay instead of use/preview buttons */
  canAccessPremium?: boolean;
  onUseTemplate: (id: string) => void;
  onPreview: (id: string) => void;
}

export function TemplateGrid({
  templates,
  canAccessPremium = false,
  onUseTemplate,
  onPreview,
}: TemplateGridProps) {
  if (templates.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 md:px-16 py-16 text-center">
        <div className="bg-white p-12 max-w-xl mx-auto rounded-xl border border-[#E5D9C8] shadow-sm">
          <IconMapper name="find_in_page" className="text-[64px] text-[#5b060c] opacity-40 mb-4" />
          <h3 className="font-['Playfair_Display'] text-[24px] leading-[32px] font-semibold text-[#2b1611] mb-2">
            No templates found
          </h3>
          <p className="font-['Hanken_Grotesk'] text-[16px] text-[#564240]">
            Try adjusting your search terms or category filters to find the perfect style.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-16 py-4 sm:py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
        {templates.map((tpl) => (
          <TemplateCard
            key={tpl.id}
            template={tpl}
            isLocked={tpl.isPremium && !canAccessPremium}
            onUseTemplate={onUseTemplate}
            onPreview={onPreview}
          />
        ))}
      </div>
    </section>
  );
}
