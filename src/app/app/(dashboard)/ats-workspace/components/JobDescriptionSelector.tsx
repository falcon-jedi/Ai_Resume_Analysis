'use client';
import { IconMapper } from '@/app/_components/icons/IconMapper';

import { useState } from 'react';
import { extractJdFromUrlClient } from '@/app/api/client/ats/ats-client';

interface JobDescriptionSelectorProps {
  jobDescriptionText: string;
  setJobDescriptionText: (text: string) => void;
  onValidationChange: (isValid: boolean) => void;
}

export function JobDescriptionSelector({
  jobDescriptionText,
  setJobDescriptionText,
  onValidationChange,
}: JobDescriptionSelectorProps) {
  const [tab, setTab] = useState<'paste' | 'url'>('paste');
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ source?: 'httpx' | 'playwright'; charCount?: number } | null>(
    null,
  );

  const handleTabChange = (newTab: 'paste' | 'url') => {
    setTab(newTab);
    // Reset validations and text on mode change
    setJobDescriptionText('');
    setUrlInput('');
    setError(null);
    setMeta(null);
    onValidationChange(false);
  };

  const handleTextChange = (text: string) => {
    setJobDescriptionText(text);
    onValidationChange(text.trim().length > 0);
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || loading) return;

    setLoading(true);
    setError(null);
    setMeta(null);

    try {
      const data = await extractJdFromUrlClient(urlInput.trim());

      setJobDescriptionText(data.text);
      setMeta({ source: data.source, charCount: data.charCount });
      onValidationChange(true);
    } catch (err: any) {
      console.error('[JobDescriptionSelector] URL Extraction failed:', err);
      setError(err.message || 'Could not extract job description. Site may be protected or down.');
      setJobDescriptionText('');
      onValidationChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Segmented Tab Controls */}
      <div className="flex border border-[#ddc0bd] rounded-lg p-1 bg-[#fff8ee]/60">
        <button
          type="button"
          onClick={() => handleTabChange('paste')}
          className={`flex-1 py-2 font-['Hanken_Grotesk'] text-[12px] font-bold uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            tab === 'paste'
              ? 'bg-[#5b060c] text-white shadow-xs'
              : 'text-[#564240] hover:bg-[#fff0ed]'
          }`}
        >
          <IconMapper name="edit_note" className="text-[16px]" />
          Paste Text
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('url')}
          className={`flex-1 py-2 font-['Hanken_Grotesk'] text-[12px] font-bold uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            tab === 'url'
              ? 'bg-[#5b060c] text-white shadow-xs'
              : 'text-[#564240] hover:bg-[#fff0ed]'
          }`}
        >
          <IconMapper name="link" className="text-[16px]" />
          Job URL
        </button>
      </div>

      {/* View Panel */}
      <div className="min-h-[220px]">
        {tab === 'paste' && (
          <div className="relative">
            <textarea
              value={jobDescriptionText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Paste the target job description details here..."
              rows={8}
              className="w-full p-4 bg-white/60 border border-[#ddc0bd] rounded-xl font-['Hanken_Grotesk'] text-[13px] text-[#2b1611] focus:outline-none focus:border-[#5b060c] focus:ring-1 focus:ring-[#5b060c] placeholder-[#564240]/40 resize-none h-[220px]"
            />
            <div className="absolute bottom-3 right-3 text-[11px] text-[#564240]/50 font-['Hanken_Grotesk']">
              {jobDescriptionText.length} characters
            </div>
          </div>
        )}

        {tab === 'url' && (
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="job-url"
                className="block font-['Hanken_Grotesk'] text-[11px] font-bold text-[#564240]/60 uppercase tracking-wider"
              >
                Target Job Posting URL
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="url"
                  id="job-url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://careers.company.com/jobs/senior-software-engineer"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-white/60 border border-[#ddc0bd] rounded-xl font-['Hanken_Grotesk'] text-[13px] text-[#2b1611] focus:outline-none focus:border-[#5b060c] disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!urlInput.trim() || loading}
                  className="px-5 py-2.5 bg-[#5b060c] hover:bg-[#7a1f1f] disabled:opacity-50 text-white font-['Hanken_Grotesk'] text-[12px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <IconMapper name="progress_activity" className="text-[16px] animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    <>
                      <IconMapper name="download" className="text-[16px]" />
                      Fetch
                    </>
                  )}
                </button>
              </div>
            </div>

            {loading && (
              <div className="p-4 bg-[#fff8ee] border border-[#ddc0bd] rounded-xl flex items-center gap-3 text-[#7a1f1f]">
                <IconMapper name="progress_activity" className="text-[24px] animate-spin" />
                <div className="space-y-0.5">
                  <p className="font-['Hanken_Grotesk'] text-[13px] font-bold">
                    Extracting Job Description...
                  </p>
                  <p className="font-['Hanken_Grotesk'] text-[11px] text-[#564240]">
                    JavaScript-heavy sites like LinkedIn or Indeed may take 8–15 seconds to render.
                  </p>
                </div>
              </div>
            )}

            {error && !loading && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3">
                <div className="flex items-start gap-2 text-red-800">
                  <IconMapper name="error" className="text-[18px] text-red-600 mt-0.5" />
                  <div className="flex-1 text-[12px] font-['Hanken_Grotesk'] leading-relaxed">
                    <p className="font-bold text-red-900">Extraction Failed</p>
                    <p>{error}</p>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setTab('paste');
                    }}
                    className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-['Hanken_Grotesk'] text-[11px] font-bold uppercase tracking-wider rounded-md transition-all flex items-center gap-1"
                  >
                    <IconMapper name="edit_note" className="text-[14px]" />
                    Paste Manually
                  </button>
                </div>
              </div>
            )}

            {jobDescriptionText && !loading && (
              <div className="p-4 bg-[#fff0ed]/40 border border-[#ddc0bd]/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-['Hanken_Grotesk'] text-[12px] font-bold text-[#7a1f1f] flex items-center gap-1.5">
                      <IconMapper name="task_alt" className="text-[16px]" />
                      Successfully Extracted
                    </span>
                    {meta?.source && (
                      <span className="px-2 py-0.5 bg-[#7a1f1f]/10 text-[#7a1f1f] text-[10px] font-bold rounded-full uppercase tracking-wider font-['Hanken_Grotesk']">
                        {meta.source === 'playwright' ? 'Headless Browser' : 'Static Scraper'}
                      </span>
                    )}
                    {meta?.charCount && (
                      <span className="text-[11px] text-[#564240]/60 font-['Hanken_Grotesk']">
                        • {meta.charCount} chars
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setJobDescriptionText('');
                      setUrlInput('');
                      setMeta(null);
                      setError(null);
                      onValidationChange(false);
                    }}
                    className="text-[#ba1a1a] font-['Hanken_Grotesk'] text-[11px] font-bold uppercase tracking-wider hover:underline"
                  >
                    Clear
                  </button>
                </div>
                <div className="font-['Hanken_Grotesk'] text-[12px] text-[#564240] leading-relaxed max-h-28 overflow-y-auto whitespace-pre-wrap">
                  {jobDescriptionText}
                </div>
              </div>
            )}

            {!jobDescriptionText && !loading && !error && (
              <div className="border border-dashed border-[#ddc0bd] rounded-xl p-8 text-center text-[#564240]/60 font-['Hanken_Grotesk'] text-[12px] flex flex-col items-center justify-center min-h-[140px]">
                <IconMapper name="link" className="text-[#7a1f1f] text-[28px] mb-2 opacity-65" />
                Enter a job posting URL and click Fetch to automatically extract the job
                requirements.
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
