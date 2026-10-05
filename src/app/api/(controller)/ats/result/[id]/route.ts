/**
 * GET    /api/ats/result/[id] — Fetch a specific ATS analysis (scoped to session user).
 * DELETE /api/ats/result/[id] — Delete a specific ATS analysis (scoped to session user).
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/app/api/(controller)/_util/auth-guard';
import { getAnalysisById, deleteAnalysis } from '@/app/service/ats/history.service';
import { logger } from '@/lib/telemetry/logger';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const authResult = await requireAuth();
    if (authResult.error) return authResult.error;
    const userId = authResult.session!.user.id;

    const { id } = await params;
    const record = await getAnalysisById(id, userId);
    if (!record) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: record });
  } catch (err) {
    logger.error('ats.result.get.unexpected_error', {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { success: false, message: 'Failed to fetch analysis' },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const authResult = await requireAuth();
    if (authResult.error) return authResult.error;
    const userId = authResult.session!.user.id;

    const { id } = await params;
    await deleteAnalysis(id, userId);
    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error('ats.result.delete.unexpected_error', {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { success: false, message: 'Failed to delete analysis' },
      { status: 500 },
    );
  }
}
