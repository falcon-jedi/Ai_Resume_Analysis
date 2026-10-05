import { NextResponse } from 'next/server';
import { requireAuth } from '@/app/api/(controller)/_util/auth-guard';
import { getResumePhotoPresignedUrl } from '@/app/service/storage/s3.service';
import { prisma } from '@/app/_lib/prisma';
import { S3_UPLOADABLE_TYPES } from '@/app/api/model/enums/upload';
import { presignedUrlRequestSchema } from '@/app/api/model/request/upload';
import type { PresignedUrlResponseDTO } from '@/app/api/model/response/upload';

// POST /api/upload/resume-photo
// Body: PresignedUrlRequestDTO
// Returns: PresignedUrlResponseDTO
export async function POST(req: Request) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const body = await req.json();
    const parsed = presignedUrlRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message || 'Invalid request' },
        { status: 400 },
      );
    }

    const { resumeId, contentType } = parsed.data;

    if (!S3_UPLOADABLE_TYPES.includes(contentType as any)) {
      return NextResponse.json(
        { success: false, message: 'Unsupported image type' },
        { status: 400 },
      );
    }

    // Verify resume belongs to this user before issuing a signed URL
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: session!.user.id, deletedAt: null },
      select: { id: true },
    });
    if (!resume) {
      return NextResponse.json({ success: false, message: 'Resume not found' }, { status: 404 });
    }

    const result = await getResumePhotoPresignedUrl(resumeId, contentType);
    const responsePayload: PresignedUrlResponseDTO = {
      success: true,
      uploadUrl: result.uploadUrl,
      publicUrl: result.publicUrl,
    };
    return NextResponse.json(responsePayload);
  } catch (err) {
    console.error('[POST /api/upload/resume-photo]', err);
    return NextResponse.json(
      { success: false, message: 'Failed to generate upload URL' },
      { status: 500 },
    );
  }
}
