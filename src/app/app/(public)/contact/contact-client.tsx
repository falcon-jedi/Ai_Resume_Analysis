'use client';

import { useState, useRef } from 'react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { useSubmitFeedback } from '@/app/app/_hooks/use-feedback';
import { IconMapper } from '@/app/_components/icons/IconMapper';
import { FeedbackType } from '@/app/api/model/enums/feedback';
import { toast } from 'sonner';

const FEEDBACK_TYPES: { type: FeedbackType; label: string; icon: string; desc: string }[] = [
  {
    type: FeedbackType.GENERAL,
    label: 'General Inquiry',
    icon: 'feedback',
    desc: 'Questions or general feedback',
  },
  {
    type: FeedbackType.BUG,
    label: 'Report a Bug',
    icon: 'bug_report',
    desc: 'Something is broken or not working',
  },
  {
    type: FeedbackType.FEATURE,
    label: 'Feature Request',
    icon: 'lightbulb',
    desc: 'Ideas to make JobPatra better',
  },
  {
    type: FeedbackType.COMPLIMENT,
    label: 'Compliment',
    icon: 'thumb_up',
    desc: 'Tell us what you enjoyed',
  },
];

export function ContactClient() {
  const [selectedType, setSelectedType] = useState<FeedbackType>(FeedbackType.GENERAL);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string>('');

  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const submitMutation = useSubmitFeedback();

  // Cloudflare Turnstile site key (falls back to Cloudflare's always-pass test key in dev/staging)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter your name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }

    if (!message.trim() || message.trim().length < 3) {
      toast.error('Please enter a message with at least 3 characters.');
      return;
    }

    if (!turnstileToken) {
      toast.error('Please complete the verification check before submitting.');
      return;
    }

    try {
      const pageUrl = typeof window !== 'undefined' ? window.location.href : undefined;

      await submitMutation.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        type: selectedType,
        rating: rating || undefined,
        subject: subject.trim() || undefined,
        message: message.trim(),
        pageUrl,
        turnstileToken,
      });

      toast.success('Thank you! Your message has been sent to our team.');
      // Reset form
      setName('');
      setEmail('');
      setSelectedType(FeedbackType.GENERAL);
      setRating(null);
      setSubject('');
      setMessage('');
      setTurnstileToken('');
      turnstileRef.current?.reset();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit feedback. Please try again.');
      turnstileRef.current?.reset();
      setTurnstileToken('');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8EE] text-[#2b1611] font-['Hanken_Grotesk'] pt-28 pb-20 px-4 md:px-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#fff0ee] text-[#370003] border border-[#E5D9C8] mb-4 shadow-sm">
            <IconMapper name="mail" className="text-sm text-[#370003]" /> Get In Touch
          </div>
          <h1 className="font-['Playfair_Display'] text-[36px] md:text-[52px] leading-[44px] md:leading-[60px] font-bold text-[#370003] mb-4">
            Contact &amp; Feedback
          </h1>
          <p className="text-[#564240] text-[16px] md:text-[18px] leading-[26px] max-w-2xl">
            Have a question, encountered an issue, or want to suggest a new feature? Send us a
            message and our team will get back to you promptly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Info Column */}
          <div className="space-y-6">
            <div className="bg-[#FFF8F6] border border-[#E5D9C8] rounded-2xl p-6 shadow-sm">
              <div className="w-10 h-10 bg-[#fff0ee] rounded-full flex items-center justify-center mb-4">
                <IconMapper name="mail" className="text-[#370003] text-lg" />
              </div>
              <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#2b1611] mb-1">
                Direct Email
              </h3>
              <p className="text-xs text-[#564240] mb-3">
                Reach our customer success and founder team directly:
              </p>
              <a
                href="mailto:support@jobpatra.in"
                className="text-sm font-semibold text-[#370003] underline decoration-[#f6be39] decoration-2 underline-offset-4 hover:text-[#5b060c]"
              >
                support@jobpatra.in
              </a>
            </div>

            <div className="bg-[#FFF8F6] border border-[#E5D9C8] rounded-2xl p-6 shadow-sm">
              <div className="w-10 h-10 bg-[#fed174]/20 rounded-full flex items-center justify-center mb-4">
                <IconMapper name="fact_check" className="text-[#785800] text-lg" />
              </div>
              <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#2b1611] mb-1">
                Swift Responses
              </h3>
              <p className="text-xs text-[#564240] leading-relaxed">
                We review every bug report and user inquiry, typically responding within 24–48
                hours.
              </p>
            </div>

            <div className="bg-[#370003] text-white rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <IconMapper name="auto_awesome" className="text-[#f6be39] text-base" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#f6be39]">
                  Community Driven
                </span>
              </div>
              <p className="text-xs text-white/90 leading-relaxed">
                Over 70% of our recent resume templates and ATS score enhancements originated
                directly from user feedback.
              </p>
            </div>
          </div>

          {/* Right Main Form Column */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-[#FFF8F6] border border-[#E5D9C8] rounded-2xl p-6 md:p-8 shadow-md space-y-6"
            >
              {/* Name & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-bold uppercase tracking-wider text-[#370003] mb-1.5"
                  >
                    Your Name <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-4 py-2.5 bg-white border border-[#E5D9C8] rounded-xl text-sm text-[#2b1611] placeholder-[#8a716f]/60 focus:outline-none focus:ring-2 focus:ring-[#370003]/20 focus:border-[#370003] transition-all"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-bold uppercase tracking-wider text-[#370003] mb-1.5"
                  >
                    Your Email <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. sarah@example.com"
                    className="w-full px-4 py-2.5 bg-white border border-[#E5D9C8] rounded-xl text-sm text-[#2b1611] placeholder-[#8a716f]/60 focus:outline-none focus:ring-2 focus:ring-[#370003]/20 focus:border-[#370003] transition-all"
                  />
                </div>
              </div>

              {/* Feedback Type Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#370003] mb-2.5">
                  Message Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {FEEDBACK_TYPES.map(({ type, label, icon }) => {
                    const isSelected = selectedType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSelectedType(type)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#370003] text-white border-[#370003] shadow-sm scale-[1.02]'
                            : 'bg-white text-[#564240] border-[#E5D9C8] hover:bg-[#fff0ee] hover:text-[#370003]'
                        }`}
                      >
                        <IconMapper
                          name={icon}
                          className={`text-lg mb-1 ${isSelected ? 'text-white' : 'text-[#370003]'}`}
                        />
                        <span className="text-xs font-semibold leading-tight">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rating (Stars) — Only for GENERAL and COMPLIMENT */}
              {(selectedType === FeedbackType.GENERAL ||
                selectedType === FeedbackType.COMPLIMENT) && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#370003] mb-1.5">
                    Experience Rating{' '}
                    <span className="text-xs font-normal text-[#8a716f] lowercase">(optional)</span>
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = (hoverRating ?? rating ?? 0) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          onClick={() => setRating(rating === star ? null : star)}
                          className="p-1 text-[#f6be39] hover:scale-125 transition-transform focus:outline-none cursor-pointer"
                          aria-label={`${star} Star`}
                        >
                          <IconMapper
                            name={isFilled ? 'star' : 'star_border'}
                            className="text-2xl"
                          />
                        </button>
                      );
                    })}
                    {rating && (
                      <button
                        type="button"
                        onClick={() => setRating(null)}
                        className="text-xs text-[#8a716f] hover:text-[#370003] underline ml-2 cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Subject Field */}
              <div>
                <label
                  htmlFor="contact-subject"
                  className="block text-xs font-bold uppercase tracking-wider text-[#370003] mb-1.5"
                >
                  Subject{' '}
                  <span className="text-xs font-normal text-[#8a716f] lowercase">(optional)</span>
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Inquiry regarding enterprise templates"
                  maxLength={200}
                  className="w-full px-4 py-2.5 bg-white border border-[#E5D9C8] rounded-xl text-sm text-[#2b1611] placeholder-[#8a716f]/60 focus:outline-none focus:ring-2 focus:ring-[#370003]/20 focus:border-[#370003] transition-all"
                />
              </div>

              {/* Message Textarea */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-bold uppercase tracking-wider text-[#370003]"
                  >
                    Your Message <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <span className="text-xs text-[#8a716f]">{message.length} characters</span>
                </div>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your feedback, inquiry, or issue description here..."
                  className="w-full px-4 py-3 bg-white border border-[#E5D9C8] rounded-xl text-sm text-[#2b1611] placeholder-[#8a716f]/60 focus:outline-none focus:ring-2 focus:ring-[#370003]/20 focus:border-[#370003] transition-all resize-none"
                />
              </div>

              {/* Cloudflare Turnstile CAPTCHA Widget */}
              <div className="pt-2 flex flex-col items-start gap-2">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={siteKey}
                  onSuccess={(token) => setTurnstileToken(token)}
                  onError={() => {
                    console.warn('Turnstile widget encountered an issue.');
                  }}
                  onExpire={() => setTurnstileToken('')}
                  options={{
                    theme: 'light',
                    size: 'normal',
                  }}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={
                    submitMutation.isPending ||
                    !turnstileToken ||
                    !name.trim() ||
                    !email.trim() ||
                    message.trim().length < 3
                  }
                  className="w-full bg-[#370003] text-white font-semibold text-sm py-3.5 rounded-full hover:scale-[1.01] transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitMutation.isPending ? (
                    <>
                      <IconMapper name="hourglass_empty" className="animate-spin text-sm" />
                      Submitting Message...
                    </>
                  ) : (
                    <>
                      <IconMapper name="send" className="text-sm" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
