import { NextResponse } from 'next/server';
import { requireAuth } from '@/app/api/(controller)/_util/auth-guard';
import { renderResumeHtml } from '@/app/service/resume/renderer.service';
import { generatePdf } from '@/app/service/resume/pdf.service';

type Params = { params: Promise<{ id: string }> };

// POST /api/resume/:id/pdf — returns PDF as octet-stream (unlimited, no usage gate)
export async function POST(_req: Request, { params }: Params) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;
    const userId = session!.user.id;

    const { id } = await params;
    const html = await renderResumeHtml(id, userId);
    const pdfBuffer = await generatePdf(html);

    const body = new Uint8Array(pdfBuffer);
    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="resume-${id}.pdf"`,
        'Content-Length': body.length.toString(),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to generate PDF';
    if (message === 'Resume not found') {
      return NextResponse.json({ success: false, message }, { status: 404 });
    }
    console.error('[POST /api/resume/:id/pdf]', err);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
