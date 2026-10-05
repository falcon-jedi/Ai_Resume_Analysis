'use client';
import { IconMapper } from '@/app/_components/icons/IconMapper';

/**
 * AIImproveButton — reusable "AI Improve" trigger for resume section editors.
 *
 * States
 * ------
 * idle      → Renders the primary "AI Improve" button.
 * loading   → Spinner while waiting for the first token from the stream.
 * streaming → Animated preview textarea with token-by-token text accumulation.
 *             Shows "Accept" and "Dismiss" CTA buttons.
 * error     → Inline error message (auto-dismissed after 8 s).
 *
 * Props
 * -----
 * sectionType  — Which section is being improved (drives the LLM prompt).
 * currentText  — The current text value of the field being improved.
 * onAccept     — Called with the fully streamed improved text.
 * resumeContext — Optional full-resume string for LLM context.
 *
 * Usage
 * -----
 * <AIImproveButton
 *   sectionType="summary"
 *   currentText={watch('personalInfo.summary') ?? ''}
 *   onAccept={(text) => setValue('personalInfo.summary', text, { shouldDirty: true })}
 * />
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { streamResumeImprovement, type SectionType } from '@/app/service/ai/resume-improve.service';
import { parseSSEChunk } from '@/app/app/_util/parse-sse';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type UIState = 'idle' | 'loading' | 'streaming' | 'error';

interface AIImproveButtonProps {
  sectionType: SectionType;
  currentText: string;
  onAccept: (newText: string) => void;
  resumeContext?: string;
  /** Optional label override. Defaults to "AI Improve". */
  label?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AIImproveButton({
  sectionType,
  currentText,
  onAccept,
  resumeContext,
  label = 'AI Improve',
}: AIImproveButtonProps) {
  const [uiState, setUiState] = useState<UIState>('idle');
  const [streamedText, setStreamedText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, []);

  const handleError = useCallback((message: string) => {
    setErrorMessage(message);
    setUiState('error');

    // Auto-dismiss after 8 s
    errorTimerRef.current = setTimeout(() => {
      setUiState('idle');
      setErrorMessage('');
    }, 8000);
  }, []);

  const handleStart = useCallback(async () => {
    if (!currentText.trim()) return;

    // Cancel any previous in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setStreamedText('');
    setUiState('loading');

    try {
      const response = await streamResumeImprovement({
        sectionType,
        currentText,
        resumeContext,
      });

      if (!response.body) {
        handleError('No response body received from AI service.');
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let gotFirstToken = false;

      setUiState('streaming');

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE events (separated by \n\n)
        const events = parseSSEChunk(buffer);

        // Keep any incomplete trailing chunk in the buffer
        const lastDoubleNewline = buffer.lastIndexOf('\n\n');
        if (lastDoubleNewline !== -1) {
          buffer = buffer.slice(lastDoubleNewline + 2);
        }

        for (const event of events) {
          if (event.isDone) {
            reader.cancel();
            return;
          }
          if (event.error) {
            reader.cancel();
            handleError(event.error);
            return;
          }
          if (event.token) {
            if (!gotFirstToken) {
              gotFirstToken = true;
              setUiState('streaming');
            }
            setStreamedText((prev) => prev + event.token);
          }
        }
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return; // user dismissed

      const message =
        err?.status === 403
          ? (err?.message ?? 'Monthly AI improvement limit reached. Upgrade your plan.')
          : (err?.message ?? 'Something went wrong. Please try again.');

      handleError(message);
    }
  }, [currentText, sectionType, resumeContext, handleError]);

  const handleAccept = useCallback(() => {
    if (streamedText.trim()) {
      onAccept(streamedText.trim());
    }
    setUiState('idle');
    setStreamedText('');
  }, [streamedText, onAccept]);

  const handleDismiss = useCallback(() => {
    abortRef.current?.abort();
    setUiState('idle');
    setStreamedText('');
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  // ── Idle state ───────────────────────────────────────────────────────────
  if (uiState === 'idle') {
    return (
      <div className="flex justify-end mt-2">
        <button
          type="button"
          onClick={handleStart}
          disabled={!currentText.trim()}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#fff0ed] hover:bg-[#ffe2db] text-[#7a1f1f] border border-[#ddc0bd]/60 rounded-full transition-all group shadow-sm text-[11px] font-bold uppercase tracking-wider cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          title={!currentText.trim() ? 'Add some text first' : 'Improve this section with AI'}
          id={`ai-improve-btn-${sectionType}`}
        >
          <IconMapper
            name="auto_fix"
            className="text-[16px] group-hover:rotate-12 transition-transform"
          />
          <span>{label}</span>
        </button>
      </div>
    );
  }

  // ── Loading state ─────────────────────────────────────────────────────────
  if (uiState === 'loading') {
    return (
      <div className="flex justify-end mt-2">
        <button
          type="button"
          disabled
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#fff0ed] text-[#7a1f1f] border border-[#ddc0bd]/60 rounded-full text-[11px] font-bold uppercase tracking-wider opacity-70"
        >
          <span className="w-3.5 h-3.5 border-2 border-[#7a1f1f]/20 border-t-[#7a1f1f] rounded-full animate-spin shrink-0" />
          <span>Improving...</span>
        </button>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (uiState === 'error') {
    return (
      <div className="mt-3 flex items-start gap-2 rounded-lg px-4 py-3 bg-[#fff0ed] border border-[#ddc0bd]/60">
        <IconMapper
          name="error"
          className="text-[#7a1f1f] text-[18px] shrink-0 mt-0.5"
          style={{ fontVariationSettings: "'FILL' 1" }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-[#2b1611] font-['Hanken_Grotesk']">
            {errorMessage}
          </p>
          <button
            type="button"
            onClick={() => {
              setUiState('idle');
              setErrorMessage('');
            }}
            className="text-[11px] text-[#7a1f1f] underline underline-offset-2 mt-1 cursor-pointer hover:opacity-70"
          >
            Try again
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            setUiState('idle');
            setErrorMessage('');
          }}
          className="text-[#7a1f1f] hover:opacity-70 cursor-pointer shrink-0"
        >
          <IconMapper name="close" className="text-[18px]" />
        </button>
      </div>
    );
  }

  // ── Streaming state ───────────────────────────────────────────────────────
  return (
    <div className="mt-3 rounded-xl border border-[#ddc0bd]/60 bg-[#fffbf9] overflow-hidden shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#fff0ed] border-b border-[#ddc0bd]/40">
        <span className="w-2 h-2 rounded-full bg-[#7a1f1f] animate-pulse shrink-0" />
        <span className="text-[11px] font-bold text-[#7a1f1f] uppercase tracking-wider font-['Hanken_Grotesk']">
          AI Suggestion
        </span>
        <span className="ml-auto text-[10px] text-[#564240] font-['Hanken_Grotesk']">
          Review and accept or dismiss
        </span>
      </div>

      {/* Streamed text preview */}
      <div className="px-4 py-3">
        <div
          className="text-[13px] text-[#2b1611] font-['Hanken_Grotesk'] leading-relaxed whitespace-pre-wrap min-h-[60px]"
          aria-live="polite"
          aria-label="AI improved text preview"
        >
          {streamedText}
          {/* Blinking cursor during streaming */}
          <span className="inline-block w-0.5 h-4 bg-[#7a1f1f] ml-0.5 animate-pulse align-middle" />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#fff0ed]/40 border-t border-[#ddc0bd]/30">
        <button
          type="button"
          onClick={handleAccept}
          disabled={!streamedText.trim()}
          id={`ai-improve-accept-${sectionType}`}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-[#7a1f1f] text-white rounded-lg text-[12px] font-bold font-['Hanken_Grotesk'] shadow-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <IconMapper name="check" className="text-[15px]" />
          Accept
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          id={`ai-improve-dismiss-${sectionType}`}
          className="flex items-center gap-1.5 px-4 py-1.5 text-[#564240] border border-[#ddc0bd] rounded-lg text-[12px] font-semibold font-['Hanken_Grotesk'] hover:bg-[#fff0ed] transition-colors cursor-pointer"
        >
          <IconMapper name="close" className="text-[15px]" />
          Dismiss
        </button>
      </div>
    </div>
  );
}
