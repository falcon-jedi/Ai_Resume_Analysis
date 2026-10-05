/**
 * POST /api/ats/save — Persist a completed ATS analysis to the database.
 *
 * Called by the frontend processing page immediately after the AI stream completes.
 * Returns the saved record's id, which is used for the redirect URL.
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/app/api/(controller)/_util/auth-guard';
import { validateRequest } from '@/app/api/(controller)/_util/validate';
import {
  saveAtsAnalysisSchema,
  type SaveAtsAnalysisDTO,
} from '@/app/api/model/request/ats/history';
import { saveAnalysis } from '@/app/service/ats/history.service';
import { logger } from '@/lib/telemetry/logger';

export async function POST(req: Request) {
  try {
    const authResult = await requireAuth();
    if (authResult.error) return authResult.error;
    const userId = authResult.session!.user.id;

    const result = await validateRequest(req, saveAtsAnalysisSchema);
    if (result.error) return result.error;

    const id = await saveAnalysis(userId, result.data as unknown as SaveAtsAnalysisDTO);

    return NextResponse.json({ success: true, data: { id } }, { status: 201 });
  } catch (err) {
    logger.error('ats.save.unexpected_error', {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { success: false, message: 'Failed to save analysis' },
      { status: 500 },
    );
  }
}

