'use client';

import { IconMapper } from '@/app/_components/icons/IconMapper';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AtsPageClientProps {
  isLoggedIn: boolean;
}

export function AtsPageClient({ isLoggedIn }: AtsPageClientProps) {
  const router = useRouter();
  const [score, setScore] = useState(0);

  // Authentication behaviour for public page actions
  const handleCTA = () => {
    if (isLoggedIn) {
      router.push('/app/ats-workspace');
    } else {
      router.push('/app/signup');
    }
  };

  // Count up ATS Score on load
  useEffect(() => {
    let start = 0;
    const end = 88;
    const duration = 1500;
    const incrementTime = Math.floor(duration / end);

    const timer = setInterval(() => {
      start += 1;
      setScore(start);
      if (start >= end) {
        clearInterval(timer);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[#FFF8EE] text-[#2b1611] font-['Hanken_Grotesk'] min-h-screen overflow-x-hidden selection:bg-[#370003]/10 selection:text-[#370003]">
      <main className="pt-28 pb-20">
        {/* ── Hero Section ──────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 md:px-16 text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#fff0ee] text-[#370003] border border-[#E5D9C8] mb-6 shadow-sm">
            <IconMapper name="fact_check" className="text-sm text-[#370003]" /> Instant Resume ATS
            Audit
          </div>
          <h1 className="font-['Playfair_Display'] text-[36px] md:text-[52px] leading-[44px] md:leading-[60px] font-bold text-[#370003] mb-6">
            ATS Compatibility Checker
          </h1>
          <p className="font-['Hanken_Grotesk'] text-[18px] leading-[28px] text-[#564240] max-w-2xl mx-auto mb-8">
            Scan your resume against real recruitment filters in seconds. Get an instant score,
            keyword gap analysis, and AI-powered recommendations to land more interviews.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={handleCTA}
              className="bg-[#370003] text-white font-['Hanken_Grotesk'] text-[14px] leading-[20px] font-semibold px-8 py-3.5 rounded-full hover:scale-105 transition-transform shadow-md"
            >
              Analyze Your Resume
            </button>
            <button
              onClick={handleCTA}
              className="bg-[#FFF8F6] text-[#370003] border border-[#8a716f] font-['Hanken_Grotesk'] text-[14px] leading-[20px] font-semibold px-8 py-3.5 rounded-full hover:bg-[#ffe9e5] transition-colors shadow-sm"
            >
              Upload New Document
            </button>
          </div>
        </section>

        {/* ── Interactive Live ATS Audit Report Card ──────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 md:px-8 mb-24">
          <div className="bg-[#FFF8F6] border border-[#E5D9C8] rounded-2xl p-6 md:p-12 shadow-xl relative overflow-hidden">
            {/* Report Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#E5D9C8] pb-6 mb-8 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#370003] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Live Audit Preview
                  </span>
                  <span className="text-xs text-[#564240] font-medium">Report #JP-8829-ATS</span>
                </div>
                <h2 className="font-['Playfair_Display'] text-[24px] md:text-[32px] font-bold text-[#2b1611]">
                  Resume Compatibility Analysis
                </h2>
              </div>

              {/* Score Gauge Card */}
              <div className="bg-[#FFF8EE] border border-[#E5D9C8] rounded-xl p-4 flex items-center gap-4 shadow-sm self-stretch sm:self-auto justify-center">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      className="text-[#ffe9e5]"
                      cx="50"
                      cy="50"
                      fill="transparent"
                      r="42"
                      stroke="currentColor"
                      strokeWidth="8"
                    />
                    <circle
                      className="text-[#370003] transition-all duration-1000 ease-out"
                      cx="50"
                      cy="50"
                      fill="transparent"
                      r="42"
                      stroke="currentColor"
                      strokeDasharray="264"
                      strokeDashoffset={264 - (264 * score) / 100}
                      strokeLinecap="round"
                      strokeWidth="8"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="font-['Playfair_Display'] text-xl font-bold text-[#370003]">
                      {score}%
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase font-bold tracking-wider text-[#370003]">
                    Passage Rate
                  </div>
                  <div className="text-sm font-semibold text-[#1B5E20] flex items-center gap-1 mt-0.5">
                    <IconMapper name="check_circle" className="text-sm" /> High Alignment
                  </div>
                </div>
              </div>
            </div>

            {/* Executive Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="p-6 bg-[#FFF8EE] border border-[#E5D9C8] rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <IconMapper name="auto_awesome" className="text-[#370003]" />
                  <h3 className="font-['Hanken_Grotesk'] text-[15px] font-bold text-[#2b1611]">
                    Content Impact &amp; Quality
                  </h3>
                </div>
                <p className="font-['Hanken_Grotesk'] text-[14px] leading-relaxed text-[#564240]">
                  Strong use of action verbs and quantified achievements. Sentence structure aligns
                  well with senior roles, with readability in the top 10%.
                </p>
              </div>

              <div className="p-6 bg-[#FFF8EE] border border-[#E5D9C8] rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <IconMapper name="architecture" className="text-[#370003]" />
                  <h3 className="font-['Hanken_Grotesk'] text-[15px] font-bold text-[#2b1611]">
                    Parsing &amp; Formatting
                  </h3>
                </div>
                <p className="font-['Hanken_Grotesk'] text-[14px] leading-relaxed text-[#564240]">
                  Clean linear hierarchy detected. Recommended: avoid nested multi-column tables to
                  ensure legacy recruiters scan your data error-free.
                </p>
              </div>
            </div>

            {/* Keyword Lexicon Matching */}
            <div className="mb-8">
              <h3 className="font-['Playfair_Display'] text-[20px] font-bold text-[#2b1611] mb-4">
                Keyword Lexicon Matching
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 bg-white border border-[#E5D9C8] rounded-lg">
                  <div className="flex items-center gap-3">
                    <IconMapper name="check_circle" className="text-[#1B5E20] text-lg" />
                    <span className="font-['Hanken_Grotesk'] text-[15px] font-medium text-[#2b1611]">
                      Strategic Leadership &amp; Action Verbs
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-[#1B5E20] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    High Match
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-white border border-[#E5D9C8] rounded-lg">
                  <div className="flex items-center gap-3">
                    <IconMapper name="check_circle" className="text-[#1B5E20] text-lg" />
                    <span className="font-['Hanken_Grotesk'] text-[15px] font-medium text-[#2b1611]">
                      Agile Methodology &amp; Team Metrics
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-[#1B5E20] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    Found (3x)
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-white border border-[#E5D9C8] rounded-lg">
                  <div className="flex items-center gap-3">
                    <IconMapper name="error" className="text-[#ba1a1a] text-lg" />
                    <span className="font-['Hanken_Grotesk'] text-[15px] font-medium text-[#564240]">
                      Product Lifecycle Management
                    </span>
                  </div>
                  <button
                    onClick={handleCTA}
                    className="text-xs font-semibold text-[#370003] bg-[#fff0ee] border border-[#E5D9C8] px-3 py-1 rounded-full hover:bg-[#ffe9e5] transition-colors"
                  >
                    + Add Keyword
                  </button>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-[#E5D9C8] gap-4">
              <p className="font-['Hanken_Grotesk'] text-xs text-[#564240]">
                Certified by JobPatra Real-Time Evaluation Engine.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCTA}
                  className="bg-[#370003] text-white font-['Hanken_Grotesk'] text-xs font-semibold px-6 py-2.5 rounded-full hover:scale-105 transition-transform shadow-md"
                >
                  Improve My Resume
                </button>
                <button
                  onClick={handleCTA}
                  className="border border-[#8a716f] text-[#370003] font-['Hanken_Grotesk'] text-xs font-semibold px-6 py-2.5 rounded-full hover:bg-[#fff0ee] transition-colors"
                >
                  Re-Scan
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Core Features Grid ────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 md:px-16 mb-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-['Playfair_Display'] text-[32px] md:text-[44px] font-bold text-[#370003] mb-4">
              Decipher the ATS Gatekeeper
            </h2>
            <p className="font-['Hanken_Grotesk'] text-[18px] text-[#564240]">
              JobPatra AI dissects your resume using the exact parsing parameters used by enterprise
              recruiters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-[#FFF8F6] border border-[#E5D9C8] rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 bg-[#fff0ee] rounded-full flex items-center justify-center mb-4">
                <IconMapper name="analytics" className="text-[#370003] text-xl" />
              </div>
              <h3 className="font-['Playfair_Display'] text-[22px] font-bold text-[#2b1611] mb-3">
                ATS Compatibility Score
              </h3>
              <p className="font-['Hanken_Grotesk'] text-[15px] leading-relaxed text-[#564240]">
                Understand how recruitment algorithms rate your resume instantly with clear,
                actionable benchmarks.
              </p>
            </div>

            <div className="p-8 bg-[#FFF8F6] border border-[#E5D9C8] rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 bg-[#fed174]/20 rounded-full flex items-center justify-center mb-4">
                <IconMapper name="key" className="text-[#785800] text-xl" />
              </div>
              <h3 className="font-['Playfair_Display'] text-[22px] font-bold text-[#2b1611] mb-3">
                Keyword Gap Analysis
              </h3>
              <p className="font-['Hanken_Grotesk'] text-[15px] leading-relaxed text-[#564240]">
                Compare your resume skillset directly against target job descriptions to identify
                missing terms.
              </p>
            </div>

            <div className="p-8 bg-[#FFF8F6] border border-[#E5D9C8] rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 bg-[#ffdad7] rounded-full flex items-center justify-center mb-4">
                <IconMapper name="architecture" className="text-[#410004] text-xl" />
              </div>
              <h3 className="font-['Playfair_Display'] text-[22px] font-bold text-[#2b1611] mb-3">
                Formatting Inspection
              </h3>
              <p className="font-['Hanken_Grotesk'] text-[15px] leading-relaxed text-[#564240]">
                Detect complex elements (tables, charts, layout bars) that prevent machine parsers
                from reading your data.
              </p>
            </div>

            <div className="p-8 bg-[#FFF8F6] border border-[#E5D9C8] rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 bg-[#fff0ee] rounded-full flex items-center justify-center mb-4">
                <IconMapper name="edit_note" className="text-[#370003] text-xl" />
              </div>
              <h3 className="font-['Playfair_Display'] text-[22px] font-bold text-[#2b1611] mb-3">
                AI Sentence Rewriter
              </h3>
              <p className="font-['Hanken_Grotesk'] text-[15px] leading-relaxed text-[#564240]">
                Receive intelligent sentence-by-sentence recommendations to improve impact and
                wording.
              </p>
            </div>

            <div className="p-8 bg-[#FFF8F6] border border-[#E5D9C8] rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 bg-[#fed174]/20 rounded-full flex items-center justify-center mb-4">
                <IconMapper name="search" className="text-[#785800] text-xl" />
              </div>
              <h3 className="font-['Playfair_Display'] text-[22px] font-bold text-[#2b1611] mb-3">
                Full Resume Parsing
              </h3>
              <p className="font-['Hanken_Grotesk'] text-[15px] leading-relaxed text-[#564240]">
                Verify exactly how an ATS extracts text and maps your headings to ensure complete
                accuracy.
              </p>
            </div>

            <div className="p-8 bg-[#FFF8F6] border border-[#E5D9C8] rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 bg-[#ffdad7] rounded-full flex items-center justify-center mb-4">
                <IconMapper name="workspace_premium" className="text-[#410004] text-xl" />
              </div>
              <h3 className="font-['Playfair_Display'] text-[22px] font-bold text-[#2b1611] mb-3">
                Industry Benchmarking
              </h3>
              <p className="font-['Hanken_Grotesk'] text-[15px] leading-relaxed text-[#564240]">
                Compare your metrics against successful applicants in tech, product, and leadership
                roles.
              </p>
            </div>
          </div>
        </section>

        {/* ── Workflow Steps Section ────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 md:px-16 mb-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-['Playfair_Display'] text-[32px] md:text-[44px] font-bold text-[#370003] mb-4">
              How the ATS Audit Works
            </h2>
            <p className="font-['Hanken_Grotesk'] text-[18px] text-[#564240]">
              Five simple steps from uploading your document to downloading an ATS-optimized resume.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
            <div className="bg-[#FFF8F6] border border-[#E5D9C8] rounded-xl p-6 text-center flex flex-col items-center">
              <div className="w-10 h-10 bg-[#370003] text-white font-['Playfair_Display'] font-bold rounded-full flex items-center justify-center text-base mb-4 shadow-md">
                1
              </div>
              <h4 className="font-['Playfair_Display'] text-[18px] font-bold text-[#2b1611] mb-2">
                Upload Resume
              </h4>
              <p className="font-['Hanken_Grotesk'] text-[13px] text-[#564240]">
                Import your current PDF or DOCX file securely.
              </p>
            </div>

            <div className="bg-[#FFF8F6] border border-[#E5D9C8] rounded-xl p-6 text-center flex flex-col items-center">
              <div className="w-10 h-10 bg-[#785800] text-white font-['Playfair_Display'] font-bold rounded-full flex items-center justify-center text-base mb-4 shadow-md">
                2
              </div>
              <h4 className="font-['Playfair_Display'] text-[18px] font-bold text-[#2b1611] mb-2">
                AI Analysis
              </h4>
              <p className="font-['Hanken_Grotesk'] text-[13px] text-[#564240]">
                Parsers examine syntax, layout, and keywords.
              </p>
            </div>

            <div className="bg-[#FFF8F6] border border-[#E5D9C8] rounded-xl p-6 text-center flex flex-col items-center">
              <div className="w-10 h-10 bg-[#370003] text-white font-['Playfair_Display'] font-bold rounded-full flex items-center justify-center text-base mb-4 shadow-md">
                3
              </div>
              <h4 className="font-['Playfair_Display'] text-[18px] font-bold text-[#2b1611] mb-2">
                ATS Report
              </h4>
              <p className="font-['Hanken_Grotesk'] text-[13px] text-[#564240]">
                Receive score breakdown and keyword gaps.
              </p>
            </div>

            <div className="bg-[#FFF8F6] border border-[#E5D9C8] rounded-xl p-6 text-center flex flex-col items-center">
              <div className="w-10 h-10 bg-[#785800] text-white font-['Playfair_Display'] font-bold rounded-full flex items-center justify-center text-base mb-4 shadow-md">
                4
              </div>
              <h4 className="font-['Playfair_Display'] text-[18px] font-bold text-[#2b1611] mb-2">
                AI Fixes
              </h4>
              <p className="font-['Hanken_Grotesk'] text-[13px] text-[#564240]">
                Apply one-click AI rewrites directly in the editor.
              </p>
            </div>

            <div className="bg-[#FFF8F6] border border-[#E5D9C8] rounded-xl p-6 text-center flex flex-col items-center">
              <div className="w-10 h-10 bg-[#1B5E20] text-white font-['Playfair_Display'] font-bold rounded-full flex items-center justify-center text-base mb-4 shadow-md">
                5
              </div>
              <h4 className="font-['Playfair_Display'] text-[18px] font-bold text-[#2b1611] mb-2">
                Download PDF
              </h4>
              <p className="font-['Hanken_Grotesk'] text-[13px] text-[#564240]">
                Export your verified, high-scoring PDF.
              </p>
            </div>
          </div>
        </section>

        {/* ── Before vs After Section ────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 md:px-16 mb-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-['Playfair_Display'] text-[32px] md:text-[44px] font-bold text-[#370003] mb-4">
              Real-World Recalibration
            </h2>
            <p className="font-['Hanken_Grotesk'] text-[18px] text-[#564240]">
              See how minor refinements to keywords and layout transform your ATS score.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Before Card */}
            <div className="bg-[#FFF8F6] border border-[#E5D9C8] rounded-2xl p-8 shadow-sm flex flex-col justify-between">
              <div>
                <span className="font-['Hanken_Grotesk'] text-[12px] font-bold text-[#ba1a1a] uppercase tracking-wider block mb-4">
                  Original Resume
                </span>
                <div className="flex justify-between items-center pb-4 border-b border-[#E5D9C8] mb-6">
                  <h4 className="font-['Playfair_Display'] text-[20px] font-bold text-[#2b1611]">
                    Generic Layout
                  </h4>
                  <span className="text-sm font-bold text-[#ba1a1a] bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                    54% Score
                  </span>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2.5 text-[#564240] text-[14px]">
                    <IconMapper name="close" className="text-[#ba1a1a] text-lg shrink-0 mt-0.5" />
                    Unreadable multi-column formatting and visual tables.
                  </li>
                  <li className="flex items-start gap-2.5 text-[#564240] text-[14px]">
                    <IconMapper name="close" className="text-[#ba1a1a] text-lg shrink-0 mt-0.5" />
                    Missing key terminology for target roles.
                  </li>
                  <li className="flex items-start gap-2.5 text-[#564240] text-[14px]">
                    <IconMapper name="close" className="text-[#ba1a1a] text-lg shrink-0 mt-0.5" />
                    Vague job responsibilities lacking metrics.
                  </li>
                </ul>
              </div>
              <button
                onClick={handleCTA}
                className="mt-8 w-full border border-[#8a716f] text-[#370003] hover:bg-[#fff0ee] py-3 rounded-full font-['Hanken_Grotesk'] text-[14px] font-semibold transition-colors"
              >
                Scan Original
              </button>
            </div>

            {/* After Card */}
            <div className="bg-[#FFF8F6] border-2 border-[#370003] rounded-2xl p-8 shadow-lg flex flex-col justify-between relative">
              <div>
                <span className="font-['Hanken_Grotesk'] text-[12px] font-bold text-[#1B5E20] uppercase tracking-wider block mb-4">
                  JobPatra Optimized
                </span>
                <div className="flex justify-between items-center pb-4 border-b border-[#E5D9C8] mb-6">
                  <h4 className="font-['Playfair_Display'] text-[20px] font-bold text-[#370003]">
                    Clean Linear Layout
                  </h4>
                  <span className="text-sm font-bold text-[#1B5E20] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                    94% Score
                  </span>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2.5 text-[#564240] text-[14px]">
                    <IconMapper name="check" className="text-[#1B5E20] text-lg shrink-0 mt-0.5" />
                    Clean single-column parsing with robust readability.
                  </li>
                  <li className="flex items-start gap-2.5 text-[#564240] text-[14px]">
                    <IconMapper name="check" className="text-[#1B5E20] text-lg shrink-0 mt-0.5" />
                    Enriched with high-value industry keywords.
                  </li>
                  <li className="flex items-start gap-2.5 text-[#564240] text-[14px]">
                    <IconMapper name="check" className="text-[#1B5E20] text-lg shrink-0 mt-0.5" />
                    Actionable metrics showcasing verified impact.
                  </li>
                </ul>
              </div>
              <button
                onClick={handleCTA}
                className="mt-8 w-full bg-[#370003] text-white hover:scale-[1.02] py-3 rounded-full font-['Hanken_Grotesk'] text-[14px] font-semibold transition-all shadow-md"
              >
                Apply Improvements
              </button>
            </div>
          </div>
        </section>

        {/* ── Bottom CTA Banner ─────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 md:px-16">
          <div className="bg-[#370003] text-white rounded-3xl p-10 md:p-16 text-center relative overflow-hidden shadow-xl">
            <div className="max-w-3xl mx-auto relative z-10">
              <h2 className="font-['Playfair_Display'] text-[32px] md:text-[48px] leading-[40px] md:leading-[56px] font-bold mb-4">
                Ready to Optimize Your Resume?
              </h2>
              <p className="font-['Hanken_Grotesk'] text-[16px] md:text-[18px] text-white/90 mb-8 max-w-2xl mx-auto">
                Analyze your resume parameters against standard HR logic. Build a document
                recruiters can parse effortlessly.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={handleCTA}
                  className="bg-[#FFF8EE] text-[#370003] hover:bg-white font-['Hanken_Grotesk'] text-[14px] font-semibold px-8 py-3.5 rounded-full shadow-md hover:scale-105 transition-all"
                >
                  Analyze Resume Now
                </button>
                <button
                  onClick={handleCTA}
                  className="border-2 border-white/80 hover:bg-white/10 text-white font-['Hanken_Grotesk'] text-[14px] font-semibold px-8 py-3.5 rounded-full transition-all"
                >
                  Create Free Account
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
