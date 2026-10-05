'use client';
import { IconMapper } from '@/app/_components/icons/IconMapper';

import Link from 'next/link';

export function LandingHero() {
  return (
    <section className="relative w-full overflow-hidden bg-[#FFF8F6] pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-32">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#5b060c]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#fed174]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-16 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Typography & CTA */}
        <div className="flex flex-col items-start gap-5 sm:gap-8">
          <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 bg-[#ffe9e5] rounded-full shadow-sm">
            <IconMapper
              name="auto_awesome"
              className="text-[#370003] text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            />
            <span className="font-['Hanken_Grotesk'] text-[11px] sm:text-[12px] leading-[16px] font-semibold text-[#564240] uppercase tracking-widest">
              Introducing The Digital Nib
            </span>
          </div>

          <h1 className="font-['Playfair_Display'] text-[28px] sm:text-[36px] md:text-[48px] leading-[36px] sm:leading-[44px] md:leading-[56px] md:tracking-[-0.02em] font-bold text-[#370003] max-w-2xl">
            Craft Your Career Letter With AI
          </h1>

          <p className="font-['Hanken_Grotesk'] text-[15px] sm:text-[18px] leading-[24px] sm:leading-[28px] text-[#564240] max-w-xl">
            Elevate your professional narrative. JobPatra merges the heritage of tactile
            storytelling with advanced AI to architect resumes and cover letters that pass the
            gatekeepers and resonate with decision-makers.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mt-2 sm:mt-4 w-full sm:w-auto">
            <Link
              href="/app/signup"
              className="w-full sm:w-auto justify-center bg-[#370003] text-white font-['Hanken_Grotesk'] text-[14px] leading-[20px] tracking-[0.05em] font-semibold px-6 sm:px-8 py-3.5 sm:py-4 rounded-full shadow-xl hover:scale-105 transition-transform duration-300 flex items-center gap-2 group"
            >
              Start Architecting
              <IconMapper
                name="arrow_forward"
                className="text-sm transition-transform group-hover:translate-x-1"
              />
            </Link>

            <div className="flex flex-col gap-1">
              <div className="flex -space-x-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-[#FFF8F6] object-cover shadow-sm z-30"
                  alt="Professional woman"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD04HIz-aC3QXXzLqVE5j1X9G4dzaENdDv5_2Bj4u760oBfvnEsulO-kZed3ypsbpqLcs-E77nVuQUMqesoG0lczY1EOypj79Gr00XNux9qbLiQ3dnQYht00o_f1VzSLuAd8v3O72FfQ5x7fq6ul3FR6Q9GepvAgeuRU7vqnEm2bpJdOVSbNJ3waw4A4CWLafPWBzz1tyiaUs1BtFFamZqR-nPsAwgJowrAf2joCCnHcvaPo9YtFzLg8w"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-[#FFF8F6] object-cover shadow-sm z-20"
                  alt="Professional man"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDa5mUyXaw2gHuIREoLSR1WdEQAldLul9d6JqG0765GDmV4mujcR-UWdUQbQ1gVlJXYkZgWCHfRXRKW7tng5r5GQ0BaTGbcTzhWDixCzAl_QT3lDTKcvNoxRQ_zThdVcPh5vrlwNUe37OqsssADb3mVo1fIiOHnk4kixBx9aq3sTdBCo5YoJVFWn5bzzIluZqGdDVHkENiI9Gz3bEllOmzXqLFxjDbZDHXxXH-isdFtXyhb3iSH-nopdA"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-[#FFF8F6] object-cover shadow-sm z-10"
                  alt="Executive"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkdddeZJs2ZXHJqVbS0cIlBE0RrijJhKLqBLlil6o9zkOedtMY1hk2Sai0WfrGZhq_R3XTsvHpopBCysHs-1saljVBBW6KZ2iN58g07H7H9YPIp1jT-aVFK9iA0Ad8iUtvwUGLwYyqBiRTovql0tg21VTcOIB1ggH7_2iyDeqq3F04YeC9LGu7XhQ-iOQ7pmB6wZ8QMbjotnUhMQ54lgyI9igDvqobsW-xDAQrWfLM8G2K0iB4pileTg"
                />
              </div>
              <span className="font-['Hanken_Grotesk'] text-[11px] sm:text-[12px] leading-[16px] font-medium text-[#564240]">
                Join 10,000+ professionals
              </span>
            </div>
          </div>
        </div>

        {/* Layered UI Visualization */}
        <div className="relative h-[480px] sm:h-[550px] md:h-[600px] w-full flex items-center justify-center [perspective:1200px] scale-[0.82] sm:scale-95 md:scale-100 origin-center transition-transform">
          {/* Base Ledger Background */}
          <div className="absolute inset-0 bg-[#FFF8EE] rounded-2xl shadow-[0_8px_32px_rgba(78,52,46,0.08)] transform [rotateX(12deg)] [rotateY(-10deg)] scale-95 opacity-50 overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#E5D9C8_1px,transparent_1px)] [background-size:16px_16px]" />
          </div>

          {/* Main Document (Resume Card Mockup) */}
          <div className="absolute z-20 w-[320px] sm:w-[380px] h-[480px] sm:h-[520px] bg-[#FFF8F6] rounded-xl shadow-2xl overflow-hidden transform -rotate-2 hover:rotate-0 transition-transform duration-500 origin-bottom-left flex flex-col bg-opacity-95 backdrop-blur-md border border-[#E5D9C8]">
            <div className="h-2 w-full bg-[#370003] shrink-0" />
            <div className="p-6 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2 w-2/3">
                  <div className="h-6 w-3/4 bg-[#ffe9e5] rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-[#ffe9e5] rounded animate-pulse opacity-70" />
                </div>
                <div className="w-12 h-12 rounded-full bg-[#fed174] flex items-center justify-center shadow-inner">
                  <span className="font-['Playfair_Display'] text-[24px] font-semibold text-[#785800]">
                    JP
                  </span>
                </div>
              </div>
              <div className="h-px w-full bg-[#E5D9C8] my-2" />
              <div className="flex flex-col gap-3">
                <div className="h-4 w-full bg-[#ffe2dc] rounded" />
                <div className="h-4 w-11/12 bg-[#ffe2dc] rounded" />
                <div className="h-4 w-4/5 bg-[#ffe2dc] rounded" />
              </div>
              <div className="mt-4 flex gap-2 flex-wrap">
                <span className="px-3 py-1 bg-[#5b060c]/10 text-[#370003] rounded text-[10px] font-['Hanken_Grotesk'] font-semibold uppercase tracking-wider">
                  Product Management
                </span>
                <span className="px-3 py-1 bg-[#fed174]/20 text-[#795900] rounded text-[10px] font-['Hanken_Grotesk'] font-semibold uppercase tracking-wider">
                  Agile
                </span>
                <span className="px-3 py-1 bg-[#ffe9e5] text-[#564240] rounded text-[10px] font-['Hanken_Grotesk'] font-semibold uppercase tracking-wider">
                  Data Strategy
                </span>
              </div>

              {/* AI Magic Interaction Overlay */}
              <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 z-30">
                <div className="w-16 h-16 rounded-full bg-[#370003] shadow-xl flex items-center justify-center animate-[spin_10s_linear_infinite] opacity-90">
                  <svg
                    className="w-8 h-8 text-[#f6be39]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 2L15 8L21 9L16 14L18 20L12 17L6 20L8 14L3 9L9 8L12 2Z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="absolute inset-0 bg-[#f6be39]/20 rounded-full blur-xl animate-pulse" />
              </div>
            </div>
          </div>

          {/* Floating Sticky Note (AI Suggestion) */}
          <div className="absolute z-30 top-12 -right-4 sm:-right-8 w-44 sm:w-48 bg-[#FFF9C4] rounded shadow-lg transform rotate-6 p-4 flex flex-col gap-2 shadow-[2px_4px_12px_rgba(0,0,0,0.1)]">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FBC02D] rounded-l" />
            <div className="flex items-center gap-2 mb-1">
              <IconMapper name="edit_note" className="text-[#795900] text-sm" />
              <span className="font-['Hanken_Grotesk'] text-[12px] font-semibold text-[#795900] uppercase">
                AI Suggestion
              </span>
            </div>
            <p className="font-['Hanken_Grotesk'] text-sm text-[#2b1611] leading-tight">
              Quantify this achievement: &ldquo;Increased conversion by 24% over Q3.&rdquo;
            </p>
          </div>

          {/* Job Description Match Card */}
          <div className="absolute z-10 bottom-6 -left-6 sm:-left-12 w-56 sm:w-64 bg-white rounded-lg shadow-xl p-5 transform -rotate-6 flex flex-col gap-3 border border-[#E5D9C8]">
            <div className="flex justify-between items-center border-b border-[#E5D9C8] pb-2 mb-2">
              <span className="font-['Hanken_Grotesk'] text-[12px] font-semibold text-[#2b1611] uppercase tracking-widest">
                ATS Analysis
              </span>
              <span className="font-['Playfair_Display'] text-[24px] font-semibold text-[#370003]">
                94%
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-['Hanken_Grotesk'] text-sm text-[#564240]">Keywords</span>
                <IconMapper
                  name="check_circle"
                  className="text-[#795900] text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-['Hanken_Grotesk'] text-sm text-[#564240]">Formatting</span>
                <IconMapper
                  name="check_circle"
                  className="text-[#795900] text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-['Hanken_Grotesk'] text-sm text-[#564240]">Impact verbs</span>
                <IconMapper name="hourglass_empty" className="text-[#370003] text-sm" />
              </div>
            </div>
            <div className="w-full bg-[#ffdad3] h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-[#370003] h-full rounded-full w-[94%]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
