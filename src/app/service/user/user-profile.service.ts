import { prisma } from '@/app/_lib/prisma';
import type { UpdateUserMetaDTO } from '@/app/api/model/request/user/user-profile';
import type { UserProfileResponse, UserProfile } from '@/app/api/model/response/user/user-profile';
import { ResumeStatus } from '@/app/api/model/enums/resume';

export type { UserProfileResponse, UserProfile, UpdateUserMetaDTO };

// ─────────────────────────────────────────────────────────────────────────────
// GET PROFILE META
// Reading profile settings must be side-effect free. In particular, visiting
// the new-resume page must not create an empty profile that looks importable.
// ─────────────────────────────────────────────────────────────────────────────

export async function getUserProfile(userId: string): Promise<UserProfileResponse> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      jobTitle: true,
      industry: true,
      profileResumeId: true,
    },
  });

  if (!user) throw new Error('User not found');

  return user;
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE PROFILE RESUME ON FIRST SAVE
// ─────────────────────────────────────────────────────────────────────────────

async function ensureProfileResume(userId: string): Promise<string> {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({
      where: { id: userId },
      select: { profileResumeId: true, name: true, email: true, jobTitle: true },
    });

    if (user.profileResumeId) return user.profileResumeId;

    const resume = await tx.resume.create({
      data: {
        userId,
        title: '__profile__',
        templateId: 'classic-demo',
        status: ResumeStatus.PROFILE,
        // Create an empty PersonalInfo shell so the editor always finds a record

        personalInfo: {
          create: {
            fullName: user.name ?? '',
            email: user.email ?? '',
            jobTitle: user.jobTitle ?? undefined,
          },
        },
      },
      select: { id: true },
    });

    // Only one concurrent first-save may claim the pointer. The resume rows
    // are never shared with ordinary resumes, so later edits stay independent.
    const claim = await tx.user.updateMany({
      where: { id: userId, profileResumeId: null },
      data: { profileResumeId: resume.id },
    });

    if (claim.count === 1) return resume.id;

    // A parallel save won the race. Remove this unreferenced shell and use
    // the already-established profile resume instead.
    await tx.resume.delete({ where: { id: resume.id } });
    const claimed = await tx.user.findUniqueOrThrow({
      where: { id: userId },
      select: { profileResumeId: true },
    });
    if (!claimed.profileResumeId) throw new Error('Failed to create profile resume');
    return claimed.profileResumeId;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE USER META (name, jobTitle, industry, image)
// Career section data is saved separately via PATCH /api/resume/:profileResumeId
// ─────────────────────────────────────────────────────────────────────────────

export async function updateUserMeta(
  userId: string,
  data: UpdateUserMetaDTO,
): Promise<UserProfileResponse> {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.jobTitle !== undefined && { jobTitle: data.jobTitle }),
      ...(data.industry !== undefined && { industry: data.industry }),
      ...(data.image !== undefined && data.image !== '' && { image: data.image }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      jobTitle: true,
      industry: true,
      profileResumeId: true,
    },
  });

  const profileResumeId = updated.profileResumeId ?? (await ensureProfileResume(userId));
  return { ...updated, profileResumeId };
}
