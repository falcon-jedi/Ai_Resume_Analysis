'use client';
import { IconMapper } from '@/app/_components/icons/IconMapper';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface TemplateItem {
  id: string;
  name: string;
  previewImage: string;
  category?: string;
}

const defaultTemplates: TemplateItem[] = [
  {
    id: 'modernist',
    name: 'The Modernist',
    previewImage:
      'https://lh3.googleusercontent.com/aida/AEtjO1VH3FNyrI24OZ3cSwfU3v3SstbjwAOlJrPz-Cs1ubQLLSpyzmhK3PRDQeqGiJxTr7hj2YTREaJPp5kvmEMZShZqdSZEyCQplcl2yTAVHRi0CpJI5OqLPmZHfIZ6tOj8WfqBWJ7iIQx63phognvki5U206UG_qIs5bxjzBlSrG9vpmX-StrIIdgZZQPHNdDnxtKbjntkaPJSTks_NCCQQ3omZt2W6gJeyoHjp8SHEBJ-32zw_cfxJAAFGvrf',
  },
  {
    id: 'executive',
    name: 'The Executive',
    previewImage:
      'https://lh3.googleusercontent.com/aida/AEtjO1X4UBHOpwlVOdd7UQyuXAdoP-3rCR0ATP2HNzy3HRkJz5D8AMnYPMAe5C1-qyNGxpdQMJaIdX1Yxxh_SIrRACkO4eXyBRklwRTsERbagpXhLrMzmDl_TRDV1NCV0m8wqvo4dy_XBRhrhWeGVrIMjQDu4MN9NwX2x3X1nxsfRk8MvHD1l79aL0Bpo33KSx3SFtS4_tuy70X5QKWtQbX_m94QOUhKjgu9FLNUu68YhSQDWJLjjo7J3hsA8iJ5',
  },
  {
    id: 'creative',
    name: 'The Creative',
    previewImage:
      'https://lh3.googleusercontent.com/aida/AEtjO1Vy_u0uTQqMVvTzjNtFIULskQG61o4tFa2NQfkCFbR5Ov5bYCXblDEcRAx8fFglEojKZFi8Gr4nDYnF5RGq3BHZKymC7mvA3AN7LKCLULbS9ANhHmeSS5pR7_iumWanRaBuTUQB8wQWJE4t35KtDDpcIBGETYFza4A0sWcPEfDXGGRuI6szh6iE7psyXbCwHT5O9MFk92j1zmu9bWb0oheCQailTHSqWJ0nes3cW70sWoECIc_-2rbhur51',
  },
  {
    id: 'minimalist',
    name: 'The Minimalist',
    previewImage:
      'https://lh3.googleusercontent.com/aida/AEtjO1VH3FNyrI24OZ3cSwfU3v3SstbjwAOlJrPz-Cs1ubQLLSpyzmhK3PRDQeqGiJxTr7hj2YTREaJPp5kvmEMZShZqdSZEyCQplcl2yTAVHRi0CpJI5OqLPmZHfIZ6tOj8WfqBWJ7iIQx63phognvki5U206UG_qIs5bxjzBlSrG9vpmX-StrIIdgZZQPHNdDnxtKbjntkaPJSTks_NCCQQ3omZt2W6gJeyoHjp8SHEBJ-32zw_cfxJAAFGvrf',
  },
  {
    id: 'artisan',
    name: 'The Artisan',
    previewImage:
      'https://lh3.googleusercontent.com/aida/AEtjO1X4UBHOpwlVOdd7UQyuXAdoP-3rCR0ATP2HNzy3HRkJz5D8AMnYPMAe5C1-qyNGxpdQMJaIdX1Yxxh_SIrRACkO4eXyBRklwRTsERbagpXhLrMzmDl_TRDV1NCV0m8wqvo4dy_XBRhrhWeGVrIMjQDu4MN9NwX2x3X1nxsfRk8MvHD1l79aL0Bpo33KSx3SFtS4_tuy70X5QKWtQbX_m94QOUhKjgu9FLNUu68YhSQDWJLjjo7J3hsA8iJ5',
  },
  {
    id: 'classic',
    name: 'The Classic',
    previewImage:
      'https://lh3.googleusercontent.com/aida/AEtjO1Vy_u0uTQqMVvTzjNtFIULskQG61o4tFa2NQfkCFbR5Ov5bYCXblDEcRAx8fFglEojKZFi8Gr4nDYnF5RGq3BHZKymC7mvA3AN7LKCLULbS9ANhHmeSS5pR7_iumWanRaBuTUQB8wQWJE4t35KtDDpcIBGETYFza4A0sWcPEfDXGGRuI6szh6iE7psyXbCwHT5O9MFk92j1zmu9bWb0oheCQailTHSqWJ0nes3cW70sWoECIc_-2rbhur51',
  },
];

