import { NextResponse } from 'next/server';
import { requireAuth } from '@/app/api/(controller)/_util/auth-guard';
import { renderResumeHtml } from '@/app/service/resume/renderer.service';

type Params = { params: Promise<{ id: string }> };

// POST /api/resume/:id/preview — returns rendered HTML
export async function POST(_req: Request, { params }: Params) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;
    const html = await renderResumeHtml(id, session!.user.id);
    return NextResponse.json({ success: true, html });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to render preview';
    if (message === 'Resume not found') {
      return NextResponse.json({ success: false, message }, { status: 404 });
    }
    console.error('[POST /api/resume/:id/preview]', err);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
