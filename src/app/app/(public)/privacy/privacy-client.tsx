'use client';

import React from 'react';
import Link from 'next/link';
import { IconMapper } from '@/app/_components/icons/IconMapper';

export function PrivacyClient() {
  const lastUpdated = 'August 31, 2026';

  const sections = [
    { id: 'introduction', title: '1. Introduction' },
    { id: 'data-we-collect', title: '2. What Personal Data We Collect' },
    { id: 'how-we-use-data', title: '3. How We Use Your Data' },
    { id: 'data-sharing', title: '4. Data Sharing & Third Parties' },
    { id: 'data-security', title: '5. Data Security' },
    { id: 'data-retention', title: '6. Data Retention & Deletion' },
    { id: 'your-rights', title: '7. Your Rights' },
    { id: 'cookies-tracking', title: '8. Cookies & Tracking' },
    { id: 'international-transfers', title: '9. International Data Transfers' },
    { id: 'policy-updates', title: '10. Updates to This Policy' },
    { id: 'contact-info', title: '11. Contact Information' },
    { id: 'legal-compliance', title: '12. Legal Compliance' },
  ];

  return (
    <div className="min-h-screen bg-[#FFF8EE] text-[#2b1611] font-['Hanken_Grotesk'] pt-24 pb-20 px-4 md:px-16 selection:bg-[#370003] selection:text-white">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center pt-8 pb-4 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#fff0ee] text-[#370003] border border-[#E5D9C8] shadow-sm">
            <IconMapper name="shield" className="text-sm text-[#370003]" /> Legal &amp; Transparency
          </div>
          <h1 className="font-['Playfair_Display'] text-[36px] sm:text-[48px] md:text-[54px] font-bold text-[#370003] leading-tight">
            Privacy Policy
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
          {/* Section 1: Introduction */}
          <section id="introduction" className="space-y-4 scroll-mt-28">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#370003] border-b border-[#E5D9C8] pb-2">
              1. Introduction
            </h2>
            <p>
              Welcome to <strong>JobPatra</strong> (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or
              &ldquo;us&rdquo;). We are dedicated to empowering job seekers by providing an
              intelligent resume builder, ATS (Applicant Tracking System) optimization analyzer, and
              career management tools.
            </p>
            <p>
              This Privacy Policy explains how we collect, use, disclose, and safeguard your
              personal data when you visit our website at{' '}
              <Link href="/" className="text-[#370003] font-semibold underline">
                jobpatra.in
              </Link>{' '}
              or utilize any of our web applications and associated services.
            </p>
            <p className="bg-[#fff0ee] border-l-4 border-[#370003] p-4 rounded-r-lg text-sm text-[#370003] font-medium">
              We respect your privacy. JobPatra does not sell your personal data or your resume
              contents to third-party data brokers or advertisers.
            </p>
          </section>

          {/* Section 2: What Personal Data We Collect */}
          <section id="data-we-collect" className="space-y-4 scroll-mt-28">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#370003] border-b border-[#E5D9C8] pb-2">
              2. What Personal Data We Collect
            </h2>
            <p>
              We collect information that you directly provide to us, as well as limited technical
              telemetry collected automatically when you navigate our platform.
            </p>

            <div className="space-y-3 pt-2">
              <h3 className="text-lg font-bold text-[#370003]">a) Data You Provide Directly:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Account Credentials:</strong> Name, email address, password hash, or
                  social login authentication tokens (Google OAuth).
                </li>
                <li>
                  <strong>Contact Information:</strong> Phone number, location, and communication
                  preferences provided during account setup or inquiry forms.
                </li>
                <li>
                  <strong>Resume &amp; Career Content:</strong> Work experience, education history,
                  skills, certifications, projects, personal summary, and custom resume sections
                  uploaded or inputted into the builder.
                </li>
                <li>
                  <strong>Job Descriptions:</strong> Text, keywords, and job URLs submitted for ATS
                  relevance scoring and skill-gap identification.
                </li>
                <li>
                  <strong>Payment Information:</strong> When upgrading to premium subscriptions,
                  payment transaction IDs, invoices, and billing addresses are collected.{' '}
                  <em>
                    Note: Credit/debit card numbers and UPI details are processed securely through
                    our PCI-DSS compliant payment gateway (Razorpay); JobPatra never stores raw card
                    credentials.
                  </em>
                </li>
              </ul>
            </div>

            <div className="space-y-3 pt-2">
              <h3 className="text-lg font-bold text-[#370003]">
                b) Data We Collect Automatically:
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Device and Network Information:</strong> IP address, browser type,
                  operating system, device identifiers, and language settings.
                </li>
                <li>
                  <strong>Usage Activity:</strong> Timestamped records of page views, features
                  utilized, export events, and interaction metrics used to diagnose bugs and
                  optimize service performance.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3: How We Use Your Data */}
          <section id="how-we-use-data" className="space-y-4 scroll-mt-28">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#370003] border-b border-[#E5D9C8] pb-2">
              3. How We Use Your Data
            </h2>
            <p>
              We process your personal information for lawful and necessary operational purposes,
              including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Delivering Core Services:</strong> Rendering professional PDF resumes,
                evaluating keyword relevance against job descriptions, and generating AI-powered
                rewrite recommendations.
              </li>
              <li>
                <strong>Account Maintenance:</strong> Managing login authentication, password
                resets, subscription tier quotas, and usage history.
              </li>
              <li>
                <strong>Transactional Communications:</strong> Sending order receipts, plan change
                notices, email verification links, and customer support responses.
              </li>
              <li>
                <strong>Platform Optimization:</strong> Monitoring system health, preventing abusive
                traffic or scraping, and enhancing UX across mobile and desktop.
              </li>
              <li>
                <strong>Legal &amp; Compliance:</strong> Satisfying statutory taxation rules,
                preventing fraud, and resolving potential disputes.
              </li>
            </ul>
          </section>

          {/* Section 4: Data Sharing & Third Parties */}
          <section id="data-sharing" className="space-y-4 scroll-mt-28">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#370003] border-b border-[#E5D9C8] pb-2">
              4. Data Sharing &amp; Third Parties
            </h2>
            <p>
              Your resumes, career details, and contact lists are strictly confidential. We only
              share necessary data with trusted service providers under confidentiality agreements:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Cloud Infrastructure &amp; Database:</strong> Cloud hosting (Supabase / AWS
                PostgreSQL) for persistent, encrypted data storage.
              </li>
              <li>
                <strong>Payment Processors:</strong> Razorpay Software Private Limited for
                subscription billing and tax invoice generation.
              </li>
              <li>
                <strong>Email Delivery:</strong> Resend for delivering verification links,
                transactional notices, and user support emails.
              </li>
              <li>
                <strong>AI &amp; Parsing Services:</strong> Internal and vetted AI microservice
                endpoints utilized strictly to produce ATS suggestions. Your resume content is not
                sold or used to train public models.
              </li>
              <li>
                <strong>Security &amp; Bot Protection:</strong> Cloudflare Turnstile for spam
                prevention and CAPTCHA validation.
              </li>
            </ul>
          </section>

          {/* Section 5: Data Security */}
          <section id="data-security" className="space-y-4 scroll-mt-28">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#370003] border-b border-[#E5D9C8] pb-2">
              5. Data Security
            </h2>
            <p>
              We implement industry-standard organizational and technical security measures to
              protect your information against unauthorized access, loss, alteration, or disclosure.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Encryption:</strong> All web traffic is strictly encrypted in transit via
                Transport Layer Security (HTTPS / TLS 1.3). Database storage utilizes encryption at
                rest.
              </li>
              <li>
                <strong>Authentication Security:</strong> Secure HTTP-only cookies, salted password
                hashing, and tokenized session management protect user accounts.
              </li>
              <li>
                <strong>Access Control:</strong> Administrative access to production databases is
                restricted to authorized personnel via multi-factor authentication.
              </li>
            </ul>
            <p className="text-xs text-[#8a716f] italic">
              While we implement rigorous safeguards, no electronic transmission over the internet
              or storage architecture can be guaranteed to be 100% impenetrable. We encourage you to
              use unique passwords.
            </p>
          </section>

          {/* Section 6: Data Retention & Deletion */}
          <section id="data-retention" className="space-y-4 scroll-mt-28">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#370003] border-b border-[#E5D9C8] pb-2">
              6. Data Retention &amp; Deletion
            </h2>
            <p>
              We retain your personal data and resume documents for as long as your account remains
              active or as needed to provide you with seamless cross-device history.
            </p>
            <p>
              You have the right to delete specific resumes, purge your ATS scan history, or delete
              your entire JobPatra profile at any time through your dashboard settings or by
              contacting{' '}
              <a
                href="mailto:support@jobpatra.in"
                className="text-[#370003] font-semibold underline"
              >
                support@jobpatra.in
              </a>
              . Upon receipt of an account erasure request, all associated personal resume data will
              be permanently wiped from active databases within 30 days.
            </p>
          </section>

          {/* Section 7: Your Rights */}
          <section id="your-rights" className="space-y-4 scroll-mt-28">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#370003] border-b border-[#E5D9C8] pb-2">
              7. Your Rights
            </h2>
            <p>
              Depending on your jurisdiction, you are entitled to key privacy rights regarding your
              data:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Right to Access:</strong> Request a full copy of the personal information we
                hold about you.
              </li>
              <li>
                <strong>Right to Rectification:</strong> Edit or correct any inaccurate or
                incomplete resume or profile information directly in the application.
              </li>
              <li>
                <strong>Right to Erasure (&ldquo;Right to Be Forgotten&rdquo;):</strong> Request the
                permanent deletion of your account and all associated documents.
              </li>
              <li>
                <strong>Right to Data Portability:</strong> Export your resumes in standard PDF
                format at any time.
              </li>
              <li>
                <strong>Right to Withdraw Consent:</strong> Opt out of optional marketing or
                feedback communications.
              </li>
            </ul>
            <p>
              To exercise any of these rights, email us at{' '}
              <a
                href="mailto:support@jobpatra.in"
                className="text-[#370003] font-semibold underline"
              >
                support@jobpatra.in
              </a>
              . We process verified requests within 48 hours without fees.
            </p>
          </section>

          {/* Section 8: Cookies & Tracking */}
          <section id="cookies-tracking" className="space-y-4 scroll-mt-28">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#370003] border-b border-[#E5D9C8] pb-2">
              8. Cookies &amp; Tracking
            </h2>
            <p>
              JobPatra uses cookies and similar storage technologies solely for essential
              operational mechanisms:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Essential Authentication Cookies:</strong> Used to maintain secure user
                login sessions across page navigations.
              </li>
              <li>
                <strong>Security Cookies:</strong> Utilized by Cloudflare Turnstile to verify
                genuine human requests and prevent DDoS attacks.
              </li>
              <li>
                <strong>User Preference Storage:</strong> Storing local preferences such as theme
                settings and builder workspace states.
              </li>
            </ul>
            <p>
              We do not use invasive third-party cross-site advertising trackers. You can adjust
              your browser settings to reject cookies, though doing so may disable authenticated
              dashboard functions.
            </p>
          </section>

          {/* Section 9: International Data Transfers */}
          <section id="international-transfers" className="space-y-4 scroll-mt-28">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#370003] border-b border-[#E5D9C8] pb-2">
              9. International Data Transfers
            </h2>
            <p>
              JobPatra is based in India, and our cloud infrastructure leverages tier-1 data centers
              located across standard secure cloud regions. If you access the service from outside
              India, your information may be transferred across international boundaries under
              secure data protection protocols.
            </p>
          </section>

          {/* Section 10: Updates to This Policy */}
          <section id="policy-updates" className="space-y-4 scroll-mt-28">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#370003] border-b border-[#E5D9C8] pb-2">
              10. Updates to This Policy
            </h2>
            <p>
              We may revise this Privacy Policy periodically to reflect enhancements in our
              platform, new features, or legislative changes. When modifications occur, we will
              update the &ldquo;Effective Date&rdquo; displayed at the top of this document.
              Material changes will be communicated via email or an in-app dashboard banner.
            </p>
          </section>

          {/* Section 11: Contact Information */}
          <section id="contact-info" className="space-y-4 scroll-mt-28">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#370003] border-b border-[#E5D9C8] pb-2">
              11. Contact Information
            </h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or your
              personal data, please reach out to our dedicated support team:
            </p>
            <div className="p-6 rounded-2xl bg-[#FFF8F6] border border-[#E5D9C8] space-y-2">
              <p className="font-bold text-[#370003]">JobPatra Support Team</p>
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
                Web Form:{' '}
                <Link href="/app/contact" className="text-[#370003] font-semibold underline">
                  Contact &amp; Feedback Page
                </Link>
              </p>
              <p className="text-xs text-[#8a716f] pt-1">
                Standard inquiry response window: within 24–48 business hours.
              </p>
            </div>
          </section>

          {/* Section 12: Legal Compliance */}
          <section id="legal-compliance" className="space-y-4 scroll-mt-28">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#370003] border-b border-[#E5D9C8] pb-2">
              12. Legal Compliance
            </h2>
            <p>
              This policy is governed in accordance with applicable laws of India, including the
              Information Technology Act, 2000 and the Digital Personal Data Protection Act (DPDPA),
              alongside recognized international data privacy standards.
            </p>
          </section>
        </div>

        {/* Bottom CTA Card */}
        <div className="bg-[#FFF8F6] border border-[#E5D9C8] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-sm">
          <div>
            <h4 className="font-['Playfair_Display'] text-lg font-bold text-[#370003]">
              Have questions about your privacy or data?
            </h4>
            <p className="text-xs text-[#564240] mt-0.5">
              Our team is ready to assist with any questions or account requests.
            </p>
          </div>
          <Link
            href="/app/contact"
            className="bg-[#370003] text-white text-xs font-semibold px-6 py-2.5 rounded-full hover:scale-105 transition-all shadow-sm flex items-center gap-1.5 flex-shrink-0"
          >
            <span>Contact Support</span>
            <IconMapper name="arrow_forward" className="text-xs" />
          </Link>
        </div>
      </div>
    </div>
  );
}
