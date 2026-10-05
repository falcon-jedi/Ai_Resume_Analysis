/**
 * POST /api/ats/analyze — ATS analysis endpoint.
 *
 * This route handler:
 *   1. Authenticates the user (NextAuth session)
 *   2. Validates the request body (Zod)
 *   3. Delegates to the ATS service
 *   4. Maps errors to appropriate HTTP responses
 *
 * It does NOT:
 *   - call the AI service directly
 *   - perform any ATS logic
 *   - expose internal error details to the frontend
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/app/api/(controller)/_util/auth-guard';
import { validateRequest } from '@/app/api/(controller)/_util/validate';
import { atsAnalyzeSchema } from '@/app/api/model/request/ats/analyze';
import { analyzeATS, analyzeATSStream } from '@/app/service/ai/ats.service';
import { AIServiceError } from '@/app/service/ai/client';
import { logger } from '@/lib/telemetry/logger';
import { prisma } from '@/app/_lib/prisma';
import { checkAndIncrementUsage, decrementUsage } from '@/app/service/subscription/usage.service';

export async function POST(req: Request) {
  let userId = '';
  let incremented = false;

  try {
    // 1. Auth
    const authResult = await requireAuth();
    if (authResult.error) return authResult.error;
    userId = authResult.session!.user.id;

    // 2. Validate
    const result = await validateRequest(req, atsAnalyzeSchema);
    if (result.error) return result.error;

    // 3. Check and increment ATS usage limit inside an explicit transaction
    await prisma.$transaction(async (tx) => {
      await checkAndIncrementUsage(tx, userId, 'ATS_ANALYSIS');
    });
    incremented = true;

    // 4. Delegate to ATS service
    if (result.data.stream) {
      const { stream, requestId } = await analyzeATSStream({
        resumeText: result.data.resumeText,
        resumeFileName: result.data.resumeFileName,
        resumeFileBytes: result.data.resumeFileBytes,
        jobDescriptionText: result.data.jobDescriptionText,
      });

      return new Response(stream, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          'X-Request-ID': requestId,
        },
      });
    }

    const { report, requestId } = await analyzeATS({
      resumeText: result.data.resumeText,
      resumeFileName: result.data.resumeFileName,
      resumeFileBytes: result.data.resumeFileBytes,
      jobDescriptionText: result.data.jobDescriptionText,
    });

    // 5. Return success
    return NextResponse.json(
      {
        success: true,
        data: report,
        requestId,
      },
      {
        status: 200,
        headers: { 'X-Request-ID': requestId },
      },
    );
  } catch (err) {
    // Refund the usage counter inside an explicit transaction if the external AI service failed
    if (incremented && userId) {
      try {
        await prisma.$transaction(async (tx) => {
          await decrementUsage(tx, userId, 'ATS_ANALYSIS');
        });
        logger.warn('ats.analyze.usage_refunded', { userId });
      } catch (refundErr) {
        logger.error('ats.analyze.usage_refund_failed', {
          userId,
          error: refundErr instanceof Error ? refundErr.message : String(refundErr),
        });
      }
    }

    // Map limits exceeded error specifically
    if (err instanceof Error && (err as any).code === 'LIMIT_EXCEEDED') {
      return NextResponse.json({ success: false, message: err.message }, { status: 403 });
    }

    return _handleError(err);
  }
}

// ---------------------------------------------------------------------------
// Error mapping
// ---------------------------------------------------------------------------

function _handleError(err: unknown): NextResponse {
  if (err instanceof AIServiceError) {
    logger.error('ats.analyze.ai_error', {
      requestId: err.requestId.slice(0, 8),
      status: err.status,
      code: err.code,
      message: err.message,
    });

    // Map Python status codes to user-facing responses
    switch (err.status) {
      case 401:
        return NextResponse.json(
          { success: false, message: 'AI service authentication failed' },
          { status: 502 },
        );
      case 422:
        return NextResponse.json(
          { success: false, message: 'Invalid data sent to AI service' },
          { status: 400 },
        );
      case 504:
        return NextResponse.json(
          { success: false, message: 'AI service timed out. Please try again.' },
          { status: 504 },
        );
      case 503:
        return NextResponse.json(
          {
            success: false,
            message: 'AI service is currently unavailable. Please try again later.',
          },
          { status: 503 },
        );
      default:
        return NextResponse.json(
          { success: false, message: 'AI service encountered an error' },
          { status: 502 },
        );
    }
  }

  // Unexpected error — never expose stack traces
  logger.error('ats.analyze.unexpected_error', {
    error: err instanceof Error ? err.message : String(err),
  });
  return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
}
