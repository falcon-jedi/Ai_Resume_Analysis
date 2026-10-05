/**
 * POST /api/resume/ai-improve — AI resume section improvement proxy.
 *
 * This route handler:
 *   1. Authenticates the user (NextAuth session)
 *   2. Validates the request body (Zod)
 *   3. Checks + increments AI_SUGGESTION usage counter
 *   4. Forwards request to Python /v1/resume/improve as a streaming proxy
 *   5. Pipes the SSE stream back to the client
 *
 * It does NOT:
 *   - Call the AI service directly or build prompts
 *   - Expose internal error details to the frontend
 *
 * Error handling:
 *   - Unauthenticated → 401
 *   - Invalid body     → 400
 *   - Limit exceeded   → 403 with { success: false, message, remaining: 0 }
 *   - Python backend failure → 502
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';
import { requireAuth } from '@/app/api/(controller)/_util/auth-guard';
import { validateRequest } from '@/app/api/(controller)/_util/validate';
import { aiImproveSchema } from '@/app/api/model/request/resume/ai-improve';
import { checkAndIncrementUsage, decrementUsage } from '@/app/service/subscription/usage.service';
import { aiRequestStream } from '@/app/service/ai/client';
import { AIServiceError } from '@/app/service/ai/client';

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(req: Request) {
  let userId = '';
  let incremented = false;

  try {
    // 1. Auth
    const authResult = await requireAuth();
    if (authResult.error) return authResult.error;
    userId = authResult.session!.user.id;

    // 2. Validate request body
    const result = await validateRequest(req, aiImproveSchema);
    if (result.error) return result.error;

    const { sectionType, currentText, resumeContext } = result.data;

    // 3. Check + increment AI_SUGGESTION usage inside a transaction (same pattern as ATS route)
    await prisma.$transaction(async (tx) => {
      await checkAndIncrementUsage(tx, userId, 'AI_SUGGESTION');
    });
    incremented = true;

    // 4. Forward to Python backend (streaming)
    const { stream, requestId } = await aiRequestStream(
      '/v1/resume/improve',
      {
        method: 'POST',
        body: {
          section_type: sectionType,
          current_text: currentText,
          resume_context: resumeContext ?? null,
        },
      },
      { timeoutMs: 45_000 },
    );

    // 5. Pipe the SSE stream back to the browser
    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Request-ID': requestId,
      },
    });
  } catch (err) {
    // Refund the usage counter if the Python backend failed
    if (incremented && userId) {
      try {
        await prisma.$transaction(async (tx) => {
          await decrementUsage(tx, userId, 'AI_SUGGESTION');
        });
      } catch (refundErr) {
        console.error('[POST /api/resume/ai-improve] Failed to refund usage:', refundErr);
      }
    }

    // Usage limit exceeded
    if (err instanceof Error && (err as any).code === 'LIMIT_EXCEEDED') {
      return NextResponse.json(
        {
          success: false,
          message:
            'You have used all your AI improvements for this month. Upgrade to Pro for more.',
          remaining: 0,
        },
        { status: 403 },
      );
    }

    return _handleError(err);
  }
}

// ---------------------------------------------------------------------------
// Error mapping (mirrors ats/analyze/route.ts)
// ---------------------------------------------------------------------------

function _handleError(err: unknown): NextResponse {
  if (err instanceof AIServiceError) {
    console.error(
      `[POST /api/resume/ai-improve] [${err.requestId.slice(0, 8)}] AI error: ${err.status} ${err.code} — ${err.message}`,
    );

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

  console.error('[POST /api/resume/ai-improve] Unexpected error:', err);
  return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
}
