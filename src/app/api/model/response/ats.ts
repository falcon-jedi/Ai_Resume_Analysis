import type { ATSAnalyzeResponse } from '@/app/service/ai/types';

// ─────────────────────────────────────────────────────────────────────────────
// ATS ANALYSIS HISTORY MODELS
// ─────────────────────────────────────────────────────────────────────────────

export interface ATSAnalysisSummary {
  id: string;
  resumeName: string;
  jobTitle: string | null;
  overallScore: number;
  analysisDate: Date | string;
}

export interface PaginatedATSHistory {
  items: ATSAnalysisSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ATSAnalysisDetail {
  id: string;
  userId: string;
  resumeId: string | null;
  resumeName: string;
  jobTitle: string | null;
  jobDescription: string;
  overallScore: number;
  keywordScore: number;
  experienceScore: number;
  skillsScore: number;
  educationScore: number;
  summaryScore: number;
  formattingScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  matchedSkills: string[];
  missingSkills: string[];
  aiExplanation: unknown;
  processingTimeMs: number | null;
  version: string | null;
  analysisDate: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ATS API RESPONSES
// ─────────────────────────────────────────────────────────────────────────────

export interface ATSAnalyzeApiResponse {
  success: boolean;
  data: ATSAnalyzeResponse;
  requestId: string;
}

export interface ExtractJdApiResponse {
  success: boolean;
  text: string;
  source: 'httpx' | 'playwright';
  charCount: number;
  requestId: string;
}
