'use client';

import { useState } from 'react';
import Link from 'next/link';
import { IconMapper } from '@/app/_components/icons/IconMapper';

interface FAQItem {
  question: string;
  answer: string;
  category: 'ATS & Scoring' | 'Resume Builder' | 'Billing & Account';
}

const FAQS: FAQItem[] = [
  {
    category: 'ATS & Scoring',
    question: 'How does the ATS Analyzer calculate my score?',
    answer:
      'The ATS Analyzer performs keyword matching, semantic skill analysis, section structure verification, and formatting audits against the job description you provide. It scores your document from 0 to 100 based on matched required keywords, missing competencies, and formatting hygiene.',
  },
  {
    category: 'ATS & Scoring',
    question: 'Are JobPatra templates 100% ATS-friendly?',
    answer:
      'Yes. All JobPatra templates are structured with single-column linear hierarchies, standard Unicode typography, standard section headings, and machine-readable text layers designed to pass applicant tracking systems like Workday, Greenhouse, and Lever without errors.',
  },
  {
    category: 'Resume Builder',
    question: 'Can I download my resume as a PDF?',
    answer:
      'Yes, you can export vector-rendered PDF documents anytime with high-resolution typography. Free users can export their resumes with standard templates, while Pro users unlock premium typography themes and unlimited downloads.',
  },
  {
    category: 'Resume Builder',
    question: 'How do AI rewrite suggestions work?',
    answer:
      'Our AI analyzes bullet points in your work experience and achievements to emphasize quantifiable impact, active power verbs, and industry-standard phrasing while preserving your authentic background.',
  },
  {
    category: 'Billing & Account',
    question: 'How do I cancel or modify my subscription?',
    answer:
      'You can manage your subscription at any time by navigating to Settings → Subscription or via the Billing section. If you cancel, your premium features remain fully active until the end of your current billing cycle.',
  },
  {
    category: 'Billing & Account',
    question: 'How can I request a feature or report a bug?',
    answer:
      'You can use the in-app Feedback tool (located in the left sidebar or the user menu) or email our founder directly at support@jobpatra.in. We reply to all inquiries within 24–48 business hours.',
  },
];

export function FAQClient() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'ATS & Scoring', 'Resume Builder', 'Billing & Account'];

  const filteredFaqs =
    activeCategory === 'All' ? FAQS : FAQS.filter((f) => f.category === activeCategory);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="w-full space-y-8 font-['Hanken_Grotesk'] text-[#2b1611]">
      {/* Header */}
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#fff0ee] text-[#370003] border border-[#E5D9C8] shadow-xs">
          <IconMapper name="help_outline" className="text-sm text-[#370003]" /> Help Center
        </div>
        <h1 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-bold text-[#370003] leading-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-[#564240] text-sm sm:text-base max-w-xl">
          Everything you need to know about building ATS-optimized resumes, scoring job matches, and
          managing your account.
        </p>
      </header>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#370003] text-white shadow-xs'
                  : 'bg-white border border-[#E5D9C8] text-[#564240] hover:bg-[#fff0ee]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* FAQ Accordions */}
      <div className="space-y-3">
        {filteredFaqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={faq.question}
              className="bg-white border border-[#E5D9C8] rounded-2xl overflow-hidden shadow-xs transition-all"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full flex items-center justify-between p-5 text-left cursor-pointer hover:bg-[#FFF8F6] transition-colors"
              >
                <span className="font-['Playfair_Display'] font-bold text-base sm:text-lg text-[#370003] pr-4">
                  {faq.question}
                </span>
                <IconMapper
                  name="keyboard_arrow_down"
                  className={`text-[#7a1f1f] text-xl shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-sm sm:text-base text-[#564240] leading-relaxed border-t border-[#E5D9C8]/40 pt-4 bg-[#FFF8F6]/30">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Help Banner */}
      <div className="bg-[#FFF8F6] border border-[#E5D9C8] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-xs">
        <div>
          <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#370003]">
            Still have questions or need assistance?
          </h3>
          <p className="text-xs text-[#564240] mt-1">
            Our team is happy to help optimize your resume or resolve issues.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/app/feedback"
            className="bg-[#370003] text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:scale-105 transition-all shadow-xs flex items-center gap-1.5 shrink-0"
          >
            <IconMapper name="feedback" className="text-xs" />
            <span>Share Feedback</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
