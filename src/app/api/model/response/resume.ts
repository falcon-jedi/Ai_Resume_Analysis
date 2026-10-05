import type {
  Resume,
  PersonalInfo,
  WorkExperience,
  Education,
  Project,
  Skill,
  Certification,
  Achievement,
  Language,
  Reference,
} from '@prisma/client';

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD LIST ITEM (lightweight — no child records)
// ─────────────────────────────────────────────────────────────────────────────

export interface ResumeListItem {
  id: string;
  title: string;
  templateId: string;
  status: string;
  pdfUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function toResumeListItem(resume: Resume): ResumeListItem {
  return {
    id: resume.id,
    title: resume.title,
    templateId: resume.templateId,
    status: resume.status,
    pdfUrl: resume.pdfUrl,
    createdAt: resume.createdAt,
    updatedAt: resume.updatedAt,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// FULL RESUME DETAIL (includes all child records)
// ─────────────────────────────────────────────────────────────────────────────

export interface ResumeDetail {
  id: string;
  userId: string;
  title: string;
  templateId: string;
  status: string;
  declaration: string | null;
  sectionOrder: string[];
  pdfUrl: string | null;
  s3Key: string | null;
  createdAt: Date;
  updatedAt: Date;
  personalInfo: PersonalInfo | null;
  experiences: WorkExperience[];
  education: Education[];
  projects: Project[];
  skills: Skill[];
  certifications: Certification[];
  achievements: Achievement[];
  languages: Language[];
  references: Reference[];
  isSampleData?: boolean;
}

export type ResumeWithRelations = Resume & {
  personalInfo: PersonalInfo | null;
  experiences: WorkExperience[];
  education: Education[];
  projects: Project[];
  skills: Skill[];
  certifications: Certification[];
  achievements: Achievement[];
  languages: Language[];
  references: Reference[];
  isSampleData?: boolean;
};

export function toResumeDetail(resume: ResumeWithRelations): ResumeDetail {
  return {
    id: resume.id,
    userId: resume.userId,
    title: resume.title,
    templateId: resume.templateId,
    status: resume.status,
    declaration: resume.declaration,
    sectionOrder: resume.sectionOrder,
    pdfUrl: resume.pdfUrl,
    s3Key: resume.s3Key,
    createdAt: resume.createdAt,
    updatedAt: resume.updatedAt,
    personalInfo: resume.personalInfo,
    experiences: resume.experiences,
    education: resume.education,
    projects: resume.projects,
    skills: resume.skills,
    certifications: resume.certifications,
    achievements: resume.achievements,
    languages: resume.languages,
    references: resume.references,
    isSampleData: resume.isSampleData,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PREVIEW & PDF RESPONSES
// ─────────────────────────────────────────────────────────────────────────────

export interface ResumePreviewResponse {
  html: string;
}

export interface ResumePdfResponse {
  pdfUrl: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGINATED LIST RESPONSE
// ─────────────────────────────────────────────────────────────────────────────

export interface PaginatedResumes {
  data: ResumeListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
