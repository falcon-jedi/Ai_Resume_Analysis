import Handlebars from 'handlebars';
import { SkillCategory, LanguageProficiency } from '@/app/api/model/enums/resume';
import type { ResumeWithRelations } from '@/app/api/model/response/resume';
import type { TemplateData } from '@/app/api/model/response/template';
import { getResume } from './resume.service';
import { getTemplate, getTemplateContent } from './template.service';

export { SkillCategory, LanguageProficiency };
export type { TemplateData };

// ─────────────────────────────────────────────────────────────────────────────
// ASSEMBLER — maps Prisma relations → HBS template object
// ─────────────────────────────────────────────────────────────────────────────

export function assembleTemplateData(resume: ResumeWithRelations): TemplateData {
  const p = resume.personalInfo;

  return {
    metadata: { title: resume.title },

    personal: {
      name: p?.fullName ?? '',
      photoUrl: p?.photoUrl,
      jobTitle: p?.jobTitle,
      email: p?.email ?? '',
      phone: p?.phone,
      location: p?.location,
      website: p?.website,
      linkedin: p?.linkedin,
      github: p?.github,
    },

    summary: p?.summary,

    education: resume.education.map((e) => ({
      degree: e.degree,
      institution: e.institution,
      startDate: e.startDate,
      endDate: e.endDate,
      result: e.result,
    })),

    experience: resume.experiences.map((e) => ({
      position: e.position,
      company: e.company,
      location: e.location,
      startDate: e.startDate,
      endDate: e.currentlyWorking ? undefined : e.endDate,
      currentlyWorking: e.currentlyWorking,
      description: e.description,
      highlights: e.highlights,
    })),

    projects: resume.projects.map((p) => ({
      title: p.title,
      field: p.field,
      startDate: p.startDate,
      endDate: p.endDate,
      description: p.description,
      technologies: p.technologies,
      link: p.link,
    })),

    // Templates use {{#each skills}} {{this}} — flat string array
    skills: resume.skills.map((s) => s.name),
    skillsList: resume.skills.map((s) => ({
      name: s.name,
      category: s.category,
    })),

    certifications: resume.certifications.map((c) => ({
      name: c.name,
      issuer: c.issuer,
      date: c.date,
      url: c.url,
    })),

    achievements: resume.achievements.map((a) => ({
      title: a.title,
      date: a.date,
      description: a.description,
    })),

    // Templates use {{#each languages}} {{this}} — flat string array
    languages: resume.languages.map((l) =>
      l.proficiency ? `${l.name} (${l.proficiency})` : l.name,
    ),
    languagesList: resume.languages.map((l) => ({
      name: l.name,
      proficiency: l.proficiency,
    })),

    references: resume.references.map((r) => ({
      name: r.name,
      designation: r.designation,
      company: r.company,
      email: r.email,
      phone: r.phone,
    })),

    declaration: resume.declaration,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// RENDER — compiles HBS template with assembled data, inlines CSS
// ─────────────────────────────────────────────────────────────────────────────

export async function renderResumeHtml(resumeId: string, userId: string): Promise<string> {
  const resume = await getResume(resumeId, userId);
  const template = getTemplate(resume.templateId);

  const hbsSource = await getTemplateContent(template.hbsKey, template.hbsPath);
  const cssSource = await getTemplateContent(template.cssKey, template.cssPath).catch(() => '');

  // Inject CSS inline so PDF generation works without external file references
  const hbsWithInlineCss = hbsSource.replace(
    /<link[^>]+rel=["']stylesheet["'][^>]*\/?>/gi,
    `<style>${cssSource}</style>`,
  );

  const compiledTemplate = Handlebars.compile(hbsWithInlineCss);
  const data = assembleTemplateData(resume);

  return compiledTemplate(data);
}