export function LandingFeatures() {
  const [templates, setTemplates] = useState<TemplateItem[]>(defaultTemplates);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const res = await fetch('/api/template');
        const data = await res.json();
        if (
          data?.success &&
          Array.isArray(data.data?.templates) &&
          data.data.templates.length > 0
        ) {
          setTemplates(data.data.templates);
        }
      } catch (e) {
        console.error('Failed to load templates from API:', e);
      }
    }
    fetchTemplates();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <>
      {/* Core Features & Highlights Section */}
      <section
        className="w-full py-14 sm:py-24 bg-[#FFF8F6] relative overflow-hidden"
        id="features"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-16">
          <div className="text-center mb-12 sm:mb-20 flex flex-col items-center">
            <h2 className="font-['Playfair_Display'] text-[26px] sm:text-[36px] md:text-[48px] leading-tight md:leading-[56px] md:tracking-[-0.02em] font-bold text-[#370003] mb-4 sm:mb-6">
              Everything You Need to Land Your Next Job
            </h2>
            <p className="font-['Hanken_Grotesk'] text-[15px] sm:text-[18px] leading-[24px] sm:leading-[28px] text-[#564240] max-w-3xl">
              Build a better resume, understand your ATS score, discover relevant jobs, and optimize
              every application with AI.
            </p>
          </div>

          <div className="flex flex-col gap-16 sm:gap-24 lg:gap-32">
            {/* Feature 1: AI Resume Builder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
              <div className="flex flex-col gap-5 sm:gap-6 order-2 lg:order-1">
                <div className="w-12 h-12 bg-[#5b060c] rounded-full flex items-center justify-center">
                  <IconMapper name="edit_document" className="text-[#e46e69]" />
                </div>
                <h3 className="font-['Playfair_Display'] text-[22px] sm:text-[28px] md:text-[32px] leading-tight sm:leading-[40px] font-semibold text-[#2b1611]">
                  AI Resume Builder
                </h3>
                <p className="font-['Hanken_Grotesk'] text-[15px] sm:text-[18px] leading-[24px] sm:leading-[28px] text-[#564240]">
                  Create professional, eye-catching resumes from scratch in minutes. Our intelligent
                  builder guides you through Personal Info, Experience, and Education, while AI
                  suggests powerful phrasing tailored to your industry.
                </p>
                <div className="mt-2 sm:mt-4">
                  <Link
                    href="/app/signup"
                    className="inline-block bg-[#370003] text-white font-['Hanken_Grotesk'] text-[14px] leading-[20px] tracking-[0.05em] font-semibold px-6 py-3 rounded-full hover:scale-105 transition-transform shadow-md"
                  >
                    Build Your Resume
                  </Link>
                </div>
              </div>

              <div className="order-1 lg:order-2 bg-[#FFF8EE] rounded-2xl p-4 sm:p-6 shadow-xl relative transform lg:-rotate-2 hover:rotate-0 transition-transform duration-500 border border-[#E5D9C8]">
                <div className="absolute inset-0 border border-[#E5D9C8]/50 rounded-2xl pointer-events-none" />
                <div className="bg-[#FFF8F6] rounded-lg shadow-sm border border-[#ffe9e5] overflow-hidden h-[360px] flex flex-col">
                  <div className="bg-[#fff0ee] px-4 py-3 border-b border-[#ffe9e5] flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ba1a1a]/50" />
                    <div className="w-3 h-3 rounded-full bg-[#f6be39]/50" />
                    <div className="w-3 h-3 rounded-full bg-[#795900]/50" />
                  </div>
                  <div className="p-6 flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="h-6 w-48 bg-[#ffe9e5] rounded mb-2" />
                        <div className="h-4 w-32 bg-[#ffe9e5] rounded" />
                      </div>
                    </div>
                    <div className="h-px w-full bg-[#E5D9C8] mb-6" />
                    <div className="h-5 w-32 bg-[#ffe9e5] rounded mb-4" />
                    <div className="space-y-3 mb-8">
                      <div className="h-16 w-full bg-white border border-[#370003]/20 rounded-lg p-3 flex gap-3 items-center relative shadow-sm">
                        <IconMapper name="auto_awesome" className="text-[#370003] text-sm" />
                        <div className="flex-1 space-y-2">
                          <div className="h-2 w-full bg-[#ffe9e5] rounded" />
                          <div className="h-2 w-5/6 bg-[#ffe9e5] rounded" />
                        </div>
                      </div>
                      <div className="h-12 w-full bg-[#ffe9e5] rounded-lg opacity-50" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: ATS Score & Resume Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
              <div className="bg-[#FFF8EE] rounded-2xl p-4 sm:p-6 shadow-xl relative transform lg:rotate-2 hover:rotate-0 transition-transform duration-500 border border-[#E5D9C8]">
                <div className="absolute inset-0 border border-[#E5D9C8]/50 rounded-2xl pointer-events-none" />
                <div className="bg-[#FFF8F6] rounded-lg shadow-sm border border-[#ffe9e5] overflow-hidden h-[360px] p-4 sm:p-6 flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <span className="font-['Hanken_Grotesk'] text-[12px] font-semibold text-[#564240] uppercase tracking-widest">
                      ATS Scan Result
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#370003] opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[#370003]" />
                      </span>
                      <span className="text-xs text-[#370003] font-medium">Live Analysis</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center py-4">
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          className="text-[#ffe9e5]"
                          cx="50"
                          cy="50"
                          fill="transparent"
                          r="45"
                          stroke="currentColor"
                          strokeWidth="8"
                        />
                        <circle
                          className="text-[#370003] transition-all duration-1000 ease-out"
                          cx="50"
                          cy="50"
                          fill="transparent"
                          r="45"
                          stroke="currentColor"
                          strokeDasharray="283"
                          strokeDashoffset="36.79"
                          strokeLinecap="round"
                          strokeWidth="8"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="font-['Playfair_Display'] text-3xl font-bold text-[#370003]">
                          87
                        </span>
                        <span className="text-xs text-[#564240] uppercase">/ 100</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-[#fff0ee] p-3 rounded-lg flex items-center justify-between border-l-4 border-[#f6be39]">
                      <span className="text-sm font-medium text-[#2b1611]">
                        Missing keyword: &ldquo;Agile Methodologies&rdquo;
                      </span>
                      <button className="text-xs bg-white text-[#370003] px-2 py-1 rounded shadow-sm hover:text-[#5b060c] font-semibold">
                        Add
                      </button>
                    </div>
                    <div className="bg-[#fff0ee] p-3 rounded-lg flex items-center justify-between border-l-4 border-[#795900]">
                      <span className="text-sm font-medium text-[#2b1611]">
                        Formatting looks perfect.
                      </span>
                      <IconMapper name="check_circle" className="text-[#795900] text-sm" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-5 sm:gap-6">
                <div className="w-12 h-12 bg-[#fed174] rounded-full flex items-center justify-center">
                  <IconMapper name="fact_check" className="text-[#785800]" />
                </div>
                <h3 className="font-['Playfair_Display'] text-[22px] sm:text-[28px] md:text-[32px] leading-tight sm:leading-[40px] font-semibold text-[#2b1611]">
                  ATS Score &amp; Analysis
                </h3>
                <p className="font-['Hanken_Grotesk'] text-[15px] sm:text-[18px] leading-[24px] sm:leading-[28px] text-[#564240]">
                  Stop guessing if your resume will pass the filters. Get an instant ATS
                  compatibility score out of 100, complete with keyword gap analysis, structural
                  feedback, and actionable improvement suggestions.
                </p>
              </div>
            </div>

            {/* Feature 3: AI-Powered Resume Optimization */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
              <div className="flex flex-col gap-5 sm:gap-6 order-2 lg:order-1">
                <div className="w-12 h-12 bg-[#ffdad7] rounded-full flex items-center justify-center">
                  <IconMapper name="model_training" className="text-[#410004]" />
                </div>
                <h3 className="font-['Playfair_Display'] text-[22px] sm:text-[28px] md:text-[32px] leading-tight sm:leading-[40px] font-semibold text-[#2b1611]">
                  AI-Powered Optimization
                </h3>
                <p className="font-['Hanken_Grotesk'] text-[15px] sm:text-[18px] leading-[24px] sm:leading-[28px] text-[#564240]">
                  Transform passive responsibilities into active achievements. The Digital Nib
                  rewrites your bullet points to emphasize impact, quantify results, and incorporate
                  the exact terminology hiring managers look for.
                </p>
              </div>

              <div className="order-1 lg:order-2 bg-[#FFF8EE] rounded-2xl p-4 sm:p-6 shadow-xl relative transform lg:rotate-1 hover:rotate-0 transition-transform duration-500 border border-[#E5D9C8]">
                <div className="absolute inset-0 border border-[#E5D9C8]/50 rounded-2xl pointer-events-none" />
                <div className="bg-[#FFF8F6] rounded-lg shadow-sm border border-[#ffe9e5] h-[360px] flex flex-col justify-center p-5 sm:p-8 relative overflow-hidden">
                  <div className="flex flex-col gap-2 mb-8 relative z-10">
                    <span className="text-xs uppercase text-[#564240] font-bold tracking-wider">
                      Before
                    </span>
                    <div className="bg-[#ffdad6]/40 border border-[#ffdad6] p-4 rounded-lg text-[#564240] font-['Hanken_Grotesk'] line-through decoration-[#ba1a1a]/40">
                      &ldquo;Worked on backend APIs&rdquo;
                    </div>
                  </div>
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[#370003] rounded-full flex items-center justify-center z-20 shadow-lg">
                    <IconMapper name="arrow_downward" className="text-white text-sm" />
                  </div>
                  <div className="flex flex-col gap-2 relative z-10">
                    <span className="text-xs uppercase text-[#370003] font-bold tracking-wider flex items-center gap-1">
                      <IconMapper name="auto_awesome" className="text-sm" /> After AI Optimization
                    </span>
                    <div className="bg-[#5b060c]/10 border border-[#370003]/20 p-4 rounded-lg text-[#2b1611] font-['Hanken_Grotesk'] shadow-inner">
                      &ldquo;Developed and optimized RESTful APIs using Node.js, improving system
                      response time by 35% and supporting 10k+ daily active users.&rdquo;
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Resume Templates Section — Full Width */}
      <section className="w-full py-14 sm:py-24 bg-[#fff0ee] border-y border-[#E5D9C8] relative overflow-hidden">
        {/* Decorative Backgrounds */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#5b060c]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#fed174]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 md:px-16 flex flex-col items-center text-center mb-8 sm:mb-10 relative z-10">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#FFF8F6] rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-md">
            <IconMapper name="style" className="text-[#370003] text-xl sm:text-2xl" />
          </div>
          <h3 className="font-['Playfair_Display'] text-2xl sm:text-3xl md:text-5xl font-bold text-[#370003] mb-3 sm:mb-4">
            Professional Resume Templates
          </h3>
          <p className="font-['Hanken_Grotesk'] text-[15px] sm:text-[18px] leading-[24px] sm:leading-[28px] text-[#564240] max-w-2xl">
            Choose from a curated collection of ATS-friendly templates. Whether you need a modern
            creative layout or a traditional corporate format, our designs ensure your application
            stands out.
          </p>
        </div>

        {/* Scrollable Gallery Track with Left/Right Navigation */}
        <div className="relative w-full px-2 sm:px-4 md:px-12 my-4 sm:my-6">
          {/* Scroll Left Button */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-1 sm:left-2 md:left-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-12 sm:h-12 bg-[#FFF8F6] text-[#370003] border border-[#E5D9C8] rounded-full shadow-lg flex items-center justify-center hover:bg-[#ffe9e5] hover:scale-110 transition-all cursor-pointer"
            aria-label="Scroll left"
          >
            <IconMapper name="chevron_left" className="text-xl sm:text-2xl" />
          </button>

          {/* Scroll Right Button */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-1 sm:right-2 md:right-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-12 sm:h-12 bg-[#FFF8F6] text-[#370003] border border-[#E5D9C8] rounded-full shadow-lg flex items-center justify-center hover:bg-[#ffe9e5] hover:scale-110 transition-all cursor-pointer"
            aria-label="Scroll right"
          >
            <IconMapper name="chevron_right" className="text-xl sm:text-2xl" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth py-4 sm:py-6 px-8 sm:px-12 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {templates.map((tpl) => (
              <div
                key={tpl.id || tpl.name}
                className="shrink-0 w-[220px] sm:w-[280px] snap-start group/card"
              >
                <div className="bg-[#FFF8EE] rounded-xl border border-[#ddc0bd] p-3 shadow-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl relative overflow-hidden flex flex-col h-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={tpl.name}
                    className="w-full h-64 sm:h-72 object-cover rounded-lg mb-3 bg-[#ffe9e5]"
                    src={tpl.previewImage}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://lh3.googleusercontent.com/aida/AEtjO1VH3FNyrI24OZ3cSwfU3v3SstbjwAOlJrPz-Cs1ubQLLSpyzmhK3PRDQeqGiJxTr7hj2YTREaJPp5kvmEMZShZqdSZEyCQplcl2yTAVHRi0CpJI5OqLPmZHfIZ6tOj8WfqBWJ7iIQx63phognvki5U206UG_qIs5bxjzBlSrG9vpmX-StrIIdgZZQPHNdDnxtKbjntkaPJSTks_NCCQQ3omZt2W6gJeyoHjp8SHEBJ-32zw_cfxJAAFGvrf';
                    }}
                  />
                  <div className="absolute inset-0 bg-[#370003]/40 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center p-2">
                    <Link
                      href={`/app/signup?template=${encodeURIComponent(tpl.id || tpl.name)}`}
                      className="bg-white text-[#370003] font-['Hanken_Grotesk'] text-[12px] font-semibold px-4 py-2 rounded-full shadow-lg hover:bg-[#ffe9e5] transition-colors"
                    >
                      Use This Template
                    </Link>
                  </div>
                  <p className="font-['Hanken_Grotesk'] text-sm font-semibold text-[#370003] text-center py-1 truncate">
                    {tpl.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <Link
            href="/app/templates"
            className="bg-[#FFF8F6] text-[#370003] border border-[#8a716f] font-['Hanken_Grotesk'] text-[14px] leading-[20px] font-semibold px-8 py-3 rounded-full hover:bg-[#ffe9e5] transition-colors shadow-md relative z-10"
          >
            See All Templates
          </Link>
        </div>
      </section>

      {/* Bento Features Section — The Modern Artisan's Toolkit */}
      <section className="w-full py-14 sm:py-24 bg-[#fff0ee] relative border-t border-[#E5D9C8]">
        <div className="max-w-7xl mx-auto px-4 md:px-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 sm:mb-16 gap-6 sm:gap-8">
            <div className="flex flex-col gap-3 sm:gap-4 max-w-2xl">
              <h2 className="font-['Playfair_Display'] text-[26px] sm:text-[36px] md:text-[48px] leading-tight md:leading-[56px] font-bold text-[#370003]">
                The Modern Artisan&apos;s Toolkit
              </h2>
              <p className="font-['Hanken_Grotesk'] text-[15px] sm:text-[18px] leading-[24px] sm:leading-[28px] text-[#564240]">
                Precision engineering meets editorial elegance. Our suite is designed to curate your
                professional history into a compelling narrative artifact.
              </p>
            </div>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(280px,auto)]">
            {/* Large Feature: Resume Builder */}
            <div className="md:col-span-2 bg-[#FFF8F6] rounded-2xl p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden group shadow-[0_4px_20px_rgba(78,52,46,0.03)] hover:shadow-[0_8px_30px_rgba(78,52,46,0.06)] transition-shadow duration-300 border border-[#E5D9C8]">
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#ffe2dc] to-transparent opacity-30 transform translate-x-4 group-hover:translate-x-0 transition-transform duration-500" />
              <div className="relative z-10 flex flex-col gap-4 max-w-md">
                <div className="w-12 h-12 bg-[#5b060c] rounded-full flex items-center justify-center mb-2">
                  <IconMapper name="architecture" className="text-[#e46e69]" />
                </div>
                <h3 className="font-['Playfair_Display'] text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] font-semibold text-[#2b1611]">
                  Architectural Resume Builder
                </h3>
                <p className="font-['Hanken_Grotesk'] text-base text-[#564240]">
                  Construct your profile with structural integrity. Our AI contextualizes your
                  experience, suggesting impactful phrasing and optimal layouts for readability and
                  presence.
                </p>
              </div>

              <div className="absolute bottom-[-20%] right-[-10%] w-64 h-64 opacity-20 pointer-events-none">
                <svg
                  className="w-full h-full text-[#370003]"
                  fill="currentColor"
                  viewBox="0 0 100 100"
                >
                  <rect height="80" rx="2" width="30" x="10" y="10" />
                  <rect height="20" rx="2" width="40" x="50" y="30" />
                  <rect height="30" rx="2" width="40" x="50" y="60" />
                </svg>
              </div>
            </div>

            {/* Medium Feature: ATS Analyzer */}
            <div className="bg-[#FFF8F6] rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group shadow-[0_4px_20px_rgba(78,52,46,0.03)] hover:shadow-[0_8px_30px_rgba(78,52,46,0.06)] transition-shadow duration-300 border border-[#E5D9C8]">
              <div className="relative z-10 flex flex-col gap-4">
                <div className="w-12 h-12 bg-[#fed174] rounded-full flex items-center justify-center mb-2">
                  <IconMapper name="troubleshoot" className="text-[#785800]" />
                </div>
                <h3 className="font-['Playfair_Display'] text-[22px] sm:text-[24px] leading-[30px] sm:leading-[32px] font-semibold text-[#2b1611]">
                  The Gatekeeper
                </h3>
                <p className="font-['Hanken_Grotesk'] text-base text-[#564240]">
                  Bypass digital filters. Real-time ATS scoring aligns your vocabulary with the job
                  description.
                </p>
              </div>

              <div className="mt-8 flex items-center justify-center relative">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    className="text-[#ffdad3]"
                    cx="50"
                    cy="50"
                    fill="transparent"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                  />
                  <circle
                    className="text-[#795900]"
                    cx="50"
                    cy="50"
                    fill="transparent"
                    r="40"
                    stroke="currentColor"
                    strokeDasharray="251"
                    strokeDashoffset="30"
                    strokeLinecap="round"
                    strokeWidth="8"
                  />
                </svg>
                <span className="absolute font-['Playfair_Display'] text-2xl font-bold text-[#370003]">
                  88%
                </span>
              </div>
            </div>

            {/* Medium Feature: Cover Letters */}
            <div className="bg-[#370003] text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group shadow-xl">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="relative z-10 flex flex-col gap-4">
                <div className="w-12 h-12 bg-[#ffdad7] rounded-full flex items-center justify-center mb-2">
                  <IconMapper name="mark_email_unread" className="text-[#410004]" />
                </div>
                <h3 className="font-['Playfair_Display'] text-[22px] sm:text-[24px] leading-[30px] sm:leading-[32px] font-semibold text-white">
                  Postmarked Letters
                </h3>
                <p className="font-['Hanken_Grotesk'] text-base text-[#ffb3ae]">
                  Tailored cover letters generated with editorial flair, referencing specific
                  corporate milestones and role requirements.
                </p>
              </div>
              <div className="mt-8 flex justify-end">
                <div className="w-16 h-16 rounded-full bg-[#f6be39] shadow-md flex items-center justify-center relative transform group-hover:rotate-12 transition-transform duration-500">
                  <div className="absolute inset-1 rounded-full border border-[#795900]/30" />
                  <span className="font-['Playfair_Display'] text-2xl font-bold text-[#795900] opacity-80 leading-none">
                    JP
                  </span>
                </div>
              </div>
            </div>

            {/* Medium Feature: AI Editor */}
            <div className="md:col-span-2 bg-[#FFF8F6] rounded-2xl p-0 flex flex-col sm:flex-row relative overflow-hidden group shadow-[0_4px_20px_rgba(78,52,46,0.03)] border border-[#E5D9C8]">
              <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-center gap-4 sm:w-1/2 z-10 bg-[#FFF8F6]">
                <div className="w-12 h-12 bg-[#5e0001] rounded-full flex items-center justify-center mb-2">
                  <IconMapper name="draw" className="text-[#eb6a59]" />
                </div>
                <h3 className="font-['Playfair_Display'] text-[28px] leading-[36px] font-semibold text-[#2b1611]">
                  The Digital Nib
                </h3>
                <p className="font-['Hanken_Grotesk'] text-base text-[#564240]">
                  Highlight any phrasing and summon the AI to refine tone, adjust length, or
                  translate technical jargon into business impact.
                </p>
              </div>
              <div className="sm:w-1/2 bg-[#FFF8EE] relative overflow-hidden min-h-[220px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDI77u-w4Irhqq91dXxc3wSFWw6egQlZhpz3owz7O78Rb9toHg-HFoMeHudaHu-9UI3_1A7jSCs14IsSqPznV2r4ckQ_2SiTnkJkZLd8xPTOxSSUWekogV5pzp968Qs_0r16p7kfQofgHy8sGRyNxC__oSh3TD6VLgdbBOltSQlbhe6k_DeB7mhwZLroYNlV-bpqykSu2R5u3K7ZGd_iS6WzP4UfTiJjRUzuddkBtAqt2IhNYbH11Y8Q"
                  alt="Digital Nib Editor UI"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#FFF8F6] to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
