import { z } from 'zod';
import { ResumeStatus, SkillCategory, LanguageProficiency } from '@/app/api/model/enums/resume';

// ─────────────────────────────────────────────────────────────────────────────
// SECTION SCHEMAS
// Used both as standalone validators and composed into updateResumeSchema
// ─────────────────────────────────────────────────────────────────────────────

export const personalInfoSchema = z.object({
  fullName: z.string().max(100).optional().default(''),
  photoUrl: z.string().optional().or(z.literal('')),
  jobTitle: z.string().max(100).optional(),
  email: z.string().max(200).optional().default(''),
  phone: z.string().max(30).optional(),
  location: z.string().max(150).optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  linkedin: z.string().max(200).optional(),
  github: z.string().max(200).optional(),
  summary: z.string().max(2000).optional(),
});

export type PersonalInfoDTO = z.infer<typeof personalInfoSchema>;

// ─────────────────────────────────────────────────────────────────────────────

export const experienceEntrySchema = z.object({
  company: z.string().min(1, 'Company is required').max(150),
  position: z.string().min(1, 'Position is required').max(150),
  location: z.string().max(150).optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  currentlyWorking: z.boolean().default(false),
  description: z.string().max(3000).optional(),
  highlights: z.array(z.string().max(500)).default([]),
  order: z.number().int().min(0).default(0),
});

export type ExperienceEntryDTO = z.infer<typeof experienceEntrySchema>;

// ─────────────────────────────────────────────────────────────────────────────

export const educationEntrySchema = z.object({
  institution: z.string().min(1, 'Institution is required').max(200),
  degree: z.string().min(1, 'Degree is required').max(200),
  fieldOfStudy: z.string().max(200).optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  result: z.string().max(50).optional(),
  order: z.number().int().min(0).default(0),
});

export type EducationEntryDTO = z.infer<typeof educationEntrySchema>;

// ─────────────────────────────────────────────────────────────────────────────

export const projectEntrySchema = z.object({
  title: z.string().min(1, 'Project title is required').max(200),
  field: z.string().max(100).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().max(3000).optional(),
  technologies: z.array(z.string().max(50)).default([]),
  link: z.string().url('Invalid URL').optional().or(z.literal('')),
  order: z.number().int().min(0).default(0),
});

export type ProjectEntryDTO = z.infer<typeof projectEntrySchema>;

// ─────────────────────────────────────────────────────────────────────────────

export const skillEntrySchema = z.object({
  name: z.string().min(1, 'Skill name is required').max(100),
  category: z.nativeEnum(SkillCategory).default(SkillCategory.TECHNICAL),
  order: z.number().int().min(0).default(0),
});

export type SkillEntryDTO = z.infer<typeof skillEntrySchema>;

// ─────────────────────────────────────────────────────────────────────────────

export const certificationEntrySchema = z.object({
  name: z.string().min(1, 'Certification name is required').max(200),
  issuer: z.string().max(200).optional(),
  date: z.string().optional(),
  url: z.string().url('Invalid URL').optional().or(z.literal('')),
  order: z.number().int().min(0).default(0),
});

export type CertificationEntryDTO = z.infer<typeof certificationEntrySchema>;

// ─────────────────────────────────────────────────────────────────────────────

export const achievementEntrySchema = z.object({
  title: z.string().min(1, 'Achievement title is required').max(200),
  date: z.string().optional(),
  description: z.string().max(1000).optional(),
  order: z.number().int().min(0).default(0),
});

export type AchievementEntryDTO = z.infer<typeof achievementEntrySchema>;

// ─────────────────────────────────────────────────────────────────────────────

export const languageEntrySchema = z.object({
  name: z.string().min(1, 'Language name is required').max(100),
  proficiency: z.nativeEnum(LanguageProficiency).optional().nullable(),
  order: z.number().int().min(0).default(0),
});

export type LanguageEntryDTO = z.infer<typeof languageEntrySchema>;

// ─────────────────────────────────────────────────────────────────────────────

export const referenceEntrySchema = z.object({
  name: z.string().min(1, 'Reference name is required').max(150),
  designation: z.string().max(150).optional(),
  company: z.string().max(150).optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().max(30).optional(),
  order: z.number().int().min(0).default(0),
});

export type ReferenceEntryDTO = z.infer<typeof referenceEntrySchema>;

// ─────────────────────────────────────────────────────────────────────────────
// TOP-LEVEL RESUME SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const createResumeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  templateId: z.string().default('classic-demo'),
});

export type CreateResumeDTO = z.infer<typeof createResumeSchema>;

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Master PATCH schema — every field is optional.
 * Only keys present in the payload are processed.
 * All section updates are transactional inside resume.service.updateResume().
 */
export const updateResumeSchema = z.object({
  // Metadata
  title: z.string().min(1).max(200).optional(),
  templateId: z.string().optional(),
  status: z.nativeEnum(ResumeStatus).optional(),
  declaration: z.string().max(2000).optional().nullable(),
  sectionOrder: z.array(z.string()).optional(),

  // Sections — full replacement per section when present
  personalInfo: personalInfoSchema.optional(),
  experiences: z.array(experienceEntrySchema).optional(),
  education: z.array(educationEntrySchema).optional(),
  projects: z.array(projectEntrySchema).optional(),
  skills: z.array(skillEntrySchema).optional(),
  certifications: z.array(certificationEntrySchema).optional(),
  achievements: z.array(achievementEntrySchema).optional(),
  languages: z.array(languageEntrySchema).optional(),
  references: z.array(referenceEntrySchema).optional(),
});

export type UpdateResumeDTO = z.infer<typeof updateResumeSchema>;

// ─────────────────────────────────────────────────────────────────────────────

export const listResumesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.nativeEnum(ResumeStatus).optional(),
});

export type ListResumesQueryDTO = z.infer<typeof listResumesQuerySchema>;
