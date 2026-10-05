'use client';

import React from 'react';
import Link from 'next/link';
import { IconMapper } from '@/app/_components/icons/IconMapper';

export function TermsClient() {
  const lastUpdated = 'August 31, 2026';

  const sections = [
    { id: 'agreement-to-terms', title: '1. Agreement to Terms' },
    { id: 'eligibility', title: '2. Eligibility' },
    { id: 'user-accounts', title: '3. User Accounts & Security' },
    { id: 'service-description', title: '4. Service Description' },
    { id: 'user-content-ownership', title: '5. User Content & Ownership' },
    { id: 'acceptable-use', title: '6. Acceptable Use Policy' },
    { id: 'payment-terms', title: '7. Payment & Subscription Terms' },
    { id: 'intellectual-property', title: '8. JobPatra Intellectual Property' },
    { id: 'termination', title: '9. Account Termination' },
    { id: 'disclaimer-warranties', title: '10. Disclaimer of Warranties' },
    { id: 'limitation-liability', title: '11. Limitation of Liability' },
    { id: 'dispute-resolution', title: '12. Dispute Resolution & Governing Law' },
    { id: 'changes-to-terms', title: '13. Changes to Terms' },
    { id: 'severability', title: '14. Severability' },
    { id: 'entire-agreement', title: '15. Entire Agreement' },
    { id: 'contact-terms', title: '16. Contact Us' },
  ];

  return (
    <div className="min-h-screen bg-[#FFF8EE] text-[#2b1611] font-['Hanken_Grotesk'] pt-24 pb-20 px-4 md:px-16 selection:bg-[#370003] selection:text-white">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center pt-8 pb-4 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#fff0ee] text-[#370003] border border-[#E5D9C8] shadow-sm">
            <IconMapper name="description" className="text-sm text-[#370003]" /> Legal Agreement
          </div>
          <h1 className="font-['Playfair_Display'] text-[36px] sm:text-[48px] md:text-[54px] font-bold text-[#370003] leading-tight">
            Terms of Service
          </h1>
          <p className="text-[#564240] text-sm sm:text-base">
            Effective Date: <span className="font-semibold text-[#370003]">{lastUpdated}</span>
          </p>
        </div>

        {/* Quick Navigation Summary */}
        <div className="bg-[#FFF8F6] border border-[#E5D9C8] rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#370003] flex items-center gap-2">
            <IconMapper name="fact_check" className="text-[#370003]" /> Table of Contents
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {sections.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className="text-[#564240] hover:text-[#370003] hover:underline decoration-[#f6be39] transition-colors py-1 flex items-center gap-1.5"
              >
                <span className="text-[#8a716f] text-xs">›</span>
                <span>{sec.title}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Legal Document Content */}
        <div className="bg-white border border-[#E5D9C8] rounded-3xl p-6 sm:p-12 shadow-sm space-y-12 text-[#564240] leading-relaxed text-[15px] sm:text-[16px]">
          {/* Section 1: Agreement to Terms */}
          <section id="agreement-to-terms" className="space-y-4 scroll-mt-28">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#370003] border-b border-[#E5D9C8] pb-2">
              1. Agreement to Terms
            </h2>
            <p>
              These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement
              between you (&ldquo;User,&rdquo; &ldquo;you,&rdquo; or &ldquo;your&rdquo;) and{' '}
              <strong>JobPatra</strong> (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;)
              concerning your access to and use of the JobPatra website (
              <Link href="/" className="text-[#370003] font-semibold underline">
                jobpatra.in
              </Link>
              ), applications, and associated services.
            </p>
            <p>
              By creating an account, accessing, or using JobPatra, you acknowledge that you have
              read, understood, and agreed to be bound by these Terms and our Privacy Policy. If you
              do not agree with all of these Terms, you are expressly prohibited from using the
              service and must discontinue use immediately.
            </p>
          </section>

          {/* Section 2: Eligibility */}
          <section id="eligibility" className="space-y-4 scroll-mt-28">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#370003] border-b border-[#E5D9C8] pb-2">
              2. Eligibility
            </h2>
            <p>By accessing JobPatra, you represent and warrant that:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                You are at least 18 years of age (or have reached the age of legal majority in your
                jurisdiction).
              </li>
              <li>
                You possess the legal capacity and authority to enter into these binding Terms.
              </li>
              <li>
                All registration information and credentials you submit are truthful, accurate, and
                current.
              </li>
              <li>
                Your use of the service will not violate any applicable local, state, national, or
                international law or regulation.
              </li>
            </ul>
          </section>

          {/* Section 3: User Accounts & Security */}
          <section id="user-accounts" className="space-y-4 scroll-mt-28">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#370003] border-b border-[#E5D9C8] pb-2">
              3. User Accounts &amp; Security
            </h2>
            <p>
              To access resume creation, cloud saving, and ATS scoring capabilities, you may need to
              register an account. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintain the confidentiality of your account credentials and password.</li>
              <li>Accept sole responsibility for all activities occurring under your account.</li>
              <li>
                Notify JobPatra immediately at{' '}
                <a
                  href="mailto:support@jobpatra.in"
                  className="text-[#370003] font-semibold underline"
                >
                  support@jobpatra.in
                </a>{' '}
                upon discovering any unauthorized use or security breach.
              </li>
            </ul>
            <p>
              JobPatra reserves the right to terminate accounts, reclaim usernames, or cancel
              subscriptions if fraudulent activity is identified.
            </p>
          </section>

          {/* Section 4: Service Description */}
          <section id="service-description" className="space-y-4 scroll-mt-28">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#370003] border-b border-[#E5D9C8] pb-2">
              4. Service Description
            </h2>
            <p>
              JobPatra is an AI Career Workshop platform providing digital tools to aid professional
              presentation, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Resume Builder:</strong> Drag-and-drop structural section builder with
                pre-styled artisan PDF templates.
              </li>
              <li>
                <strong>ATS Analyzer:</strong> Keyword matching algorithms comparing uploaded
                documents against provided job descriptions.
              </li>
              <li>
                <strong>AI Writing Assistance:</strong> Contextual bullet-point rewrites and
                professional impact phrasing suggestions.
              </li>
              <li>
                <strong>Export Tools:</strong> High-resolution vector PDF export options.
              </li>
            </ul>
            <p>
              We continuously improve our platform; features, quota limits, and template styles may
              be updated, refined, or expanded periodically.
            </p>
          </section>

          {/* Section 5: User Content & Ownership */}
          <section id="user-content-ownership" className="space-y-4 scroll-mt-28">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#370003] border-b border-[#E5D9C8] pb-2">
              5. User Content &amp; Ownership
            </h2>
            <div className="bg-[#fff0ee] border-l-4 border-[#370003] p-4 rounded-r-lg text-sm text-[#370003] font-medium mb-4">
              <strong>Your Content Belongs to You:</strong> You retain 100% full legal ownership of
              all resume text, biographical details, employment histories, and documents you upload
              or create on JobPatra.
            </div>
            <p>
              By submitting content to JobPatra, you grant us a worldwide, non-exclusive,
              royalty-free, limited license solely to host, process, format, parse, and display your
              content for the express purpose of providing the service to you.
            </p>
            <p>
              You represent and warrant that your content does not violate intellectual property
              rights, disclose unauthorized corporate trade secrets, or contain defamatory or
              fraudulent assertions.
            </p>
          </section>

          {/* Section 6: Acceptable Use Policy */}
          <section id="acceptable-use" className="space-y-4 scroll-mt-28">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#370003] border-b border-[#E5D9C8] pb-2">
              6. Acceptable Use Policy
            </h2>
            <p>You agree not to engage in any prohibited activities, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Attempting to reverse-engineer, decompile, or disassemble any part of the
                platform&apos;s source code.
              </li>
              <li>
                Automated scraping, crawling, or data harvesting without express written consent.
              </li>
              <li>Bypassing rate limits, CAPTCHAs, or authentication checks.</li>
              <li>
                Using the platform to generate misleading, deceptive, or malicious documentation.
              </li>
              <li>
                Submitting abusive, hateful, or illegal materials to the AI processing endpoints.
              </li>
              <li>Sharing or reselling access to individual user accounts to third parties.</li>
            </ul>
          </section>

          {/* Section 7: Payment & Subscription Terms */}
          <section id="payment-terms" className="space-y-4 scroll-mt-28">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#370003] border-b border-[#E5D9C8] pb-2">
              7. Payment &amp; Subscription Terms
            </h2>
            <p>
              JobPatra offers free and premium paid subscription tiers. Paid plans unlock increased
              monthly AI suggestion limits, unlimited ATS scans, and access to premium templates.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Billing &amp; Gateway:</strong> Payments are securely processed through
                Razorpay. All fees are denominated in Indian Rupees (INR) or designated local
                currencies and include applicable GST.
              </li>
              <li>
                <strong>Renewal:</strong> Recurring subscriptions renew automatically on your
                scheduled billing date unless cancelled prior to the renewal event.
              </li>
              <li>
                <strong>Cancellation:</strong> You can cancel your subscription renewal at any time
                via your Billing Settings. Following cancellation, your premium features remain
                active through the end of the paid term.
              </li>
              <li>
                <strong>Refund Policy:</strong> Due to the instant provisioning of compute and AI
                credits, subscription charges are generally non-refundable once an analysis or
                download quota has been consumed. If you experience technical defects, please
                contact{' '}
                <a
                  href="mailto:support@jobpatra.in"
                  className="text-[#370003] font-semibold underline"
                >
                  support@jobpatra.in
                </a>{' '}
                within 7 days of payment.
              </li>
            </ul>
          </section>

          {/* Section 8: Intellectual Property */}
          <section id="intellectual-property" className="space-y-4 scroll-mt-28">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#370003] border-b border-[#E5D9C8] pb-2">
              8. JobPatra Intellectual Property
            </h2>
            <p>
              All platform features, underlying codebases, proprietary layout algorithms, graphic
              designs, logos, typography arrangements, and template code are the exclusive
              intellectual property of JobPatra.
            </p>
            <p>
              You receive a revocable, non-exclusive license to export personal resumes formatted
              through the service. You may not extract or republish JobPatra templates as standalone
              commercial design assets.
            </p>
          </section>

          {/* Section 9: Account Termination */}
          <section id="termination" className="space-y-4 scroll-mt-28">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#370003] border-b border-[#E5D9C8] pb-2">
              9. Account Termination
            </h2>
            <p>
              You may terminate your account at any time by utilizing the account deletion controls
              in Settings or by submitting a written request to{' '}
              <a
                href="mailto:support@jobpatra.in"
                className="text-[#370003] font-semibold underline"
              >
                support@jobpatra.in
              </a>
              .
            </p>
            <p>
              JobPatra may immediately suspend or terminate your access without prior notice if you
              breach these Terms, abuse AI services, or engage in unlawful activities.
            </p>
          </section>

          {/* Section 10: Disclaimer of Warranties */}
          <section id="disclaimer-warranties" className="space-y-4 scroll-mt-28">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#370003] border-b border-[#E5D9C8] pb-2">
              10. Disclaimer of Warranties
            </h2>
            <p>
              The JobPatra platform and all related tools are provided strictly on an{' '}
              <strong>&ldquo;AS IS&rdquo;</strong> and <strong>&ldquo;AS AVAILABLE&rdquo;</strong>{' '}
              basis without warranties of any kind, whether express or implied.
            </p>
            <div className="p-4 rounded-xl bg-[#FFF8F6] border border-[#E5D9C8] space-y-2 text-sm text-[#564240]">
              <p>
                <strong>Important Career Notice:</strong>
              </p>
              <p>
                JobPatra provides optimization tools designed to assist in career preparation. We
                make <strong>no guarantee</strong> that using JobPatra, achieving high ATS scores,
                or implementing AI rewrite suggestions will result in job offers, recruiter
                interviews, or employment hiring outcomes. Recruitment decisions depend solely on
                independent third-party employers.
              </p>
            </div>
          </section>

          {/* Section 11: Limitation of Liability */}
          <section id="limitation-liability" className="space-y-4 scroll-mt-28">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#370003] border-b border-[#E5D9C8] pb-2">
              11. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by applicable law, JobPatra, its founder, and
              affiliates shall not be liable for any indirect, incidental, special, consequential,
              or punitive damages—including loss of employment opportunities, profits, or
              data—arising out of your access or inability to access the service.
            </p>
            <p>
              Our total cumulative liability for any claim arising under these Terms shall not
              exceed the amount paid by you to JobPatra during the twelve (12) months preceding the
              event giving rise to liability.
            </p>
          </section>

          {/* Section 12: Dispute Resolution & Governing Law */}
          <section id="dispute-resolution" className="space-y-4 scroll-mt-28">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#370003] border-b border-[#E5D9C8] pb-2">
              12. Dispute Resolution &amp; Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of{' '}
              <strong>India</strong>, without regard to conflict of law principles.
            </p>
            <p>
              In the event of any disagreement or claim, the parties agree to first seek informal
              amicable resolution by contacting{' '}
              <a
                href="mailto:support@jobpatra.in"
                className="text-[#370003] font-semibold underline"
              >
                support@jobpatra.in
              </a>
              . If unresolved, any formal dispute shall be subject to the exclusive jurisdiction of
              the competent courts in India.
            </p>
          </section>

          {/* Section 13: Changes to Terms */}
          <section id="changes-to-terms" className="space-y-4 scroll-mt-28">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#370003] border-b border-[#E5D9C8] pb-2">
              13. Changes to Terms
            </h2>
            <p>
              We reserve the right to revise or modify these Terms at any time. When updates are
              published, the effective date will be revised accordingly. Your continued use of the
              platform following the posting of revised Terms confirms your acceptance of the
              changes.
            </p>
          </section>

          {/* Section 14: Severability */}
          <section id="severability" className="space-y-4 scroll-mt-28">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#370003] border-b border-[#E5D9C8] pb-2">
              14. Severability
            </h2>
            <p>
              If any provision or portion of these Terms is determined to be unlawful, void, or
              unenforceable, that provision shall be deemed severable and shall not affect the
              validity and enforceability of any remaining provisions.
            </p>
          </section>

          {/* Section 15: Entire Agreement */}
          <section id="entire-agreement" className="space-y-4 scroll-mt-28">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#370003] border-b border-[#E5D9C8] pb-2">
              15. Entire Agreement
            </h2>
            <p>
              These Terms, together with our Privacy Policy, constitute the complete and exclusive
              legal agreement between you and JobPatra regarding your use of the service,
              superseding any prior verbal or written understandings.
            </p>
          </section>

          {/* Section 16: Contact Us */}
          <section id="contact-terms" className="space-y-4 scroll-mt-28">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#370003] border-b border-[#E5D9C8] pb-2">
              16. Contact Us
            </h2>
            <p>
              For legal notices, billing inquiries, or questions concerning these Terms, please
              contact:
            </p>
            <div className="p-6 rounded-2xl bg-[#FFF8F6] border border-[#E5D9C8] space-y-2">
              <p className="font-bold text-[#370003]">JobPatra Legal &amp; Operations</p>
              <p className="text-sm">
                Email:{' '}
                <a
                  href="mailto:support@jobpatra.in"
                  className="text-[#370003] font-semibold underline"
                >
                  support@jobpatra.in
                </a>
              </p>
              <p className="text-sm">
                Inquiry Form:{' '}
                <Link href="/app/contact" className="text-[#370003] font-semibold underline">
                  Contact &amp; Feedback
                </Link>
              </p>
            </div>
          </section>
        </div>

        {/* Bottom Navigation Summary */}
        <div className="bg-[#FFF8F6] border border-[#E5D9C8] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-sm">
          <div>
            <h4 className="font-['Playfair_Display'] text-lg font-bold text-[#370003]">
              Need clarification on our terms?
            </h4>
            <p className="text-xs text-[#564240] mt-0.5">
              Read our Privacy Policy or get in touch with our team directly.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/app/privacy"
              className="bg-white border border-[#E5D9C8] text-[#370003] text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-[#fff0ee] transition-all shadow-sm"
            >
              Privacy Policy
            </Link>
            <Link
              href="/app/contact"
              className="bg-[#370003] text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:scale-105 transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>Contact Us</span>
              <IconMapper name="arrow_forward" className="text-xs" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
