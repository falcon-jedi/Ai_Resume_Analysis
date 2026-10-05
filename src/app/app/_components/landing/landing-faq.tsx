'use client';
import { IconMapper } from '@/app/_components/icons/IconMapper';

import Link from 'next/link';

const faqs = [
  {
    q: 'What is JobPatra?',
    a: 'JobPatra is an AI-powered platform designed to help you build, analyze, and optimize resumes and cover letters that pass the gatekeepers and resonate with decision-makers.',
  },
  {
    q: 'What is an ATS score?',
    a: 'An ATS score indicates how well your resume matches the requirements of Applicant Tracking Systems used by employers to filter candidates based on keywords and formatting.',
  },
  {
    q: 'How does JobPatra analyze my resume?',
    a: 'Our system analyzes your content, skills, and structure against industry standards and specific job descriptions to provide actionable suggestions for improvement.',
  },
  {
    q: 'Can JobPatra optimize my resume for a specific job?',
    a: 'Yes! You can paste a job description, and our AI will analyze it to align your profile, suggesting the exact keywords and terminology hiring managers are looking for.',
  },
  // {
  //   q: 'How does AI job matching work?',
  //   a: 'Our algorithm compares your complete profile with live job requirements, providing a match score indicator to help you discover high-probability opportunities perfectly suited to your background.',
  // },
  {
    q: 'Can I create a resume from scratch?',
    a: 'Absolutely. You can use our intelligent builder and curated collection of professional templates to create an eye-catching resume from the ground up in minutes.',
  },
  {
    q: 'Are the resume templates ATS-friendly?',
    a: 'Yes, all of our templates are professionally structured and rigorously tested to ensure complete ATS readability, regardless of which design you choose.',
  },
  {
    q: 'Can I customize my resume?',
    a: 'Yes, both the content and structural layout are fully customizable. You can highlight different sections, adjust phrasing with AI, and tailor the design to fit your narrative perfectly.',
  },
  {
    q: 'Can I analyze a job description before applying?',
    a: 'Yes, the ATS Analyzer tool identifies core requirements and missing keywords in any job description, ensuring you know exactly how to tailor your application before you hit submit.',
  },
  {
    q: 'Is JobPatra free to use?',
    a: 'You can create, analyze, and optimize 1 free resume to start. For unlimited documents, advanced AI optimization, and premium cover letters, you can easily upgrade to our Pro plan.',
  },
];

export function LandingFaq() {
  return (
    <section
      className="w-full py-14 sm:py-24 bg-[#FFF8EE] border-t border-[#E5D9C8] relative"
      id="faq"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
          <div className="col-span-1 flex flex-col gap-4 sm:gap-6">
            <h2 className="font-['Playfair_Display'] text-2xl sm:text-3xl md:text-5xl font-bold text-[#370003]">
              Frequently Asked Questions
            </h2>
            <p className="font-['Hanken_Grotesk'] text-[15px] sm:text-[18px] leading-[24px] sm:leading-[28px] text-[#564240]">
              Everything you need to know about JobPatra, resumes, ATS optimization, and your
              AI-powered job search.
            </p>
            <div className="hidden lg:flex flex-col gap-4 mt-6 bg-[#fff0ee] p-6 rounded-2xl border border-[#E5D9C8]">
              <h3 className="font-['Playfair_Display'] text-xl font-semibold text-[#370003]">
                Still have questions?
              </h3>
              <p className="font-['Hanken_Grotesk'] text-sm text-[#564240]">
                We&apos;re here to help you architect your perfect career narrative.
              </p>
              <Link
                href="/app/signup"
                className="bg-[#370003] text-white font-['Hanken_Grotesk'] text-[14px] leading-[20px] font-semibold px-6 py-3 rounded-full shadow-md hover:scale-105 transition-transform mt-2 self-start"
              >
                Get Started
              </Link>
            </div>
          </div>

          <div className="col-span-1 lg:col-span-2 flex flex-col gap-3.5 sm:gap-4">
            {faqs.map((faq, idx) => (
              <details
                key={faq.q}
                className="group bg-[#FFF8F6] rounded-xl border border-[#E5D9C8] overflow-hidden"
                open={idx === 0}
              >
                <summary className="flex justify-between items-center font-['Playfair_Display'] text-base sm:text-lg font-semibold text-[#370003] cursor-pointer p-4 sm:p-6 bg-[#FFF8F6] hover:bg-[#fff0ee] transition-colors outline-none list-none select-none gap-3">
                  <span>{faq.q}</span>
                  <IconMapper
                    name="expand_more"
                    className="text-[#370003] transition-transform duration-300 group-open:rotate-180 shrink-0 text-xl"
                  />
                </summary>
                <div className="p-4 sm:p-6 pt-0 font-['Hanken_Grotesk'] text-[13px] sm:text-sm text-[#564240] bg-[#FFF8F6] leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}

            <div className="flex lg:hidden flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4 bg-[#fff0ee] p-5 rounded-xl border border-[#E5D9C8]">
              <div>
                <h3 className="font-['Playfair_Display'] text-base sm:text-lg font-semibold text-[#370003]">
                  Still have questions?
                </h3>
                <p className="font-['Hanken_Grotesk'] text-xs sm:text-sm text-[#564240]">
                  We&apos;re here to help you architect your perfect career narrative.
                </p>
              </div>
              <Link
                href="/app/signup"
                className="w-full sm:w-auto text-center bg-[#370003] text-white font-['Hanken_Grotesk'] text-[13px] font-semibold px-5 py-2.5 rounded-full shadow-md"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
