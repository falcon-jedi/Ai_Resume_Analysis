import type { SkillCategory, LanguageProficiency } from '@/app/api/model/enums/resume';

export interface Template {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  previewImage: string;
  atsFriendly: boolean;
  isPremium: boolean;
  usageCount: number;
  sections: string[];
  hasPhoto?: boolean;
}

export interface TemplatesResponse {
  categories: string[];
  templates: Template[];
}

export interface TemplateMetadata extends Partial<Template> {
  id: string;
  name: string;
  category: string;
  version: string;
  thumbnail: string;
  engine: string;
  ats: boolean;
  sections: string[];
  hasPhoto?: boolean;
  slug?: string;
  description?: string;
  previewImage?: string;
  atsFriendly?: boolean;
  isPremium?: boolean;
  usageCount?: number;
}

export interface TemplateInfo extends TemplateMetadata {
  /** S3 key for the Handlebars template, e.g. "templates/classic-demo/template.hbs" */
  hbsKey: string;
  /** S3 key for the CSS file, e.g. "templates/classic-demo/style.css" */
  cssKey: string;
  /** S3 key for the thumbnail image, e.g. "templates/classic-demo/template.png" */
  thumbnailKey: string;
  /** Local FS paths — used as fallback in dev when S3 is unavailable */
  hbsPath: string;
  cssPath: string;
  thumbnailPath: string;
}

export interface TemplateData {
  metadata: { title: string };
  personal: {
    name: string;
    photoUrl?: string | null;
    jobTitle?: string | null;
    email: string;
    phone?: string | null;
    location?: string | null;
    website?: string | null;
    linkedin?: string | null;
    github?: string | null;
  };
  summary?: string | null;
  education: {
    degree: string;
    institution: string;
    startDate: string;
    endDate?: string | null;
    result?: string | null;
  }[];
  experience: {
    position: string;
    company: string;
    location?: string | null;
    startDate: string;
    endDate?: string | null;
    currentlyWorking: boolean;
    description?: string | null;
    highlights: string[];
  }[];
  projects: {
    title: string;
    field?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    description?: string | null;
    technologies: string[];
    link?: string | null;
  }[];
  skills: string[];
  skillsList?: {
    name: string;
    category?: SkillCategory | string | null;
  }[];
  certifications: {
    name: string;
    issuer?: string | null;
    date?: string | null;
    url?: string | null;
  }[];
  achievements: { title: string; date?: string | null; description?: string | null }[];
  languages: string[];
  languagesList?: {
    name: string;
    proficiency?: LanguageProficiency | string | null;
  }[];
  references: {
    name: string;
    designation?: string | null;
    company?: string | null;
    email?: string | null;
    phone?: string | null;
  }[];
  declaration?: string | null;
}
