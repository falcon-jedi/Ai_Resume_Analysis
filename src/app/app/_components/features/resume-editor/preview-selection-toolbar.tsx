'use client';
import { IconMapper } from '@/app/_components/icons/IconMapper';

/**
 * PreviewSelectionToolbar — AI improve for text selected inside the live preview iframe.
 *
 * Flow
 * ----
 * 1. User selects text in the preview iframe.
 * 2. A floating "AI Improve" pill appears at the bottom-right of the screen.
 * 3. Clicking streams an LLM-improved rewrite of the selected text in a docked card.
 * 4. Accept  → automatically updates the matching resume form field (summary, experience, etc.)
 *              and marks form dirty to re-render the preview instantly.
 *    Dismiss → closes the panel with no changes.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { UpdateResumeDTO } from '@/app/api/model/request/resume/resume';
import { streamResumeImprovement, type SectionType } from '@/app/service/ai/resume-improve.service';
import { parseSSEChunk } from '@/app/app/_util/parse-sse';

// ---------------------------------------------------------------------------
// Field matching
// ---------------------------------------------------------------------------

type FieldMatch = { path: string; sectionType: SectionType; label: string };

const norm = (s: string | undefined | null) => (s ?? '').replace(/\s+/g, ' ').trim();

function findFormField(values: UpdateResumeDTO, selectedText: string): FieldMatch | null {
  const needle = norm(selectedText);
  if (!needle) return null;

  if (norm(values.personalInfo?.summary).includes(needle))
    return { path: 'personalInfo.summary', sectionType: 'summary', label: 'Summary' };

  const exps = values.experiences ?? [];
  for (let i = 0; i < exps.length; i++) {
    if (norm(exps[i]?.description).includes(needle)) {
      const title = exps[i]?.position || `Role ${i + 1}`;
      return {
        path: `experiences.${i}.description`,
        sectionType: 'experience',
        label: `Experience (${title})`,
      };
    }
  }

  const projs = values.projects ?? [];
  for (let i = 0; i < projs.length; i++) {
    if (norm(projs[i]?.description).includes(needle)) {
      const title = projs[i]?.title || `Project ${i + 1}`;
      return {
        path: `projects.${i}.description`,
        sectionType: 'projects',
        label: `Project (${title})`,
      };
    }
  }

  const achvs = values.achievements ?? [];
  for (let i = 0; i < achvs.length; i++) {
    if (norm(achvs[i]?.description).includes(needle)) {
      return {
        path: `achievements.${i}.description`,
        sectionType: 'objective',
        label: 'Achievement',
      };
    }
  }

  return null;
}

function getNestedValue(obj: unknown, path: string): string {
  const parts = path.split('.');
  let cur: unknown = obj;
  for (const part of parts) {
    if (cur == null) return '';
    cur = (cur as Record<string, unknown>)[isNaN(Number(part)) ? part : Number(part)];
  }
  return String(cur ?? '');
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type UIState = 'idle' | 'loading' | 'streaming' | 'error';

interface Anchor {
  text: string;
}

export interface PreviewSelectionToolbarProps {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  zoom: number;
  form: UseFormReturn<UpdateResumeDTO>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PreviewSelectionToolbar({ iframeRef, form }: PreviewSelectionToolbarProps) {
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [uiState, setUiState] = useState<UIState>('idle');
  const [streamedText, setStreamedText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [matchedField, setMatchedField] = useState<FieldMatch | null>(null);
  const [accepted, setAccepted] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const uiStateRef = useRef<UIState>('idle');
  useEffect(() => {
    uiStateRef.current = uiState;
  }, [uiState]);

  // ── Reset all state ─────────────────────────────────────────────────────
  const resetAll = useCallback(() => {
    abortRef.current?.abort();
    setAnchor(null);
    setUiState('idle');
    setStreamedText('');
    setErrorMsg('');
    setMatchedField(null);
    setAccepted(false);
  }, []);

  // ── Attach / re-attach listeners every time the iframe reloads ──────────
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let unlisten: (() => void) | undefined;

    function attach() {
      const doc = iframe?.contentDocument;
      if (!doc) return;

      function onMouseUp() {
        if (uiStateRef.current !== 'idle') return;

        setTimeout(() => {
          const sel = doc?.getSelection();
          const text = sel?.toString().trim() ?? '';
          if (text.length < 4) {
            return;
          }

          const match = findFormField(form.getValues(), text);
          setMatchedField(match);
          setAnchor({ text });
          setStreamedText('');
          setUiState('idle');
        }, 0);
      }

      function onMouseDown() {
        if (uiStateRef.current === 'idle') {
          // If clicking into iframe, we can allow creating a new selection
        }
      }

      doc.addEventListener('mouseup', onMouseUp);
      doc.addEventListener('mousedown', onMouseDown);
      unlisten = () => {
        doc.removeEventListener('mouseup', onMouseUp);
        doc.removeEventListener('mousedown', onMouseDown);
      };
    }

    function onIframeLoad() {
      unlisten?.();
      attach();
    }

    iframe.addEventListener('load', onIframeLoad);
    if (iframe.contentDocument?.readyState === 'complete') attach();

    return () => {
      iframe.removeEventListener('load', onIframeLoad);
      unlisten?.();
    };
  }, [iframeRef, form]);

  // ── Kick off AI improvement ─────────────────────────────────────────────
  const handleImprove = useCallback(async () => {
    if (!anchor) return;
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setStreamedText('');
    setUiState('loading');

    try {
      const response = await streamResumeImprovement({
        sectionType: matchedField?.sectionType ?? 'summary',
        currentText: anchor.text,
      });

      if (!response.body) {
        setErrorMsg('No response from the AI service.');
        setUiState('error');
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      setUiState('streaming');

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = parseSSEChunk(buffer);
        const lastDouble = buffer.lastIndexOf('\n\n');
        if (lastDouble !== -1) buffer = buffer.slice(lastDouble + 2);

        for (const ev of events) {
          if (ev.isDone) {
            reader.cancel();
            return;
          }
          if (ev.error) {
            reader.cancel();
            setErrorMsg(ev.error);
            setUiState('error');
            return;
          }
          if (ev.token) setStreamedText((p) => p + ev.token);
        }
      }
    } catch (err: unknown) {
      if ((err as { name?: string })?.name === 'AbortError') return;
      const typed = err as { status?: number; message?: string };
      const msg =
        typed?.status === 403
          ? (typed?.message ?? 'Monthly AI limit reached. Upgrade your plan.')
          : (typed?.message ?? 'Something went wrong. Please try again.');
      setErrorMsg(msg);
      setUiState('error');
    }
  }, [anchor, matchedField]);

  // ── Accept: replace the selected portion in the form field ──────────────
  const handleAccept = useCallback(() => {
    const improved = streamedText.trim();
    if (!improved || !anchor) return;

    if (matchedField) {
      const fullValue = getNestedValue(form.getValues(), matchedField.path);
      const normalised = anchor.text.replace(/\s+/g, ' ');
      const newValue = fullValue.includes(normalised)
        ? fullValue.replace(normalised, improved)
        : improved;
      (form.setValue as (p: string, v: unknown, opts?: object) => void)(
        matchedField.path,
        newValue,
        { shouldDirty: true },
      );
      setAccepted(true);
      setTimeout(resetAll, 1200);
    } else {
      navigator.clipboard.writeText(improved).catch(() => {});
      setAccepted(true);
      setTimeout(resetAll, 1500);
    }
  }, [streamedText, anchor, matchedField, form, resetAll]);

  const handleDismiss = useCallback(() => resetAll(), [resetAll]);

  if (!anchor) return null;

  return (
    <div
      id="preview-selection-toolbar"
      className="fixed bottom-6 right-6 z-50 pointer-events-auto select-none"
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* ── 1. Idle Trigger Pill (Bottom-Right) ── */}
      {uiState === 'idle' && (
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <button
            type="button"
            onClick={handleImprove}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #7a1f1f 0%, #a82a2a 100%)',
              boxShadow: '0 8px 24px rgba(122,31,31,0.35), 0 2px 6px rgba(0,0,0,0.15)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
            title="Improve selected text with AI"
          >
            <IconMapper
              name="auto_fix"
              className="text-[16px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            />
            <span>AI Improve Selection</span>
            {matchedField && (
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-medium tracking-normal normal-case opacity-90">
                {matchedField.label}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={resetAll}
            className="w-8 h-8 rounded-full bg-white/95 hover:bg-white text-[#564240] hover:text-[#7a1f1f] shadow-lg flex items-center justify-center border border-[#ddc0bd]/60 transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="Cancel"
          >
            <IconMapper name="close" className="text-[16px]" />
          </button>
        </div>
      )}

      {/* ── 2. Loading State Pill (Bottom-Right) ── */}
      {uiState === 'loading' && (
        <div
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full text-[12px] font-bold text-white shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150"
          style={{
            background: 'linear-gradient(135deg, #7a1f1f 0%, #a82a2a 100%)',
            boxShadow: '0 8px 24px rgba(122,31,31,0.35)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
          <span>Rewriting with AI…</span>
        </div>
      )}

      {/* ── 3. Streaming / Error Card (Bottom-Right) ── */}
      {(uiState === 'streaming' || uiState === 'error') && (
        <div
          className="w-[410px] max-w-[calc(100vw-3rem)] rounded-2xl overflow-hidden shadow-2xl border border-[#ddc0bd]/50 bg-[#fffbf9] animate-in fade-in slide-in-from-bottom-4 duration-200 flex flex-col"
          style={{
            boxShadow: '0 20px 40px -10px rgba(78,52,46,0.25), 0 0 0 1px rgba(122,31,31,0.08)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-2 px-4 py-3 border-b border-[#ddc0bd]/40"
            style={{ background: '#fff0ed' }}
          >
            <IconMapper
              name="auto_fix"
              className="text-[#7a1f1f] text-[18px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            />
            <span className="text-[12px] font-bold text-[#7a1f1f] uppercase tracking-wider font-['Hanken_Grotesk']">
              AI Improvement
            </span>
            {matchedField && (
              <span className="text-[11px] text-[#7a1f1f]/80 font-medium bg-[#7a1f1f]/10 px-2 py-0.5 rounded-md">
                {matchedField.label}
              </span>
            )}
            <button
              type="button"
              onClick={handleDismiss}
              className="ml-auto text-[#7a1f1f]/60 hover:text-[#7a1f1f] hover:bg-[#7a1f1f]/10 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-colors"
            >
              <IconMapper name="close" className="text-[16px]" />
            </button>
          </div>

          {/* Selected Snippet Context */}
          <div className="px-4 py-2.5 bg-[#fcf5f3] border-b border-[#ddc0bd]/25 text-[11px] text-[#564240] flex items-center gap-2">
            <span className="font-semibold text-[#7a1f1f] shrink-0">Selected:</span>
            <span className="truncate italic">"{anchor.text}"</span>
          </div>

          {/* Content Body */}
          {uiState === 'error' ? (
            <div className="p-4">
              <div className="flex items-start gap-2.5">
                <IconMapper
                  name="error"
                  className="text-[#7a1f1f] text-[20px] shrink-0 mt-0.5"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-[#2b1611] font-['Hanken_Grotesk'] leading-snug">
                    {errorMsg}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setUiState('idle');
                        setErrorMsg('');
                      }}
                      className="text-[12px] font-bold text-[#7a1f1f] underline underline-offset-2 cursor-pointer hover:opacity-80"
                    >
                      Try again
                    </button>
                    <button
                      type="button"
                      onClick={handleDismiss}
                      className="text-[12px] font-semibold text-[#564240] cursor-pointer hover:opacity-80"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Streamed text preview */}
              <div className="px-4 py-3.5 max-h-[200px] overflow-y-auto custom-scrollbar">
                <p
                  className="text-[13px] text-[#2b1611] font-['Hanken_Grotesk'] leading-relaxed whitespace-pre-wrap"
                  aria-live="polite"
                >
                  {streamedText}
                  <span className="inline-block w-0.5 h-3.5 bg-[#7a1f1f] ml-0.5 animate-pulse align-middle" />
                </p>
              </div>

              {/* Action Buttons */}
              <div
                className="flex items-center gap-2.5 px-4 py-3 border-t border-[#ddc0bd]/30"
                style={{ background: '#fff8f6' }}
              >
                <button
                  type="button"
                  onClick={handleAccept}
                  disabled={!streamedText.trim() || accepted}
                  id="preview-ai-improve-accept"
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-bold font-['Hanken_Grotesk'] text-white shadow-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  style={{ background: '#7a1f1f' }}
                >
                  <IconMapper name="check" className="text-[15px]" />
                  {accepted ? 'Applied!' : matchedField ? 'Apply to resume' : 'Copy to clipboard'}
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  id="preview-ai-improve-dismiss"
                  className="px-4 py-2 rounded-lg text-[12px] font-semibold text-[#564240] border border-[#ddc0bd] hover:bg-[#fff0ed] transition-colors cursor-pointer font-['Hanken_Grotesk']"
                >
                  Dismiss
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── 4. Applied Confirmation Toast ── */}
      {accepted && (
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-full text-[12px] font-bold text-white shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200"
          style={{
            background: '#1a7a3f',
            boxShadow: '0 8px 24px rgba(26,122,63,0.35)',
          }}
        >
          <IconMapper
            name="check_circle"
            className="text-[16px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          />
          <span>Applied to resume!</span>
        </div>
      )}
    </div>
  );
}
