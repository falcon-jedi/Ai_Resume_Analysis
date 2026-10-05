'use client';
import { IconMapper } from '@/app/_components/icons/IconMapper';

import { useEffect, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { cn } from '@/app/app/_util/cn';
import type { UpdateResumeDTO } from '@/app/api/model/request/resume/resume';
import { SECTION_REGISTRY } from './section-registry';

interface SectionStepperProps {
  active: string;
  onChange: (key: string) => void;
  form: UseFormReturn<UpdateResumeDTO>;
  /** Raw section keys from template metadata.json (e.g. "personal", "experience"). */
  templateSections?: string[];
}

export function SectionStepper({ active, onChange, form, templateSections }: SectionStepperProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef<HTMLButtonElement | null>(null);

  // Filter the registry to only sections declared by the chosen template.
  // Order comes from metadata.json; labels and form keys come from the registry.
  const visibleSections =
    templateSections && templateSections.length > 0
      ? SECTION_REGISTRY.filter((s) => templateSections.includes(s.templateKey))
      : SECTION_REGISTRY; // fallback while template data loads

  // Reactive form values — completion ticks update as user types
  const values = form.watch();

  const isSectionCompleted = (key: string): boolean => {
    switch (key) {
      case 'personalInfo':
        return !!(values.personalInfo?.fullName && values.personalInfo?.email);
      case 'summary':
        return !!values.personalInfo?.summary;
      case 'experience':
        return !!(values.experiences && values.experiences.length > 0);
      case 'education':
        return !!(values.education && values.education.length > 0);
      case 'projects':
        return !!(values.projects && values.projects.length > 0);
      case 'skills':
        return !!(values.skills && values.skills.length > 0);
      case 'certifications':
        return !!(values.certifications && values.certifications.length > 0);
      case 'achievements':
        return !!(values.achievements && values.achievements.length > 0);
      case 'languages':
        return !!(values.languages && values.languages.length > 0);
      case 'references':
        return !!(values.references && values.references.length > 0);
      default:
        return false;
    }
  };

  // Scroll active tab into view whenever it changes
  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [active]);

  const handleScroll = (direction: 'left' | 'right') => {
    scrollRef.current?.scrollBy({
      left: direction === 'left' ? -150 : 150,
      behavior: 'smooth',
    });
  };

  return (
    <nav className="h-11 sm:h-12 bg-white border-b border-[#ddc0bd] flex items-center px-2 sm:px-4 shrink-0 overflow-hidden select-none">
      {/* Scroll Left */}
      <button
        type="button"
        onClick={() => handleScroll('left')}
        className="p-1 hover:bg-[#fff0ed] rounded-full transition-colors text-[#564240] hover:text-[#7a1f1f] focus:outline-none shrink-0 cursor-pointer"
        aria-label="Scroll tabs left"
      >
        <IconMapper name="chevron_left" className="text-lg sm:text-xl" />
      </button>

      {/* Tab list */}
      <div
        ref={scrollRef}
        className="flex-1 flex items-center px-2 sm:px-4 gap-3.5 sm:gap-6 md:gap-8 h-full overflow-x-auto no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {visibleSections.map((s) => {
          const isCompleted = isSectionCompleted(s.key);
          const isActive = active === s.key;

          return (
            <button
              key={s.key}
              id={`stepper-${s.key}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              ref={isActive ? activeRef : null}
              onClick={() => onChange(s.key)}
              className={cn(
                "relative h-full flex items-center gap-1.5 font-['Hanken_Grotesk'] text-[13px] sm:text-[14px] font-semibold transition-all whitespace-nowrap px-1 cursor-pointer focus:outline-none shrink-0",
                isActive
                  ? 'text-[#7a1f1f] font-bold border-b-2 border-[#7a1f1f]'
                  : 'text-[#564240] hover:text-[#7a1f1f]',
              )}
            >
              {isCompleted && (
                <IconMapper
                  name="check_circle"
                  className="text-sm text-[#7a1f1f]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                />
              )}
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Scroll Right */}
      <button
        type="button"
        onClick={() => handleScroll('right')}
        className="p-1 hover:bg-[#fff0ed] rounded-full transition-colors text-[#564240] hover:text-[#7a1f1f] focus:outline-none"
        aria-label="Scroll tabs right"
      >
        <IconMapper name="chevron_right" className="text-xl" />
      </button>
    </nav>
  );
}
