import { NextResponse } from 'next/server';
import { requireAuth } from '@/app/api/(controller)/_util/auth-guard';
import { duplicateResume } from '@/app/service/resume/resume.service';
import { toResumeDetail } from '@/app/api/model/response/resume';

type Params = { params: Promise<{ id: string }> };

// POST /api/resume/:id/duplicate
export async function POST(_req: Request, { params }: Params) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;
    const resume = await duplicateResume(id, session!.user.id);
    return NextResponse.json({ success: true, data: toResumeDetail(resume) }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to duplicate resume';
    if (message === 'Resume not found') {
      return NextResponse.json({ success: false, message }, { status: 404 });
    }
    console.error('[POST /api/resume/:id/duplicate]', err);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
