import { NextResponse } from 'next/server';
import { validateRequest } from '@/app/api/(controller)/_util/validate';
import { requireAuth } from '@/app/api/(controller)/_util/auth-guard';
import { updateResumeSchema } from '@/app/api/model/request/resume/resume';
import { getResume, updateResume, deleteResume } from '@/app/service/resume/resume.service';
import { toResumeDetail } from '@/app/api/model/response/resume';

type Params = { params: Promise<{ id: string }> };

// Resume content changes frequently in the editor and profile settings. Route
// responses must always come from Postgres, never a Next.js or browser cache.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/resume/:id — get full resume with all sections
export async function GET(_req: Request, { params }: Params) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;
    const resume = await getResume(id, session!.user.id);
    return NextResponse.json(
      { success: true, data: toResumeDetail(resume) },
      { headers: { 'Cache-Control': 'private, no-store, max-age=0' } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get resume';
    if (message === 'Resume not found') {
      return NextResponse.json({ success: false, message }, { status: 404 });
    }
    console.error('[GET /api/resume/:id]', err);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// PATCH /api/resume/:id — update metadata and/or any sections (transactional)
export async function PATCH(req: Request, { params }: Params) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const result = await validateRequest(req, updateResumeSchema);
    if (result.error) return result.error;

    const { id } = await params;
    const resume = await updateResume(id, session!.user.id, result.data);
    return NextResponse.json({ success: true, data: toResumeDetail(resume) });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update resume';
    if (message === 'Resume not found') {
      return NextResponse.json({ success: false, message }, { status: 404 });
    }
    console.error('[PATCH /api/resume/:id]', err);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// DELETE /api/resume/:id — soft delete
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;
    await deleteResume(id, session!.user.id);
    return NextResponse.json({ success: true, message: 'Resume deleted' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete resume';
    if (message === 'Resume not found') {
      return NextResponse.json({ success: false, message }, { status: 404 });
    }
    console.error('[DELETE /api/resume/:id]', err);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
