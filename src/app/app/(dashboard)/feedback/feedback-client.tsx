'use client';

import { useState } from 'react';
import { useSubmitFeedback } from '@/app/app/_hooks/use-feedback';
import { IconMapper } from '@/app/_components/icons/IconMapper';
import { FeedbackType } from '@/app/api/model/enums/feedback';
import { toast } from 'sonner';
import { useRateLimit } from '@/app/app/_hooks/use-rate-limit';
import { RateLimitError } from '@/app/api/client/_utils/api-client';

interface FeedbackClientProps {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
  };
}

const FEEDBACK_TYPES: { type: FeedbackType; label: string; icon: string; desc: string }[] = [
  {
    type: FeedbackType.BUG,
    label: 'Bug Report',
    icon: 'bug_report',
    desc: 'Something isn’t working as expected',
  },
  {
    type: FeedbackType.FEATURE,
    label: 'Feature Request',
    icon: 'lightbulb',
    desc: 'Ideas to make JobPatra better',
  },
  {
    type: FeedbackType.GENERAL,
    label: 'General',
    icon: 'feedback',
    desc: 'Thoughts, questions, or feedback',
  },
  {
    type: FeedbackType.COMPLIMENT,
    label: 'Compliment',
    icon: 'thumb_up',
    desc: 'Share what you loved about our app',
  },
];

export function FeedbackClient({ user }: FeedbackClientProps) {
  const [selectedType, setSelectedType] = useState<FeedbackType>(FeedbackType.GENERAL);
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const submitMutation = useSubmitFeedback();
  const { isRateLimited, secondsLeft, triggerRateLimit } = useRateLimit();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || message.trim().length < 3) {
      toast.error('Please enter a message with at least 3 characters.');
      return;
    }

    try {
      const pageUrl = typeof window !== 'undefined' ? window.location.href : undefined;

      await submitMutation.mutateAsync({
        type: selectedType,
        rating: rating || undefined,
        subject: subject.trim() || undefined,
        message: message.trim(),
        pageUrl,
      });

      toast.success('Thank you! Your feedback has been received.');
      // Reset form
      setSelectedType(FeedbackType.GENERAL);
      setRating(null);
      setSubject('');
      setMessage('');
    } catch (err: any) {
      if (err instanceof RateLimitError) {
        triggerRateLimit(err.retryAfter);
        toast.error(`Too many submissions. Please wait ${err.retryAfter}s before trying again.`);
        return;
      }
      toast.error(err.message || 'Failed to submit feedback. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto font-['Hanken_Grotesk']">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#fff0ee] text-[#370003] border border-[#E5D9C8] mb-3 shadow-sm">
          <IconMapper name="feedback" className="text-sm text-[#370003]" /> We Value Your Voice
        </div>
        <h1 className="font-['Playfair_Display'] text-[28px] md:text-[36px] font-bold text-[#370003]">
          Share Your Feedback
        </h1>
        <p className="text-[#564240] text-sm md:text-base mt-1">
          Help us shape the future of JobPatra. We read every message and respond directly.
        </p>
      </div>

      {/* Feedback Card Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#FFF8F6] border border-[#E5D9C8] rounded-2xl p-6 md:p-8 shadow-sm space-y-6"
      >
        {/* Feedback Type Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#370003] mb-3">
            Feedback Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {FEEDBACK_TYPES.map(({ type, label, icon }) => {
              const isSelected = selectedType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#370003] text-white border-[#370003] shadow-md scale-[1.02]'
                      : 'bg-white text-[#564240] border-[#E5D9C8] hover:bg-[#fff0ee] hover:text-[#370003]'
                  }`}
                >
                  <IconMapper
                    name={icon}
                    className={`text-xl mb-1.5 ${isSelected ? 'text-white' : 'text-[#370003]'}`}
                  />
                  <span className="text-xs font-semibold leading-tight">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Rating (Stars) — Only for GENERAL and COMPLIMENT */}
        {(selectedType === FeedbackType.GENERAL || selectedType === FeedbackType.COMPLIMENT) && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#370003] mb-2">
              Overall Experience{' '}
              <span className="text-xs font-normal text-[#8a716f] lowercase">(optional)</span>
            </label>
            <div className="flex items-center gap-1.5">
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
                    <IconMapper name={isFilled ? 'star' : 'star_border'} className="text-2xl" />
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
            htmlFor="subject"
            className="block text-xs font-bold uppercase tracking-wider text-[#370003] mb-1.5"
          >
            Subject <span className="text-xs font-normal text-[#8a716f] lowercase">(optional)</span>
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Export PDF layout issue, New AI feature idea"
            maxLength={200}
            className="w-full px-4 py-2.5 bg-white border border-[#E5D9C8] rounded-xl text-sm text-[#2b1611] placeholder-[#8a716f]/60 focus:outline-none focus:ring-2 focus:ring-[#370003]/20 focus:border-[#370003] transition-all"
          />
        </div>

        {/* Message Textarea */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label
              htmlFor="message"
              className="block text-xs font-bold uppercase tracking-wider text-[#370003]"
            >
              Message <span className="text-[#ba1a1a]">*</span>
            </label>
            <span className="text-xs text-[#8a716f]">{message.length} characters</span>
          </div>
          <textarea
            id="message"
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what you experienced, what we can improve, or any ideas you have..."
            className="w-full px-4 py-3 bg-white border border-[#E5D9C8] rounded-xl text-sm text-[#2b1611] placeholder-[#8a716f]/60 focus:outline-none focus:ring-2 focus:ring-[#370003]/20 focus:border-[#370003] transition-all resize-none"
          />
        </div>

        {/* Submit Action */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#564240]">
            Submitting as{' '}
            <span className="font-semibold text-[#370003]">
              {user?.email || 'Authenticated User'}
            </span>
          </p>
          <button
            type="submit"
            disabled={submitMutation.isPending || message.trim().length < 3 || isRateLimited}
            className="w-full sm:w-auto bg-[#370003] text-white font-semibold text-sm px-8 py-3 rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            {submitMutation.isPending ? (
              <>
                <IconMapper name="hourglass_empty" className="animate-spin text-sm" />
                Sending...
              </>
            ) : isRateLimited ? (
              <>
                <IconMapper name="timer" className="text-sm" />
                Try again in {secondsLeft}s
              </>
            ) : (
              <>
                <IconMapper name="send" className="text-sm" />
                Submit Feedback
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
