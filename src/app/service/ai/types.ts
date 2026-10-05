/**
 * ATS types — TypeScript interfaces matching the Python ATSAnalyzeResponse.
 *
 * These types define the contract between Next.js and the Python AI service.
 * They must stay in sync with `app/schemas/ats.py` on the Python side.
 *
 * Server-side only — never import from client components.
 */

import {
  KeywordMatchType,
  RecommendationPriority,
  ExtractionMode,
} from '@/app/api/model/enums/ats';

export { KeywordMatchType, RecommendationPriority, ExtractionMode };

// ---------------------------------------------------------------------------
// Request types (what we send TO the AI service)
// ---------------------------------------------------------------------------

export interface ATSAnalyzeRequestBody {
  resume: {
    /** Raw resume text. Mutually exclusive with filename+file_bytes. */
    text?: string;
    /** Original filename (e.g. "resume.pdf"). */
    filename?: string;
    /** Base64-encoded file content. */
    file_bytes?: string;
  };
  job_description: {
    /** Raw job description text. */
    text: string;
  };
  stream?: boolean;
}

// ---------------------------------------------------------------------------
// Response types (what we receive FROM the AI service)
// ---------------------------------------------------------------------------

export interface MatchedKeyword {
  keyword: string;
  matchType: KeywordMatchType | `${KeywordMatchType}`;
  similarity: number | null;
  matched_jd_keyword: string | null;
  is_related_concept: boolean;
}

export interface ExperienceSummary {
  total_entries: number;
  total_years: number;
  has_metrics: boolean;
}

export interface EducationSummary {
  highest_degree: string | null;
  certifications: string[];
}

export interface SectionExplanation {
  section: string;
  score: number;
  explanation: string;
}

export interface Recommendation {
  priority: RecommendationPriority | `${RecommendationPriority}`;
  issue: string;
  why: string;
  copy_paste_content: string;
  placement: string;
  ats_impact: string;
}

export interface ATSExplanation {
  strengths: string[];
  weaknesses: string[];
  section_explanations: SectionExplanation[];
  suggestions: string[];
  summary: string;
  recommendations?: Recommendation[];
}

export interface ATSAnalyzeResponse {
  // Scores (all 0–100)
  overall_score: number;
  keyword_score: number;
  experience_score: number;
  skills_score: number;
  education_score: number;
  summary_score: number;
  formatting_score: number;

  // Keyword matching
  matched_keywords: MatchedKeyword[];
  missing_keywords: string[];
  related_keywords: MatchedKeyword[];

  // Skill coverage
  matched_skills: string[];
  missing_skills: string[];
  required_skill_count: number;
  culture_signals: string[];
  extraction_mode: ExtractionMode | `${ExtractionMode}`;
  required_experience_years: number;
  candidate_experience_years: number;
  required_education_level: string;
  candidate_education_level: string;

  // Extracted metadata
  experience_summary: ExperienceSummary;
  education_summary: EducationSummary;

  // Meta
  processing_time_ms: number;
  version: string;

  // AI explanation and advisor fields (version 1.2 schemas)
  ai_status: 'ok' | 'unavailable';
  ai_explanation: ATSExplanation | null;
}
