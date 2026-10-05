'use client';
import { IconMapper } from '@/app/_components/icons/IconMapper';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useResume } from '@/app/app/_hooks/use-resumes';
import { ResumeSourceSelector } from './components/ResumeSourceSelector';
import { JobDescriptionSelector } from './components/JobDescriptionSelector';
import { HistoryPanel } from './components/HistoryPanel';

interface PersonalInfo {
  fullName?: string | null;
  jobTitle?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  summary?: string | null;
}

interface Experience {
  position?: string | null;
  company?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  description?: string | null;
}

interface Education {
  degree?: string | null;
  fieldOfStudy?: string | null;
  institution?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

interface Skill {
  name?: string | null;
}

interface Certification {
  name?: string | null;
  issuer?: string | null;
  date?: string | null;
}

interface Project {
  title?: string | null;
  description?: string | null;
}

interface Language {
  name?: string | null;
}

interface ResumeData {
  title?: string | null;
  personalInfo?: PersonalInfo | null;
  experiences?: Experience[] | null;
  education?: Education[] | null;
  skills?: Skill[] | null;
  certifications?: Certification[] | null;
  projects?: Project[] | null;
  languages?: Language[] | null;
}

// Helper to convert structured ResumeDetail into plain text
function resumeDetailToText(resume: ResumeData): string {
  const lines: string[] = [];

  const pi = resume.personalInfo;
  if (pi) {
    if (pi.fullName) lines.push(pi.fullName);
    if (pi.jobTitle) lines.push(pi.jobTitle);
    if (pi.email) lines.push(pi.email);
    if (pi.phone) lines.push(pi.phone);
    if (pi.location) lines.push(pi.location);
    if (pi.summary) {
      lines.push('', 'Summary', pi.summary);
    }
  }

  if (resume.experiences?.length) {
    lines.push('', 'Experience');
    for (const exp of resume.experiences) {
      lines.push(
        `${exp.position ?? ''} at ${exp.company ?? ''} ${exp.startDate ?? ''} - ${exp.endDate ?? 'Present'}`,
      );
      if (exp.description) lines.push(exp.description);
    }
  }

  if (resume.education?.length) {
    lines.push('', 'Education');
    for (const edu of resume.education) {
      lines.push(
        `${edu.degree ?? ''} ${edu.fieldOfStudy ?? ''} ${edu.institution ?? ''} ${edu.startDate ?? ''} - ${edu.endDate ?? ''}`,
      );
    }
  }

  if (resume.skills?.length) {
    lines.push('', 'Skills');
    lines.push(resume.skills.map((s) => s.name).join('  '));
  }

  if (resume.certifications?.length) {
    lines.push('', 'Certifications');
    for (const cert of resume.certifications) {
      lines.push(`${cert.name ?? ''} ${cert.issuer ?? ''} ${cert.date ?? ''}`.trim());
    }
  }

  if (resume.projects?.length) {
    lines.push('', 'Projects');
    for (const proj of resume.projects) {
      lines.push(proj.title ?? '');
      if (proj.description) lines.push(proj.description);
    }
  }

  if (resume.languages?.length) {
    lines.push('', 'Languages');
    lines.push(resume.languages.map((l) => l.name).join('  '));
  }

  return lines.join('\n').trim();
}

export function AtsAnalyzerClient() {
  const router = useRouter();

  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [resumeFileBytes, setResumeFileBytes] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const [jobDescriptionText, setJobDescriptionText] = useState('');

  const [isResumeValid, setIsResumeValid] = useState(false);
  const [isJdValid, setIsJdValid] = useState(false);

  // Fetch the full resume detail when a resume is selected from library
  const { data: resumeDetail } = useResume(selectedResumeId);

  // Auto-populate resume text when library resume detail loads
  useEffect(() => {
    if (resumeDetail) {
      const text = resumeDetailToText(resumeDetail);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResumeText(text);
      setResumeFileBytes('');
      setResumeFileName(resumeDetail.title || 'JobPatra Resume');
      setIsResumeValid(text.trim().length > 0);
    }
  }, [resumeDetail]);

  const handleStartAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isResumeValid || !isJdValid) return;

    // Save inputs to sessionStorage for the processing page
    sessionStorage.setItem('jobpatra_ats_pending_resume_text', resumeText);
    sessionStorage.setItem('jobpatra_ats_pending_resume_bytes', resumeFileBytes);
    sessionStorage.setItem('jobpatra_ats_pending_resume_name', resumeFileName || 'Uploaded Resume');
    sessionStorage.setItem('jobpatra_ats_pending_jd_text', jobDescriptionText);

