/**
 * DELETE /api/ats/history/clear — Delete ALL analyses for the authenticated user.
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/app/api/(controller)/_util/auth-guard';
import { clearAllHistory } from '@/app/service/ats/history.service';
import { logger } from '@/lib/telemetry/logger';

export async function DELETE() {
  try {
    const authResult = await requireAuth();
    if (authResult.error) return authResult.error;
    const userId = authResult.session!.user.id;

    await clearAllHistory(userId);
    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error('ats.history.clear.unexpected_error', {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { success: false, message: 'Failed to clear history' },
      { status: 500 },
    );
  }
}
