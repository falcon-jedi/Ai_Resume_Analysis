import { prisma } from '@/app/_lib/prisma';
import path from 'path';
import fs from 'fs';
import type { Prisma } from '@prisma/client';

import type {
  CreateResumeDTO,
  UpdateResumeDTO,
  PersonalInfoDTO,
  ExperienceEntryDTO,
  EducationEntryDTO,
  ProjectEntryDTO,
  SkillEntryDTO,
  CertificationEntryDTO,
  AchievementEntryDTO,
  LanguageEntryDTO,
  ReferenceEntryDTO,
  ListResumesQueryDTO,
} from '@/app/api/model/request/resume/resume';
import { ResumeStatus } from '@/app/api/model/enums/resume';
import type {
  ResumeWithRelations,
  PaginatedResumes,
  ResumeDetail,
} from '@/app/api/model/response/resume';

export { ResumeStatus };
export type { PaginatedResumes, ResumeDetail };

// ─────────────────────────────────────────────────────────────────────────────
// INCLUDE SHAPE — used for all full-resume queries
// ─────────────────────────────────────────────────────────────────────────────

const FULL_RESUME_INCLUDE = {
  personalInfo: true,
  experiences: { orderBy: { order: 'asc' as const } },
  education: { orderBy: { order: 'asc' as const } },
  projects: { orderBy: { order: 'asc' as const } },
  skills: { orderBy: { order: 'asc' as const } },
  certifications: { orderBy: { order: 'asc' as const } },
  achievements: { orderBy: { order: 'asc' as const } },
  languages: { orderBy: { order: 'asc' as const } },
  references: { orderBy: { order: 'asc' as const } },
} satisfies Prisma.ResumeInclude;

// ─────────────────────────────────────────────────────────────────────────────
// OWNERSHIP GUARD — used in every mutating operation
// ─────────────────────────────────────────────────────────────────────────────

async function verifyOwnership(resumeId: string, userId: string) {
  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, userId, deletedAt: null },
    select: { id: true, userId: true },
  });
  if (!resume) {
    throw new Error('Resume not found');
  }
  return resume;
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE RESUME
// ─────────────────────────────────────────────────────────────────────────────

