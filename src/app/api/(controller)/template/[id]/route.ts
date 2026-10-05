import { NextResponse } from 'next/server';
import { getTemplate } from '@/app/service/resume/template.service';

type Params = { params: Promise<{ id: string }> };

// GET /api/template/:id — get single template metadata
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const template = getTemplate(id);
    return NextResponse.json({ success: true, data: template });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Template not found';
    return NextResponse.json({ success: false, message }, { status: 404 });
  }
}