    // Navigate to processing page
    router.push('/app/ats-workspace/processing');
  };

  const isFormValid = isResumeValid && isJdValid;

  return (
    <div className="relative w-full">
      {/* Decorative Watermark / Archive stamp */}
      <div className="absolute top-10 right-16 opacity-[0.03] pointer-events-none hidden lg:block">
        <IconMapper name="history_edu" className="text-[140px]" />
      </div>

      <header className="mb-6 sm:mb-8 lg:mb-10 max-w-5xl">
        <h1 className="font-['Playfair_Display'] text-[24px] sm:text-[32px] md:text-[40px] leading-tight font-bold text-[#5b060c] mb-1.5 sm:mb-2">
          ATS Analyzer Workspace
        </h1>
        <p className="font-['Hanken_Grotesk'] text-[13px] sm:text-[15px] md:text-[16px] text-[#564240] leading-relaxed max-w-2xl">
          Evaluate compatibility by comparing your archival resume against modern recruitment
          algorithms and role criteria.
        </p>
      </header>

      {/* Main Guided Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 max-w-6xl">
        {/* Workspace Form: Step 1 & Step 2 */}
        <div className="lg:col-span-8 bg-[#FFF8EE] border border-[#E5D9C8] p-4 sm:p-6 lg:p-8 shadow-xs relative flex flex-col justify-between rounded-xl sm:rounded-2xl">
          <div className="space-y-6 sm:space-y-8">
            {/* Step 1: Choose Resume */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3 border-b border-[#E5D9C8] pb-2">
                <div className="w-6 h-6 rounded-full bg-[#5b060c] text-white flex items-center justify-center font-['Playfair_Display'] text-[12px] font-bold shrink-0">
                  I
                </div>
                <h2 className="font-['Playfair_Display'] text-[16px] sm:text-[18px] font-bold text-[#5b060c]">
                  Choose Target Resume
                </h2>
              </div>
              <ResumeSourceSelector
                selectedResumeId={selectedResumeId}
                setSelectedResumeId={setSelectedResumeId}
                resumeText={resumeText}
                setResumeText={setResumeText}
                resumeFileBytes={resumeFileBytes}
                setResumeFileBytes={setResumeFileBytes}
                resumeFileName={resumeFileName}
                setResumeFileName={setResumeFileName}
                onValidationChange={setIsResumeValid}
              />
            </div>

            {/* Step 2: Provide Job Description */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3 border-b border-[#E5D9C8] pb-2">
                <div className="w-6 h-6 rounded-full bg-[#5b060c] text-white flex items-center justify-center font-['Playfair_Display'] text-[12px] font-bold shrink-0">
                  II
                </div>
                <h2 className="font-['Playfair_Display'] text-[16px] sm:text-[18px] font-bold text-[#5b060c]">
                  Target Job Description
                </h2>
              </div>
              <JobDescriptionSelector
                jobDescriptionText={jobDescriptionText}
                setJobDescriptionText={setJobDescriptionText}
                onValidationChange={setIsJdValid}
              />
            </div>
          </div>

          {/* Action button */}
          <div className="mt-6 sm:mt-8 border-t border-[#E5D9C8] pt-4 sm:pt-6 flex justify-end">
            <button
              onClick={handleStartAnalysis}
              disabled={!isFormValid}
              style={
                isFormValid
                  ? {
                      background: 'linear-gradient(135deg, #5b060c, #3a0307)',
                      border: '1px solid #7a1f1f',
                      boxShadow: '0 4px 12px rgba(91, 6, 12, 0.15)',
                    }
                  : {}
              }
              className={`w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-['Hanken_Grotesk'] text-[12px] sm:text-[13px] font-bold uppercase tracking-wider text-white transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                isFormValid
                  ? 'hover:scale-[1.02] active:scale-95 text-white'
                  : 'bg-[#ddc0bd] border border-[#ddc0bd]/60 text-[#564240]/40 cursor-not-allowed'
              }`}
            >
              <IconMapper name="analytics" className="text-[18px]" />
              Initiate Compatibility Scan
            </button>
          </div>
        </div>

        {/* Sidebar History Panel */}
        <div className="lg:col-span-4 h-full">
          <HistoryPanel />
        </div>
      </div>
    </div>
  );
}
