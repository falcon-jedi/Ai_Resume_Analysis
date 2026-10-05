/**
 * GET  /api/ats/history — Paginated list of the user's analyses.
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/app/api/(controller)/_util/auth-guard';
import { listAtsHistoryQuerySchema } from '@/app/api/model/request/ats/history';
import { getUserHistory } from '@/app/service/ats/history.service';
import { logger } from '@/lib/telemetry/logger';

export async function GET(req: Request) {
  try {
    const authResult = await requireAuth();
    if (authResult.error) return authResult.error;
    const userId = authResult.session!.user.id;

    const { searchParams } = new URL(req.url);
    const parsedQuery = listAtsHistoryQuerySchema.safeParse({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    });

    const { page, limit } = parsedQuery.success ? parsedQuery.data : { page: 1, limit: 20 };

    const data = await getUserHistory(userId, page, limit);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    logger.error('ats.history.unexpected_error', {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { success: false, message: 'Failed to fetch history' },
      { status: 500 },
    );
  }
}
