'use client';
import { IconMapper } from '@/app/_components/icons/IconMapper';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { analyzeResume, analyzeResumeStream } from '@/app/app/services/ats.service';
import type { ATSAnalyzeResponse } from '@/app/app/services/ats.service';
import { saveAtsAnalysisClient } from '@/app/api/client/ats/history-client';

interface ChecklistStep {
  id: string;
  label: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
}

export default function ProcessingPage() {
  const router = useRouter();
  const initRef = useRef(false);

  const [steps, setSteps] = useState<ChecklistStep[]>([
    { id: 'upload', label: 'Archiving & Uploading Document', status: 'idle' },
    { id: 'parse', label: 'Linearizing & Parsing Text Layout', status: 'idle' },
    { id: 'sections', label: 'Extracting Resume & JD Sections', status: 'idle' },
    { id: 'skills', label: 'Comparing Keyword & Skill Lexicons', status: 'idle' },
    { id: 'score', label: 'Running Scoring Engine Analytics', status: 'idle' },
    { id: 'ai', label: 'Generating AI Advisor Recommendations', status: 'idle' },
  ]);

  const [errorMsg, setErrorMsg] = useState('');
  const currentStepIdxRef = useRef(0);

  const updateStepStatus = (id: string, status: ChecklistStep['status']) => {
    setSteps((prev) => prev.map((step) => (step.id === id ? { ...step, status } : step)));
  };

  const handleSaveAndRedirect = useCallback(
    async (result: ATSAnalyzeResponse, resumeName: string, jdText: string) => {
      // Extract a short job title from the first line of the JD
      const firstJdLine = jdText
        .split('\n')[0]
        .replace(/[#*_-]/g, '')
        .trim();
      const jobTitle =
        firstJdLine.length > 40
          ? firstJdLine.substring(0, 40) + '...'
          : firstJdLine || 'Target Position';

      // ── Save to database ──────────────────────────────────────────────────
      try {
        const dbId = await saveAtsAnalysisClient({
          resumeName,
          jobDescription: jdText,
          jobTitle,
          result,
        });
        router.replace(`/app/ats-workspace/result/${dbId}`);
        return;
      } catch (saveErr) {
        console.warn('DB save failed, falling back to localStorage', saveErr);
      }

      // ── localStorage fallback (offline / auth edge case) ──────────────────
      const analysisId = 'analysis_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem(`jobpatra_ats_result_${analysisId}`, JSON.stringify(result));
      const existingHistory = localStorage.getItem('jobpatra_ats_analyses');
      const historyList = existingHistory ? JSON.parse(existingHistory) : [];
      historyList.push({
        id: analysisId,
        resumeTitle: resumeName,
        jobTitle,
        overallScore: Math.round(result.overall_score),
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('jobpatra_ats_analyses', JSON.stringify(historyList));
      router.replace(`/app/ats-workspace/result/${analysisId}`);
    },
    [router],
  );

  const handleCancel = useCallback(() => {
    router.replace('/app/ats-workspace');
  }, [router]);

  useEffect(() => {
    // Run once (strict mode guard)
    if (initRef.current) return;
    initRef.current = true;

    const resumeText = sessionStorage.getItem('jobpatra_ats_pending_resume_text') || '';
    const resumeBytes = sessionStorage.getItem('jobpatra_ats_pending_resume_bytes') || '';
    const resumeName = sessionStorage.getItem('jobpatra_ats_pending_resume_name');
    const jdText = sessionStorage.getItem('jobpatra_ats_pending_jd_text') || '';

    if ((!resumeText && !resumeBytes) || !jdText) {
      router.replace('/app/ats-workspace');
      return;
    }

    let receivedComplete = false;

    const runFallback = async () => {
      // Update running steps to completed/running for fallback feel
      setSteps((prev) =>
        prev.map((step, idx) => {
          if (idx < 4) return { ...step, status: 'completed' };
          if (idx === 4) return { ...step, status: 'running' };
          return step;
        }),
      );
      currentStepIdxRef.current = 4;

      try {
        const fallbackData = await analyzeResume({
          resumeText: resumeText || undefined,
          resumeFileName: resumeBytes ? resumeName || 'resume.pdf' : undefined,
          resumeFileBytes: resumeBytes || undefined,
          jobDescriptionText: jdText,
        });
        setSteps((prev) => prev.map((step) => ({ ...step, status: 'completed' })));
        handleSaveAndRedirect(fallbackData, resumeName || 'Uploaded Resume', jdText);
      } catch (fallbackErr) {
        setSteps((prev) =>
          prev.map((step, idx) =>
            idx === currentStepIdxRef.current ? { ...step, status: 'failed' } : step,
          ),
        );
        setErrorMsg(
          fallbackErr instanceof Error ? fallbackErr.message : 'Fallback analysis failed',
        );
      }
    };

    const startScan = async () => {
      // 1. Start Uploading
      updateStepStatus('upload', 'running');
      currentStepIdxRef.current = 0;

      try {
        await analyzeResumeStream(
          {
            resumeText: resumeText || undefined,
            resumeFileName: resumeBytes ? resumeName || 'resume.pdf' : undefined,
            resumeFileBytes: resumeBytes || undefined,
            jobDescriptionText: jdText,
          },
          (event) => {
            switch (event.event) {
              case 'pipeline_started':
                updateStepStatus('upload', 'completed');
                updateStepStatus('parse', 'running');
                currentStepIdxRef.current = 1;
                break;
              case 'ats_running':
                updateStepStatus('parse', 'completed');
                updateStepStatus('sections', 'running');
                currentStepIdxRef.current = 2;
                break;
              case 'ats_complete':
                updateStepStatus('sections', 'completed');
                updateStepStatus('skills', 'running');
                currentStepIdxRef.current = 3;
                break;
              case 'ai_started':
                updateStepStatus('skills', 'completed');
                updateStepStatus('score', 'running');
                currentStepIdxRef.current = 4;
                break;
              case 'ai_analyzing_strengths':
              case 'ai_analyzing_weaknesses':
                updateStepStatus('score', 'completed');
                updateStepStatus('ai', 'running');
                currentStepIdxRef.current = 5;
                break;
              case 'ai_generating_suggestions':
                updateStepStatus('ai', 'running');
                break;
              case 'ai_complete':
              case 'ai_unavailable':
                updateStepStatus('ai', 'completed');
                break;
              case 'complete':
                receivedComplete = true;
                handleSaveAndRedirect(
                  event.data as ATSAnalyzeResponse,
                  resumeName || 'Uploaded Resume',
                  jdText,
                );
                break;
              case 'error':
                throw new Error((event.data as { message?: string }).message || 'Stream error');
            }
          },
          async (streamErr) => {
            if (receivedComplete) return;
            console.warn('Stream interrupted, falling back to standard API', streamErr);
            runFallback();
          },
        );
      } catch (err) {
        if (!receivedComplete) {
          console.warn('Stream failed to initiate, falling back to standard API', err);
          runFallback();
        }
      }
    };

    startScan();
  }, [router, handleSaveAndRedirect]);

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8F2E8] p-6 md:p-12 relative flex items-center justify-center min-h-[500px]">
      <div className="max-w-[540px] w-full bg-[#FFF8EE] border border-[#E5D9C8] p-8 md:p-10 shadow-lg rounded-2xl relative">
        {/* Paperclip decorations to feel physical */}
        <div className="absolute top-[-10px] right-12 w-6 h-12 border-2 border-[#ddc0bd] border-t-0 rounded-b-xl opacity-60 z-20"></div>

        {/* Loading Ring */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-[#7a1f1f]/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-[#7a1f1f] animate-spin"></div>
          </div>
          <h2 className="font-['Playfair_Display'] text-[24px] font-bold text-[#2b1611] mb-1">
            Running Audit Pipeline
          </h2>
          <p className="font-['Hanken_Grotesk'] text-[12px] text-[#564240]/70 uppercase tracking-widest">
            JobPatra Evaluation Office
          </p>
        </div>

        {/* Ledger checklist */}
        <div className="space-y-4 border-y border-[#E5D9C8] py-6 mb-8 font-['Hanken_Grotesk']">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {step.status === 'completed' && (
                  <IconMapper
                    name="check_circle"
                    className="text-green-600 text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  />
                )}
                {step.status === 'running' && (
                  <div className="w-[18px] h-[18px] rounded-full border-2 border-[#7a1f1f]/25 border-t-[#7a1f1f] animate-spin shrink-0"></div>
                )}
                {step.status === 'idle' && (
                  <IconMapper
                    name="radio_button_unchecked"
                    className="text-[#564240]/20 text-[18px]"
                  />
                )}
                {step.status === 'failed' && (
                  <IconMapper name="cancel" className="text-red-600 text-[18px]" />
                )}
                <span
                  className={`text-[13px] ${
                    step.status === 'completed'
                      ? 'text-[#2b1611]/50 line-through'
                      : step.status === 'running'
                        ? 'text-[#7a1f1f] font-bold'
                        : 'text-[#2b1611]/80'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {step.status === 'running' && (
                <span className="text-[10px] text-[#7a1f1f] uppercase tracking-wider font-bold animate-pulse">
                  Processing
                </span>
              )}
              {step.status === 'completed' && (
                <span className="text-[10px] text-green-600 uppercase tracking-wider font-bold">
                  Verified
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Action Board */}
        <div className="flex flex-col items-center">
          {errorMsg ? (
            <div className="w-full text-center space-y-4">
              <p className="text-[#ba1a1a] text-[13px] font-['Hanken_Grotesk']">{errorMsg}</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => router.replace('/app/ats-workspace')}
                  className="px-6 py-2 border border-[#ba1a1a] text-[#ba1a1a] hover:bg-[#fff0ed] font-['Hanken_Grotesk'] text-[12px] font-bold uppercase tracking-wider rounded-lg transition-all"
                >
                  Edit Input
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleCancel}
              className="text-[#564240]/60 hover:text-[#7a1f1f] font-['Hanken_Grotesk'] text-[12px] font-bold uppercase tracking-wider hover:underline"
            >
              Cancel Audit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
