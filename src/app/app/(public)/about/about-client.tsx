'use client';

import React from 'react';
import Link from 'next/link';
import { IconMapper } from '@/app/_components/icons/IconMapper';

export function AboutClient() {
  return (
    <div className="min-h-screen bg-[#FFF8EE] text-[#2b1611] font-['Hanken_Grotesk'] pt-24 pb-20 px-4 md:px-16 selection:bg-[#370003] selection:text-white">
      <div className="max-w-5xl mx-auto space-y-24">
        {/* ── Section 1: Hero / Mission Statement ── */}
        <section className="text-center pt-8 md:pt-12 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#fff0ee] text-[#370003] border border-[#E5D9C8] mb-6 shadow-sm">
            <IconMapper name="sparkles" className="text-sm text-[#370003]" /> Our Mission &amp;
            Vision
          </div>

          <h1 className="font-['Playfair_Display'] text-[38px] sm:text-[48px] md:text-[62px] leading-[1.15] font-bold text-[#370003] max-w-4xl tracking-tight mb-6">
            AI Career Workshop. <br className="hidden sm:inline" />
            <span className="italic font-normal">Smarter Resumes.</span> Better Jobs.
          </h1>

          <p className="text-[#564240] text-[17px] sm:text-[20px] leading-[28px] sm:leading-[32px] max-w-2xl font-normal mb-8">
            JobPatra helps job seekers build, analyze, and optimize their resumes using AI-powered
            tools, so you can stand out in a crowded job market.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link
              href="/app/dashboard"
              className="w-full sm:w-auto bg-[#370003] text-white font-semibold text-sm px-8 py-3.5 rounded-full hover:scale-105 transition-all shadow-md flex items-center justify-center gap-2 group"
            >
              <span>Build Your Resume</span>
              <IconMapper
                name="arrow_forward"
                className="text-sm group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link
              href="/app/ats-checker"
              className="w-full sm:w-auto bg-white border border-[#E5D9C8] text-[#370003] font-semibold text-sm px-8 py-3.5 rounded-full hover:bg-[#fff0ee] hover:border-[#370003]/30 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <IconMapper name="analytics" className="text-sm text-[#370003]" />
              <span>Test ATS Score Free</span>
            </Link>
          </div>
        </section>

        {/* ── Section 2: The Problem We Solve ── */}
        <section className="bg-[#FFF8F6] border border-[#E5D9C8] rounded-3xl p-8 sm:p-12 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#fed174]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
            <div className="md:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#ba1a1a]/10 text-[#ba1a1a] border border-[#ba1a1a]/20">
                <IconMapper name="warning" className="text-xs" /> The Reality of Hiring Today
              </div>
              <h2 className="font-['Playfair_Display'] text-[28px] sm:text-[36px] font-bold text-[#370003] leading-tight">
                The Job Search Is Broken
              </h2>
              <p className="text-[#564240] text-base leading-relaxed">
                Most resumes never reach a human recruiter. They get filtered out by{' '}
                <strong>ATS (Applicant Tracking Systems)</strong> before anyone even reads them.
              </p>
              <p className="text-[#564240] text-base leading-relaxed">
                Job seekers are left wondering:{' '}
                <span className="italic font-medium text-[#370003]">
                  &ldquo;Did my resume even get seen?&rdquo;
                </span>{' '}
                Endless submissions into black-hole portals without feedback or closure.
              </p>
              <div className="pt-2">
                <div className="p-4 rounded-xl bg-white border border-[#E5D9C8] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#370003] text-white flex items-center justify-center flex-shrink-0">
                    <IconMapper name="check" className="text-lg" />
                  </div>
                  <p className="text-sm font-semibold text-[#370003]">
                    We built JobPatra to change that, putting the power back in your hands.
                  </p>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 bg-white border border-[#E5D9C8] rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#370003]">
                Why Traditional Resumes Fail:
              </h3>
              <ul className="space-y-3 text-sm text-[#564240]">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#ba1a1a] text-base font-bold">✕</span>
                  <span>Missing industry-specific keywords required by automated parsers</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#ba1a1a] text-base font-bold">✕</span>
                  <span>Non-standard formatting and columns that break document readers</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#ba1a1a] text-base font-bold">✕</span>
                  <span>
                    No feedback mechanism to evaluate relevance against the actual job description
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── Section 3: How JobPatra Works (3-Step Process) ── */}
        <section className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-['Playfair_Display'] text-[32px] sm:text-[42px] font-bold text-[#370003]">
              Build. Analyze. Improve.
            </h2>
            <p className="text-[#564240] text-base sm:text-lg">
              A seamless, intelligent workflow engineered to maximize your interview conversion
              rate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-[#FFF8F6] border border-[#E5D9C8] rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#fff0ee] border border-[#E5D9C8] flex items-center justify-center text-[#370003]">
                    <IconMapper name="edit_note" className="text-2xl" />
                  </div>
                </div>
                <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#370003]">
                  1. Build
                </h3>
                <p className="text-sm text-[#564240] leading-relaxed">
                  Create a professional resume using our clean, intuitive builder with
                  professionally designed templates calibrated for both human eyes and machine
                  parsers.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E5D9C8]/60 text-xs font-semibold text-[#370003] flex items-center gap-1">
                <span>Intuitive Editor &amp; Formats</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#FFF8F6] border border-[#E5D9C8] rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#fed174]/20 border border-[#E5D9C8] flex items-center justify-center text-[#785800]">
                    <IconMapper name="analytics" className="text-2xl" />
                  </div>
                </div>
                <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#370003]">
                  2. Analyze
                </h3>
                <p className="text-sm text-[#564240] leading-relaxed">
                  Upload any job description and get an instant ATS score with detailed breakdowns
                  of what&apos;s working, matched keywords, and critical gaps.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E5D9C8]/60 text-xs font-semibold text-[#785800] flex items-center gap-1">
                <span>Instant Keyword Breakdown</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#FFF8F6] border border-[#E5D9C8] rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#370003] text-white flex items-center justify-center">
                    <IconMapper name="auto_awesome" className="text-2xl text-[#f6be39]" />
                  </div>
                </div>
                <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#370003]">
                  3. Improve
                </h3>
                <p className="text-sm text-[#564240] leading-relaxed">
                  Get AI-powered suggestions that highlight exactly what to add, remove, or rewrite
                  to maximize your ATS score and speak directly to recruiters.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E5D9C8]/60 text-xs font-semibold text-[#370003] flex items-center gap-1">
                <span>Tailored AI Rewrites</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 4: Social Proof (Metrics) ── */}
        <section className="bg-white border border-[#E5D9C8] rounded-3xl p-8 sm:p-12 shadow-sm text-center space-y-8">
          <div className="space-y-2">
            <h2 className="font-['Playfair_Display'] text-[28px] sm:text-[36px] font-bold text-[#370003]">
              Trusted by Job Seekers
            </h2>
            <p className="text-[#564240] text-sm sm:text-base max-w-xl mx-auto">
              Job seekers trust JobPatra to help them land their dream roles across modern tech,
              product, and business organizations.
            </p>
          </div>

          {/* Metrics Data: Option A (Hardcoded MVP counters) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
            <div className="p-6 rounded-2xl bg-[#FFF8F6] border border-[#E5D9C8] space-y-1">
              <span className="font-['Playfair_Display'] text-4xl sm:text-5xl font-bold text-[#370003] tracking-tight">
                1,000+
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#564240]">
                Resumes Built
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFF8F6] border border-[#E5D9C8] space-y-1">
              <span className="font-['Playfair_Display'] text-4xl sm:text-5xl font-bold text-[#370003] tracking-tight">
                500+
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#564240]">
                ATS Analyses Run
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFF8F6] border border-[#E5D9C8] space-y-1">
              <span className="font-['Playfair_Display'] text-4xl sm:text-5xl font-bold text-[#370003] tracking-tight">
                100+
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#564240]">
                Active Users
              </p>
            </div>
          </div>
        </section>

        {/* ── Section 5: Our Story ── */}
        <section className="bg-[#FFF8F6] border border-[#E5D9C8] rounded-3xl p-8 sm:p-12 shadow-sm space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#fff0ee] text-[#370003] border border-[#E5D9C8]">
            <IconMapper name="history_edu" className="text-sm text-[#370003]" /> The Origin
          </div>

          <h2 className="font-['Playfair_Display'] text-[30px] sm:text-[40px] font-bold text-[#370003]">
            Our Story
          </h2>

          <div className="space-y-4 text-[#564240] text-base sm:text-lg leading-relaxed max-w-3xl">
            <p>
              JobPatra was born from a simple frustration: talented people were getting rejected by
              automated systems, not because they weren&apos;t qualified, but because their resumes
              weren&apos;t optimized for ATS filters.
            </p>
            <p>
              We set out to build a tool that levels the playing field, giving every job seeker
              access to the same AI-powered insights that recruiters use.
            </p>
            <p>
              Today, JobPatra is helping job seekers across India build resumes that actually get
              noticed, ensuring their hard-earned experience and skills receive the fair spotlight
              they deserve.
            </p>
          </div>
        </section>

        {/* ── Section 6: Meet the Team ── */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="font-['Playfair_Display'] text-[30px] sm:text-[38px] font-bold text-[#370003]">
              Meet the Team
            </h2>
            <p className="text-[#564240] text-sm sm:text-base">
              The passion and craftsmanship behind every line of code at JobPatra.
            </p>
          </div>

          <div className="max-w-xl mx-auto bg-white border border-[#E5D9C8] rounded-3xl p-8 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            {/* Initials Avatar */}
            <div className="w-24 h-24 rounded-full bg-[#370003] text-white flex items-center justify-center text-3xl font-bold font-['Playfair_Display'] shadow-md flex-shrink-0 border-4 border-[#fff0ee] ring-2 ring-[#E5D9C8]">
              AS
            </div>

            <div className="space-y-2">
              <div>
                <h3 className="font-['Playfair_Display'] text-2xl font-bold text-[#370003]">
                  Abhit Sahu
                </h3>
                <p className="text-xs font-semibold text-[#8a716f] uppercase tracking-wider">
                  Founder &amp; Developer
                </p>
              </div>

              <p className="text-sm text-[#564240] leading-relaxed">
                Full-stack developer with a passion for building tools that make a difference. When
                I&apos;m not coding, I&apos;m helping friends and family polish their resumes.
                JobPatra is my way of bringing that help to everyone.
              </p>

              <div className="pt-2 flex items-center justify-center sm:justify-start gap-3">
                <Link
                  href="/app/contact"
                  className="text-xs font-semibold text-[#370003] underline decoration-[#f6be39] decoration-2 underline-offset-4 hover:text-[#ba1a1a]"
                >
                  Reach out directly
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 7: Call to Action (CTA) ── */}
        <section className="bg-[#370003] text-[#FFF8EE] rounded-3xl p-8 sm:p-14 shadow-xl text-center space-y-6 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#f6be39]/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-[#ba1a1a]/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="font-['Playfair_Display'] text-[32px] sm:text-[44px] font-bold leading-tight">
              Ready to Build Your Resume?
            </h2>
            <p className="text-[#FFF8EE]/80 text-base sm:text-lg leading-relaxed">
              Join thousands of job seekers who are already building better resumes with JobPatra.
              It&apos;s free to start.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/app/dashboard"
                className="w-full sm:w-auto bg-[#FFF8EE] text-[#370003] font-semibold text-base px-9 py-3.5 rounded-full hover:bg-white hover:scale-105 transition-all shadow-md cursor-pointer"
              >
                Build Your Resume Now
              </Link>
              <Link
                href="/app/templates"
                className="w-full sm:w-auto bg-transparent border border-[#FFF8EE]/40 text-[#FFF8EE] font-semibold text-base px-8 py-3.5 rounded-full hover:bg-[#FFF8EE]/10 transition-all"
              >
                Explore Templates
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
