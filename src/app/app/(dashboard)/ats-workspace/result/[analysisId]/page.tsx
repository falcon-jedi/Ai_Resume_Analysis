'use client';
import { IconMapper } from '@/app/_components/icons/IconMapper';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { ATSAnalyzeResponse } from '@/app/app/services/ats.service';
import { useAtsResult } from '@/app/app/_hooks/use-ats-history';

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const analysisId = params.analysisId as string;

  // Legacy localStorage IDs always start with 'analysis_'
  const isLegacyId = analysisId?.startsWith('analysis_');

  const { data: dbRecord, isLoading: dbLoading } = useAtsResult(isLegacyId ? '' : analysisId);

  const [result, setResult] = useState<ATSAnalyzeResponse | null>(null);
  const [resumeName, setResumeName] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'ats' | 'suggestions'>('overview');
  const [expandedRecs, setExpandedRecs] = useState<Record<number, boolean>>({});
  const [copiedRecId, setCopiedRecId] = useState<number | null>(null);

  // ── DB result: map ATSAnalysisDetail back to ATSAnalyzeResponse shape ────
  useEffect(() => {
    if (!dbRecord) return;
    // Reconstruct the display shape from stored sub-fields
    const r = {
      overall_score: dbRecord.overallScore,
      keyword_score: dbRecord.keywordScore,
      experience_score: dbRecord.experienceScore,
      skills_score: dbRecord.skillsScore,
      education_score: dbRecord.educationScore,
      summary_score: dbRecord.summaryScore,
      formatting_score: dbRecord.formattingScore,
      matched_keywords: dbRecord.matchedKeywords.map((k) => ({
        keyword: k,
        matchType: 'EXACT',
        similarity: null,
        matched_jd_keyword: null,
        is_related_concept: false,
      })),
      missing_keywords: dbRecord.missingKeywords,
      related_keywords: [],
      matched_skills: dbRecord.matchedSkills,
      missing_skills: dbRecord.missingSkills,
      required_skill_count: 0,
      culture_signals: [],
      extraction_mode: 'hybrid_ai' as const,
      required_experience_years: 0,
      candidate_experience_years: 0,
      required_education_level: '',
      candidate_education_level: '',
      experience_summary: { total_entries: 0, total_years: 0, has_metrics: false },
      education_summary: { highest_degree: null, certifications: [] },
      processing_time_ms: dbRecord.processingTimeMs ?? 0,
      version: dbRecord.version ?? '',
      ai_status: 'ok' as const,
      ai_explanation: dbRecord.aiExplanation as ATSAnalyzeResponse['ai_explanation'],
    } satisfies ATSAnalyzeResponse;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResult(r);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResumeName(dbRecord.resumeName);
  }, [dbRecord]);

  // ── Legacy localStorage fallback ─────────────────────────────────────────
  useEffect(() => {
    if (!isLegacyId || !analysisId) return;

    const savedResult = localStorage.getItem(`jobpatra_ats_result_${analysisId}`);
    if (savedResult) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setResult(JSON.parse(savedResult));
      } catch (err) {
        console.error('Failed to parse saved result', err);
      }
    }

    const savedHistory = localStorage.getItem('jobpatra_ats_analyses');
    if (savedHistory) {
      try {
        const historyList = JSON.parse(savedHistory) as { id: string; resumeTitle: string }[];
        const item = historyList.find((h) => h.id === analysisId);
        if (item) setResumeName(item.resumeTitle);
      } catch (err) {
        console.error('Failed to parse history list', err);
      }
    }
  }, [analysisId, isLegacyId]);

  if (dbLoading && !isLegacyId) {
    return (
      <div className="flex-1 overflow-y-auto bg-[#F8F2E8] p-12 flex flex-col items-center justify-center min-h-[500px]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#7a1f1f]/20 border-t-[#7a1f1f] animate-spin mx-auto"></div>
          <h3 className="font-['Playfair_Display'] text-[20px] font-bold text-[#2b1611]">
            Retrieving Analysis Audit...
          </h3>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex-1 overflow-y-auto bg-[#F8F2E8] p-12 flex flex-col items-center justify-center min-h-[500px]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#7a1f1f]/20 border-t-[#7a1f1f] animate-spin mx-auto"></div>
          <h3 className="font-['Playfair_Display'] text-[20px] font-bold text-[#2b1611]">
            Retrieving Analysis Audit...
          </h3>
        </div>
      </div>
    );
  }

  const scoreColour = (score: number) => {
    if (score >= 80) return 'text-[#1B5E20]';
    if (score >= 60) return 'text-[#795900]';
    return 'text-[#ba1a1a]';
  };

  const overallScore = Math.round(result.overall_score);

  const getScoreRating = (s: number) => {
    if (s >= 80) {
      return {
        label: 'Excellent Match',
        dotColor: '#2d6a4f',
        bgLight: 'bg-[#2d6a4f]/10',
        textColor: 'text-[#2d6a4f]',
        borderColor: 'border-[#2d6a4f]/25',
        barColor: 'bg-[#2d6a4f]',
      };
    }
    if (s >= 60) {
      return {
        label: 'Good Match',
        dotColor: '#795900',
        bgLight: 'bg-[#795900]/10',
        textColor: 'text-[#795900]',
        borderColor: 'border-[#795900]/25',
        barColor: 'bg-[#795900]',
      };
    }
    if (s >= 40) {
      return {
        label: 'Average Match',
        dotColor: '#b45309',
        bgLight: 'bg-[#d97706]/10',
        textColor: 'text-[#b45309]',
        borderColor: 'border-[#b45309]/25',
        barColor: 'bg-[#d97706]',
      };
    }
    return {
      label: 'Needs Improvement',
      dotColor: '#ba1a1a',
      bgLight: 'bg-[#ba1a1a]/10',
      textColor: 'text-[#ba1a1a]',
      borderColor: 'border-[#ba1a1a]/25',
      barColor: 'bg-[#ba1a1a]',
    };
  };

  const scoreRating = getScoreRating(overallScore);

  const subScores = [
    { label: 'Keywords & Lexicon', value: result.keyword_score },
    { label: 'Work Experience', value: result.experience_score },
    { label: 'Skills Alignment', value: result.skills_score },
    { label: 'Education Criteria', value: result.education_score },
    { label: 'Profile Summary', value: result.summary_score },
    { label: 'Document Formatting', value: result.formatting_score },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8F2E8] p-6 md:p-10 relative print:bg-white print:p-0">
      {/* Back to Workspace button */}
      <div className="max-w-6xl mb-6 flex justify-between items-center print:hidden">
        <button
          onClick={() => router.push('/app/ats-workspace')}
          className="flex items-center gap-1.5 font-['Hanken_Grotesk'] text-[12px] font-bold text-[#7a1f1f] uppercase tracking-wider hover:underline"
        >
          <IconMapper name="arrow_back" className="text-[16px]" />
          Back to Workspace
        </button>

        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#ddc0bd] hover:bg-[#fff0ed] font-['Hanken_Grotesk'] text-[11px] font-bold text-[#2b1611] uppercase tracking-wider rounded-lg transition-all"
          >
            <IconMapper name="print" className="text-[16px]" />
            Print Report
          </button>
        </div>
      </div>

      {/* Main Archival Dossier Sheet */}
      <div className="max-w-6xl bg-[#FFF8EE] border border-[#E5D9C8] p-8 md:p-12 shadow-md rounded-2xl relative print:border-none print:shadow-none print:bg-white print:p-0">
        {/* Paper watermarks */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none">
          <IconMapper name="verified" className="text-[360px]" />
        </div>

        {/* Header Board */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-[#5b060c] pb-8 mb-8 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <IconMapper
                name="description"
                className="text-[#5b060c]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              />
              <span className="font-['Hanken_Grotesk'] text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-[#5b060c] uppercase">
                Official Dossier
              </span>
            </div>
            <h1 className="font-['Playfair_Display'] text-[32px] md:text-[38px] leading-tight font-bold text-[#2b1611] mb-1">
              ATS Compatibility Audit
            </h1>
            <p className="font-['Hanken_Grotesk'] text-[13px] text-[#564240] italic">
              Target: {resumeName || 'Parsed Document'}
            </p>
          </div>

          {/* Theme-Harmonized Match Rating Card */}
          <div className="bg-white/80 border border-[#E5D9C8] rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col items-center justify-center min-w-[220px] sm:min-w-[260px] shrink-0 self-stretch md:self-auto backdrop-blur-xs">
            <span className="font-['Hanken_Grotesk'] text-[11px] font-bold text-[#564240] uppercase tracking-[0.12em] mb-1">
              Match Rating
            </span>
            <div className="flex items-baseline gap-1 my-0.5">
              <span className="font-['Playfair_Display'] text-[46px] sm:text-[54px] leading-none font-bold text-[#5b060c]">
                {overallScore}
              </span>
              <span className="font-['Playfair_Display'] text-[24px] sm:text-[28px] font-bold text-[#5b060c]/70">
                %
              </span>
            </div>

            {/* Pill Status Badge */}
            <div
              className={`mt-2 mb-3.5 px-3 py-1 rounded-full font-['Hanken_Grotesk'] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${scoreRating.bgLight} ${scoreRating.textColor} ${scoreRating.borderColor}`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: scoreRating.dotColor }}
              />
              {scoreRating.label}
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-[#E5D9C8]/60 h-2 rounded-full overflow-hidden border border-[#E5D9C8]/40">
              <div
                className={`h-full rounded-full transition-all duration-500 ${scoreRating.barColor}`}
                style={{ width: `${Math.min(100, Math.max(0, overallScore))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-[#E5D9C8] mb-8 overflow-x-auto print:hidden font-['Hanken_Grotesk'] scrollbar-none gap-2">
          {[
            { id: 'overview' as const, label: 'Executive Summary', icon: 'summarize' },
            { id: 'ats' as const, label: 'Lexicon Matching', icon: 'analytics' },
            { id: 'suggestions' as const, label: 'AI Recommendations', icon: 'lightbulb' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 font-bold text-[12px] uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#7a1f1f] text-[#7a1f1f]'
                  : 'border-transparent text-[#564240] hover:text-[#7a1f1f] hover:border-[#ddc0bd]'
              }`}
            >
              <IconMapper name={tab.icon} className="text-[16px]" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Panels */}
        <div className="min-h-[360px] font-['Hanken_Grotesk']">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Sub-scores & Summary */}
                <div className="lg:col-span-7 space-y-6">
                  <div>
                    <h3 className="font-['Playfair_Display'] text-[20px] font-bold text-[#2b1611] mb-3">
                      Executive Summary & Audit Outcomes
                    </h3>
                    {result.ai_explanation?.summary ? (
                      <p className="text-[14px] text-[#2b1611] leading-relaxed italic bg-white/40 p-4 border-l-4 border-[#7a1f1f] rounded-r-lg">
                        &ldquo;{result.ai_explanation.summary}&rdquo;
                      </p>
                    ) : (
                      <p className="text-[14px] text-[#2b1611] leading-relaxed">
                        Deterministic matching scores indicate moderate alignment with core lexicon
                        keywords. Recalibration of experience headers and formatting values is
                        suggested.
                      </p>
                    )}
                  </div>

                  {/* Sub scores panel */}
                  <div className="p-6 bg-white/40 border border-[#E5D9C8] rounded-xl space-y-4">
                    <h4 className="font-bold text-[12px] text-[#564240] uppercase tracking-wider">
                      Criteria Breakdown
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {subScores.map(({ label, value }) => (
                        <div key={label} className="space-y-1">
                          <div className="flex justify-between items-center text-[12px]">
                            <span className="text-[#564240]">{label}</span>
                            <span className={`font-bold ${scoreColour(value)}`}>
                              {Math.round(value)}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-[#e5d9c8] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${value}%`,
                                backgroundColor:
                                  value >= 80 ? '#2d6a2d' : value >= 60 ? '#795900' : '#ba1a1a',
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Strengths & Weaknesses */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Strengths */}
                  {result.ai_explanation?.strengths &&
                    result.ai_explanation.strengths.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-bold text-[11px] text-green-700 uppercase tracking-widest flex items-center gap-1.5">
                          <IconMapper name="check_circle" className="text-[16px]" />
                          Verified Strengths
                        </h4>
                        <div className="space-y-2">
                          {result.ai_explanation.strengths.map((str, idx) => (
                            <div
                              key={idx}
                              className="flex gap-2 text-[13px] text-[#2b1611] leading-relaxed"
                            >
                              <span className="text-green-700 font-bold">•</span>
                              <span>{str}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Weaknesses */}
                  {result.ai_explanation?.weaknesses &&
                    result.ai_explanation.weaknesses.length > 0 && (
                      <div className="space-y-3 border-t border-[#E5D9C8] pt-6">
                        <h4 className="font-bold text-[11px] text-[#795900] uppercase tracking-widest flex items-center gap-1.5">
                          <IconMapper name="info" className="text-[16px]" />
                          Critical Alignment Gaps
                        </h4>
                        <div className="space-y-2">
                          {result.ai_explanation.weaknesses.map((weak, idx) => (
                            <div
                              key={idx}
                              className="flex gap-2 text-[13px] text-[#2b1611] leading-relaxed"
                            >
                              <span className="text-[#795900] font-bold">•</span>
                              <span>{weak}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Meta information */}
              <div className="border-t border-[#E5D9C8]/40 pt-4 flex justify-between text-[11px] text-[#564240]/60">
                <span>
                  Evaluation Time:{' '}
                  {result.processing_time_ms
                    ? (result.processing_time_ms / 1000).toFixed(2) + 's'
                    : 'N/A'}
                </span>
                <span>JobPatra Audit Protocol v{result.version || '1.2'}</span>
              </div>
            </div>
          )}

          {/* ATS Analysis Tab */}
          {activeTab === 'ats' && (
            <div className="space-y-8">
              {/* Lexicon matches */}
              <div>
                <h3 className="font-['Playfair_Display'] text-[18px] font-bold text-[#2b1611] border-b border-[#E5D9C8] pb-2 mb-4">
                  Lexicon Matching Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Matched Keywords */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-[12px] text-green-700 uppercase tracking-wider">
                      Matched Keywords ({result.matched_keywords.length})
                    </h4>
                    <div className="bg-white/40 border border-green-200/40 rounded-xl p-4 max-h-72 overflow-y-auto space-y-2.5 scrollbar-thin">
                      {result.matched_keywords.length === 0 ? (
                        <p className="text-[12px] text-[#564240]/60 italic">
                          No keyword matches identified.
                        </p>
                      ) : (
                        result.matched_keywords.map((kw, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-[13px] border-b border-[#E5D9C8]/20 pb-1.5 last:border-0 last:pb-0"
                          >
                            <span className="text-[#2b1611] flex items-center gap-2">
                              <IconMapper
                                name="check_circle"
                                className="text-[16px] text-green-600"
                              />
                              {kw.keyword}
                            </span>
                            <span className="text-[9px] font-bold text-[#564240] bg-[#e5d9c8]/50 px-1.5 py-0.5 rounded">
                              {kw.matchType}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Missing Keywords */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-[12px] text-[#ba1a1a] uppercase tracking-wider">
                      Missing Target Keywords ({result.missing_keywords.length})
                    </h4>
                    <div className="bg-white/40 border border-red-200/40 rounded-xl p-4 max-h-72 overflow-y-auto space-y-2.5 scrollbar-thin">
                      {result.missing_keywords.length === 0 ? (
                        <p className="text-[12px] text-green-700 italic">
                          Excellent! No missing target keywords.
                        </p>
                      ) : (
                        result.missing_keywords.map((kw, idx) => (
                          <div
                            key={idx}
                            className="flex items-center text-[13px] text-[#ba1a1a] gap-2 border-b border-[#E5D9C8]/20 pb-1.5 last:border-0 last:pb-0"
                          >
                            <IconMapper name="cancel" className="text-[16px]" />
                            <span>{kw}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Coverage */}
              <div className="border-t border-[#E5D9C8] pt-6 space-y-4">
                <h3 className="font-['Playfair_Display'] text-[18px] font-bold text-[#2b1611] mb-2">
                  Skills Coverage Profile
                </h3>

                <div className="space-y-4">
                  {/* Matched Skills */}
                  {result.matched_skills?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-[12px] text-green-700 uppercase tracking-wider">
                        Common Skill Alignments
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.matched_skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-3 py-1 bg-green-50 border border-green-200 text-green-700 rounded-md font-semibold"
                          >
                            ✓ {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Skills */}
                  {result.missing_skills?.length > 0 && (
                    <div className="space-y-2 border-t border-[#E5D9C8]/20 pt-4">
                      <h4 className="font-bold text-[12px] text-[#ba1a1a] uppercase tracking-wider font-semibold">
                        Missing Role Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.missing_skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-3 py-1 bg-red-50/50 border border-red-200/50 text-[#ba1a1a] rounded-md font-semibold"
                          >
                            ✗ {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* AI Suggestions Tab */}
          {activeTab === 'suggestions' && (
            <div className="space-y-6">
              <h3 className="font-['Playfair_Display'] text-[20px] font-bold text-[#2b1611] border-b border-[#E5D9C8] pb-2 mb-4">
                Actionable AI Suggestions
              </h3>

              {result.ai_status === 'unavailable' ? (
                <div className="border border-red-200 bg-red-50/50 rounded-xl p-8 text-center text-red-900 text-[13px] flex flex-col items-center justify-center space-y-3">
                  <IconMapper name="error" className="text-[32px] text-red-600 animate-pulse" />
                  <div className="space-y-1">
                    <p className="font-bold text-[14px]">
                      AI recommendation generation failed. Please retry.
                    </p>
                    <p className="text-red-700/80 max-w-md mx-auto">
                      We encountered an issue generating personalized suggestions for your resume.
                      Please try re-running the analysis.
                    </p>
                  </div>
                </div>
              ) : result.ai_explanation ? (
                (() => {
                  const recs = result.ai_explanation.recommendations;
                  if (recs && recs.length > 0) {
                    return (
                      <div className="grid grid-cols-1 gap-4">
                        {recs.map((rec, idx) => {
                          const isExpanded = !!expandedRecs[idx];
                          const priorityColors =
                            {
                              High: 'bg-red-50 text-red-700 border-red-200',
                              Medium: 'bg-yellow-50 text-yellow-800 border-yellow-200',
                              Low: 'bg-blue-50 text-blue-700 border-blue-200',
                            }[rec.priority] || 'bg-gray-50 text-gray-700 border-gray-200';

                          return (
                            <div
                              key={idx}
                              className="bg-white/70 border border-[#E5D9C8] rounded-xl shadow-sm transition-all duration-300 overflow-hidden"
                            >
                              {/* Card Header (clickable to expand/collapse) */}
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedRecs((prev) => ({ ...prev, [idx]: !prev[idx] }))
                                }
                                className="w-full text-left p-5 flex items-center justify-between gap-4 hover:bg-[#E5D9C8]/10 transition-colors focus:outline-none"
                              >
                                <div className="flex items-center gap-3 shrink-0">
                                  <span
                                    className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${priorityColors}`}
                                  >
                                    {rec.priority} Priority
                                  </span>
                                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-[#7a1f1f]/10 text-[#7a1f1f] border border-[#7a1f1f]/20">
                                    {rec.ats_impact}
                                  </span>
                                </div>
                                <h4 className="flex-1 font-bold text-[14px] text-[#2b1611] line-clamp-1">
                                  {rec.issue}
                                </h4>
                                <IconMapper
                                  name="keyboard_arrow_down"
                                  className={`text-[20px] text-[#564240] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                />
                              </button>

                              {/* Card Content (Expandable Section) */}
                              {isExpanded && (
                                <div className="px-5 pb-6 pt-2 border-t border-[#E5D9C8]/40 space-y-4 bg-white/30">
                                  <div>
                                    <h5 className="text-[12px] font-bold text-[#2b1611]/70 uppercase tracking-wider mb-1">
                                      Why it matters
                                    </h5>
                                    <p className="text-[13px] text-[#564240] leading-relaxed">
                                      {rec.why}
                                    </p>
                                  </div>

                                  <div>
                                    <h5 className="text-[12px] font-bold text-[#2b1611]/70 uppercase tracking-wider mb-1">
                                      Placement Instruction
                                    </h5>
                                    <p className="text-[13px] text-[#564240] leading-relaxed italic">
                                      {rec.placement}
                                    </p>
                                  </div>

                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                      <h5 className="text-[12px] font-bold text-[#2b1611]/70 uppercase tracking-wider">
                                        Copy-paste Ready Content
                                      </h5>
                                      <button
                                        type="button"
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          await navigator.clipboard.writeText(
                                            rec.copy_paste_content,
                                          );
                                          setCopiedRecId(idx);
                                          setTimeout(() => setCopiedRecId(null), 2000);
                                        }}
                                        className="flex items-center gap-1 text-[11px] font-semibold text-[#7a1f1f] hover:text-[#5c1616] transition-colors"
                                      >
                                        <IconMapper
                                          name={
                                            copiedRecId === idx ? 'check_circle' : 'content_copy'
                                          }
                                          className="text-[16px]"
                                        />
                                        {copiedRecId === idx ? 'Copied!' : 'Copy to Clipboard'}
                                      </button>
                                    </div>
                                    <div className="relative">
                                      <pre className="p-4 bg-stone-900 text-stone-100 rounded-lg text-[13px] font-mono whitespace-pre-wrap leading-relaxed border border-stone-800 shadow-inner overflow-x-auto select-all">
                                        {rec.copy_paste_content}
                                      </pre>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  }

                  const suggestions = result.ai_explanation.suggestions;
                  if (suggestions && suggestions.length > 0) {
                    return (
                      <div className="grid grid-cols-1 gap-4">
                        {suggestions.map((suggestion, idx) => (
                          <div
                            key={idx}
                            className="bg-white/40 border border-[#E5D9C8] rounded-xl p-5 shadow-sm flex gap-4 items-start relative overflow-hidden"
                          >
                            <div className="w-8 h-8 rounded-full bg-[#7a1f1f]/10 text-[#7a1f1f] flex items-center justify-center font-bold font-['Playfair_Display'] text-[15px] shrink-0">
                              {idx + 1}
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-bold text-[13px] text-[#2b1611] uppercase tracking-wider">
                                Recommendation #{idx + 1}
                              </h4>
                              <p className="text-[13px] text-[#564240] leading-relaxed whitespace-pre-wrap">
                                {suggestion}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  }

                  return (
                    <div className="border border-dashed border-[#E5D9C8] rounded-xl p-12 text-center text-[#564240]/60 text-[13px] flex flex-col items-center justify-center">
                      <IconMapper name="lightbulb" className="text-[32px] text-[#7a1f1f]/50 mb-2" />
                      <p>
                        No suggestions required. The document has achieved premium compatibilities.
                      </p>
                    </div>
                  );
                })()
              ) : (
                <div className="border border-dashed border-[#E5D9C8] rounded-xl p-12 text-center text-[#564240]/60 text-[13px] flex flex-col items-center justify-center">
                  <IconMapper name="lightbulb" className="text-[32px] text-[#7a1f1f]/50 mb-2" />
                  <p>No suggestions required. The document has achieved premium compatibilities.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
