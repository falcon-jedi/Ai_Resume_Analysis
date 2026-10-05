/**
 * POST /api/ats/extract-jd — Job Description URL Extraction Route.
 *
 * This route handler:
 *   1. Authenticates the user via NextAuth session
 *   2. Validates the URL body (Zod)
 *   3. Checks user's ATS_ANALYSIS plan limit
 *   4. Calls the AI backend service (extractJdFromUrl)
 *   5. Returns extracted text or maps errors
 *
 * Server-side only.
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/app/api/(controller)/_util/auth-guard';
import { validateRequest } from '@/app/api/(controller)/_util/validate';
import { extractJdSchema } from '@/app/api/model/request/ats/analyze';
import { extractJdFromUrl } from '@/app/service/ai/ats.service';
import { AIServiceError } from '@/app/service/ai/client';
import { prisma } from '@/app/_lib/prisma';
import { getOrSeedUsage } from '@/app/service/subscription/usage.service';
import { logger } from '@/lib/telemetry/logger';

export async function POST(req: Request) {
  try {
    // 1. Auth
    const authResult = await requireAuth();
    if (authResult.error) return authResult.error;
    const userId = authResult.session!.user.id;

    // 2. Validate request body
    const result = await validateRequest(req, extractJdSchema);
    if (result.error) return result.error;

    // 3. Check ATS_ANALYSIS usage limit
    const usage = await getOrSeedUsage(prisma, userId, 'ATS_ANALYSIS');
    if (usage.limit !== -1 && usage.used >= usage.limit) {
      return NextResponse.json(
        {
          success: false,
          message:
            'ATS analysis limit reached. Please upgrade your subscription to extract job descriptions from URLs.',
        },
        { status: 403 },
      );
    }

    // 4. Call AI backend service
    const { result: extractData, requestId } = await extractJdFromUrl(result.data.url);

    // 5. Return extracted payload
    return NextResponse.json(
      {
        success: true,
        text: extractData.text,
        source: extractData.source,
        charCount: extractData.char_count,
        requestId,
      },
      {
        status: 200,
        headers: { 'X-Request-ID': requestId },
      },
    );
  } catch (err: unknown) {
    if (err instanceof AIServiceError) {
      logger.error('ats.extract_jd.ai_error', {
        requestId: err.requestId.slice(0, 8),
        status: err.status,
        code: err.code,
        message: err.message,
      });

      if (err.status === 422) {
        return NextResponse.json(
          {
            success: false,
            message: err.message || 'Could not extract job description from this URL.',
          },
          { status: 422 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: 'Failed to extract job description. Please check the URL or paste manually.',
        },
        { status: 502 },
      );
    }

    logger.error('ats.extract_jd.unexpected_error', {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { success: false, message: 'An internal error occurred during extraction.' },
      { status: 500 },
    );
  }
}