export async function createResume(userId: string, data: CreateResumeDTO) {
  return prisma.$transaction(async (tx) => {
    return tx.resume.create({
      data: {
        userId,
        title: data.title,
        templateId: data.templateId ?? 'classic-demo',
        // Create empty PersonalInfo shell so the editor always has a record to upsert into
        personalInfo: {
          create: {
            fullName: '',
            email: '',
          },
        },
      },
      include: FULL_RESUME_INCLUDE,
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// GET RESUME (full — all relations)
// ─────────────────────────────────────────────────────────────────────────────

function isResumeEmpty(resume: ResumeWithRelations): boolean {
  return (
    (!resume.personalInfo || (!resume.personalInfo.fullName && !resume.personalInfo.email)) &&
    resume.experiences.length === 0 &&
    resume.education.length === 0 &&
    resume.projects.length === 0 &&
    resume.skills.length === 0 &&
    resume.certifications.length === 0 &&
    resume.achievements.length === 0 &&
    resume.languages.length === 0 &&
    resume.references.length === 0
  );
}

function populateWithSampleData(resume: ResumeWithRelations): ResumeWithRelations {
  const sampleDataPath = path.join(process.cwd(), 'src', 'sample-data', 'resume-sample.json');
  if (!fs.existsSync(sampleDataPath)) {
    return resume;
  }

  try {
    const sample = JSON.parse(fs.readFileSync(sampleDataPath, 'utf-8'));

    // Helper to add mock DB fields
    const withDbFields = <T extends Record<string, unknown>>(item: T, index: number) => ({
      id: `temp-${index}`,
      resumeId: resume.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...item,
      order: (item.order as number | undefined) ?? index,
    });

    const personal = (sample.personal as Record<string, unknown>) || {};
    const personalInfo = {
      id: `temp-pi`,
      resumeId: resume.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      fullName: (personal.name as string) || '',
      photoUrl: (personal.photoUrl as string) || null,
      jobTitle: (personal.jobTitle as string) || '',
      email: (personal.email as string) || '',
      phone: (personal.phone as string) || '',
      location: (personal.location as string) || '',
      website: (personal.website as string) || '',
      linkedin: (personal.linkedin as string) || '',
      github: (personal.github as string) || '',
      summary: (personal.summary as string) || '',
    };

    const experiences = ((sample.experience as Array<Record<string, unknown>>) || []).map(
      (exp, index: number) =>
        withDbFields(
          {
            company: (exp.company as string) || '',
            position: (exp.position as string) || '',
            location: (exp.location as string) || '',
            startDate: (exp.startDate as string) || '',
            endDate: (exp.endDate as string) || '',
            currentlyWorking: Boolean(exp.currentlyWorking),
            description: (exp.description as string) || '',
            highlights: (exp.highlights as string[]) || [],
          },
          index,
        ),
    );

    const education = ((sample.education as Array<Record<string, unknown>>) || []).map(
      (edu, index: number) =>
        withDbFields(
          {
            institution: (edu.institution as string) || '',
            degree: (edu.degree as string) || '',
            fieldOfStudy: (edu.fieldOfStudy as string) || '',
            startDate: (edu.startDate as string) || '',
            endDate: (edu.endDate as string) || '',
            result: (edu.result as string) || '',
          },
          index,
        ),
    );

    const projects = ((sample.projects as Array<Record<string, unknown>>) || []).map(
      (proj, index: number) =>
        withDbFields(
          {
            title: (proj.title as string) || '',
            field: (proj.field as string) || '',
            startDate: (proj.startDate as string) || '',
            endDate: (proj.endDate as string) || '',
            description: (proj.description as string) || '',
            technologies: (proj.technologies as string[]) || [],
            link: (proj.link as string) || '',
          },
          index,
        ),
    );

    const skills = ((sample.skills as Array<Record<string, unknown>>) || []).map(
      (skill, index: number) =>
        withDbFields(
          {
            name: (skill.name as string) || '',
            category: (skill.category as string) || 'TECHNICAL',
          },
          index,
        ),
    );

    const certifications = ((sample.certifications as Array<Record<string, unknown>>) || []).map(
      (cert, index: number) =>
        withDbFields(
          {
            name: (cert.name as string) || '',
            issuer: (cert.issuer as string) || '',
            date: (cert.date as string) || '',
            url: (cert.url as string) || '',
          },
          index,
        ),
    );

    const achievements = ((sample.achievements as Array<Record<string, unknown>>) || []).map(
      (ach, index: number) =>
        withDbFields(
          {
            title: (ach.title as string) || '',
            date: (ach.date as string) || '',
            description: (ach.description as string) || '',
          },
          index,
        ),
    );

    const languages = ((sample.languages as Array<string | Record<string, unknown>>) || []).map(
      (lang, index: number) => {
        if (typeof lang === 'string') {
          return withDbFields(
            {
              name: lang,
              proficiency: null,
            },
            index,
          );
        }
        return withDbFields(
          {
            name: (lang.name as string) || '',
            proficiency: (lang.proficiency as string) || null,
          },
          index,
        );
      },
    );

    const references = ((sample.references as Array<Record<string, unknown>>) || []).map(
      (ref, index: number) =>
        withDbFields(
          {
            name: (ref.name as string) || '',
            designation: (ref.designation as string) || '',
            company: (ref.company as string) || '',
            email: (ref.email as string) || '',
            phone: (ref.phone as string) || '',
          },
          index,
        ),
    );

    return {
      ...resume,
      personalInfo,
      experiences,
      education,
      projects,
      skills,
      certifications,
      achievements,
      languages,
      references,
      declaration: sample.declaration || resume.declaration,
    };
  } catch (err) {
    console.error('Failed to load sample data:', err);
    return resume;
  }
}

export async function getResume(resumeId: string, userId: string): Promise<ResumeWithRelations> {
  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, userId, deletedAt: null },
    include: FULL_RESUME_INCLUDE,
  });
  if (!resume) {
    throw new Error('Resume not found');
  }

  // The career profile must stay genuinely empty until the user enters data.
  // Demo data is useful for a new resume editor, but showing it in the profile
  // would let a later save accidentally persist the demo as profile data.
  if (resume.status !== ResumeStatus.PROFILE && isResumeEmpty(resume)) {
    const populated = populateWithSampleData(resume);
    return {
      ...populated,
      isSampleData: true,
    } as unknown as ResumeWithRelations;
  }

  return resume;
}

// ─────────────────────────────────────────────────────────────────────────────
// LIST RESUMES (paginated, excludes soft-deleted)
// ─────────────────────────────────────────────────────────────────────────────

export async function listResumes(
  userId: string,
  query: ListResumesQueryDTO,
): Promise<PaginatedResumes> {
  const { page, limit, status } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.ResumeWhereInput = {
    userId,
    deletedAt: null,
    // Always exclude the reserved profile resume from dashboard listings
    status: { not: ResumeStatus.PROFILE, ...(status ? { equals: status } : {}) },
  };

  const [resumes, total] = await Promise.all([
    prisma.resume.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        templateId: true,
        status: true,
        pdfUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.resume.count({ where }),
  ]);

  return {
    data: resumes,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE RESUME — single endpoint, transactional, partial updates
// ─────────────────────────────────────────────────────────────────────────────

export async function updateResume(resumeId: string, userId: string, payload: UpdateResumeDTO) {
  await verifyOwnership(resumeId, userId);

  await prisma.$transaction(async (tx) => {
    // 1. Update resume metadata if any top-level fields are present
    const metadataFields = [
      'title',
      'templateId',
      'status',
      'declaration',
      'sectionOrder',
    ] as const;
    const hasMetadata = metadataFields.some((f) => payload[f] !== undefined);

    if (hasMetadata) {
      await tx.resume.update({
        where: { id: resumeId },
        data: {
          ...(payload.title !== undefined && { title: payload.title }),
          ...(payload.templateId !== undefined && { templateId: payload.templateId }),
          ...(payload.status !== undefined && { status: payload.status }),
          ...(payload.declaration !== undefined && { declaration: payload.declaration }),
          ...(payload.sectionOrder !== undefined && { sectionOrder: payload.sectionOrder }),
        },
      });
    }

    // 2. Update sections — only process keys present in the payload
    if (payload.personalInfo !== undefined) {
      await upsertPersonalInfo(tx, resumeId, payload.personalInfo);
    }
    if (payload.experiences !== undefined) {
      await replaceExperiences(tx, resumeId, payload.experiences);
    }
    if (payload.education !== undefined) {
      await replaceEducation(tx, resumeId, payload.education);
    }
    if (payload.projects !== undefined) {
      await replaceProjects(tx, resumeId, payload.projects);
    }
    if (payload.skills !== undefined) {
      await replaceSkills(tx, resumeId, payload.skills);
    }
    if (payload.certifications !== undefined) {
      await replaceCertifications(tx, resumeId, payload.certifications);
    }
    if (payload.achievements !== undefined) {
      await replaceAchievements(tx, resumeId, payload.achievements);
    }
    if (payload.languages !== undefined) {
      await replaceLanguages(tx, resumeId, payload.languages);
    }
    if (payload.references !== undefined) {
      await replaceReferences(tx, resumeId, payload.references);
    }
  });

  // Return the updated resume with all relations
  return getResume(resumeId, userId);
}

// ─────────────────────────────────────────────────────────────────────────────
// DUPLICATE RESUME
// ─────────────────────────────────────────────────────────────────────────────

export async function duplicateResume(resumeId: string, userId: string) {
  const source = await getResume(resumeId, userId);

  return prisma.$transaction(async (tx) => {
    const copy = await tx.resume.create({
      data: {
        userId,
        title: `Copy of ${source.title}`,
        templateId: source.templateId,
        status: ResumeStatus.DRAFT,
        declaration: source.declaration,

        sectionOrder: source.sectionOrder,
      },
    });

    const newId = copy.id;

    // Deep-copy all child records
    if (source.personalInfo) {
      const rest = { ...source.personalInfo } as Record<string, unknown>;
      delete rest.id;
      delete rest.resumeId;
      await tx.personalInfo.create({
        data: { ...rest, resumeId: newId } as Prisma.PersonalInfoUncheckedCreateInput,
      });
    }

    if (source.experiences.length) {
      await tx.workExperience.createMany({
        data: source.experiences.map((item) => {
          const rest = { ...item } as Record<string, unknown>;
          delete rest.id;
          delete rest.resumeId;
          return { ...rest, resumeId: newId } as Prisma.WorkExperienceUncheckedCreateInput;
        }),
      });
    }

    if (source.education.length) {
      await tx.education.createMany({
        data: source.education.map((item) => {
          const rest = { ...item } as Record<string, unknown>;
          delete rest.id;
          delete rest.resumeId;
          return { ...rest, resumeId: newId } as Prisma.EducationUncheckedCreateInput;
        }),
      });
    }

    if (source.projects.length) {
      await tx.project.createMany({
        data: source.projects.map((item) => {
          const rest = { ...item } as Record<string, unknown>;
          delete rest.id;
          delete rest.resumeId;
          return { ...rest, resumeId: newId } as Prisma.ProjectUncheckedCreateInput;
        }),
      });
    }

    if (source.skills.length) {
      await tx.skill.createMany({
        data: source.skills.map((item) => {
          const rest = { ...item } as Record<string, unknown>;
          delete rest.id;
          delete rest.resumeId;
          return { ...rest, resumeId: newId } as Prisma.SkillUncheckedCreateInput;
        }),
      });
    }

    if (source.certifications.length) {
      await tx.certification.createMany({
        data: source.certifications.map((item) => {
          const rest = { ...item } as Record<string, unknown>;
          delete rest.id;
          delete rest.resumeId;
          return { ...rest, resumeId: newId } as Prisma.CertificationUncheckedCreateInput;
        }),
      });
    }

    if (source.achievements.length) {
      await tx.achievement.createMany({
        data: source.achievements.map((item) => {
          const rest = { ...item } as Record<string, unknown>;
          delete rest.id;
          delete rest.resumeId;
          return { ...rest, resumeId: newId } as Prisma.AchievementUncheckedCreateInput;
        }),
      });
    }

    if (source.languages.length) {
      await tx.language.createMany({
        data: source.languages.map((item) => {
          const rest = { ...item } as Record<string, unknown>;
          delete rest.id;
          delete rest.resumeId;
          return { ...rest, resumeId: newId } as Prisma.LanguageUncheckedCreateInput;
        }),
      });
    }

    if (source.references.length) {
      await tx.reference.createMany({
        data: source.references.map((item) => {
          const rest = { ...item } as Record<string, unknown>;
          delete rest.id;
          delete rest.resumeId;
          return { ...rest, resumeId: newId } as Prisma.ReferenceUncheckedCreateInput;
        }),
      });
    }

    return tx.resume.findUniqueOrThrow({ where: { id: newId }, include: FULL_RESUME_INCLUDE });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE RESUME (soft delete)
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteResume(resumeId: string, userId: string) {
  await verifyOwnership(resumeId, userId);
  await prisma.resume.update({
    where: { id: resumeId },
    data: { deletedAt: new Date() },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PRIVATE SECTION HELPERS
// All accept the Prisma transaction client as first argument.
// ─────────────────────────────────────────────────────────────────────────────

type Tx = Prisma.TransactionClient;

async function upsertPersonalInfo(tx: Tx, resumeId: string, data: PersonalInfoDTO) {
  await tx.personalInfo.upsert({
    where: { resumeId },
    create: { resumeId, ...data },
    update: { ...data },
  });
}

async function replaceExperiences(tx: Tx, resumeId: string, entries: ExperienceEntryDTO[]) {
  await tx.workExperience.deleteMany({ where: { resumeId } });
  if (entries.length) {
    await tx.workExperience.createMany({
      data: entries.map((e, i) => ({ ...e, resumeId, order: e.order ?? i })),
    });
  }
}

async function replaceEducation(tx: Tx, resumeId: string, entries: EducationEntryDTO[]) {
  await tx.education.deleteMany({ where: { resumeId } });
  if (entries.length) {
    await tx.education.createMany({
      data: entries.map((e, i) => ({ ...e, resumeId, order: e.order ?? i })),
    });
  }
}

async function replaceProjects(tx: Tx, resumeId: string, entries: ProjectEntryDTO[]) {
  await tx.project.deleteMany({ where: { resumeId } });
  if (entries.length) {
    await tx.project.createMany({
      data: entries.map((e, i) => ({ ...e, resumeId, order: e.order ?? i })),
    });
  }
}

async function replaceSkills(tx: Tx, resumeId: string, entries: SkillEntryDTO[]) {
  await tx.skill.deleteMany({ where: { resumeId } });
  if (entries.length) {
    await tx.skill.createMany({
      data: entries.map((e, i) => ({ ...e, resumeId, order: e.order ?? i })),
    });
  }
}

async function replaceCertifications(tx: Tx, resumeId: string, entries: CertificationEntryDTO[]) {
  await tx.certification.deleteMany({ where: { resumeId } });
  if (entries.length) {
    await tx.certification.createMany({
      data: entries.map((e, i) => ({ ...e, resumeId, order: e.order ?? i })),
    });
  }
}

async function replaceAchievements(tx: Tx, resumeId: string, entries: AchievementEntryDTO[]) {
  await tx.achievement.deleteMany({ where: { resumeId } });
  if (entries.length) {
    await tx.achievement.createMany({
      data: entries.map((e, i) => ({ ...e, resumeId, order: e.order ?? i })),
    });
  }
}

async function replaceLanguages(tx: Tx, resumeId: string, entries: LanguageEntryDTO[]) {
  await tx.language.deleteMany({ where: { resumeId } });
  if (entries.length) {
    await tx.language.createMany({
      data: entries.map((e, i) => ({ ...e, resumeId, order: e.order ?? i })),
    });
  }
}

async function replaceReferences(tx: Tx, resumeId: string, entries: ReferenceEntryDTO[]) {
  await tx.reference.deleteMany({ where: { resumeId } });
  if (entries.length) {
    await tx.reference.createMany({
      data: entries.map((e, i) => ({ ...e, resumeId, order: e.order ?? i })),
    });
  }
}
