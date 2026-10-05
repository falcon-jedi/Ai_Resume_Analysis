import { NextResponse } from 'next/server';
import { listTemplates } from '@/app/service/resume/template.service';

// GET /api/template — list all available templates
export async function GET() {
  try {
    const rawTemplates = listTemplates();

    const templates = rawTemplates.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug || t.id,
      category: t.category,
      description: t.description || 'Professional resume template.',
      previewImage: t.previewImage || `/api/template/${encodeURIComponent(t.id)}/thumbnail`,
      atsFriendly: t.atsFriendly ?? t.ats ?? true,
      isPremium: t.isPremium ?? false,
      usageCount: t.usageCount ?? 12000,
      sections: t.sections ?? [],
      hasPhoto: t.hasPhoto ?? false,
    }));

    const categoriesSet = new Set(templates.map((t) => t.category));
    const categories = ['All', ...Array.from(categoriesSet)];

    return NextResponse.json({
      success: true,
      data: {
        categories,
        templates,
      },
    });
  } catch (err) {
    console.error('[GET /api/template]', err);
    return NextResponse.json(
      { success: false, message: 'Failed to list templates' },
      { status: 500 },
    );
  }
}
