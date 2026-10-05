import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/(controller)/auth/[...nextauth]/options';
import { validateRequest } from '@/app/api/(controller)/_util/validate';
import { feedbackSchema, type FeedbackRequestDTO } from '@/app/api/model/request/feedback';
import { prisma } from '@/app/_lib/prisma';
import { sendFeedbackEmails } from '@/app/service/feedback/feedback-email.service';
import { verifyTurnstileToken } from '@/app/api/(controller)/_util/turnstile';

export async function POST(req: Request) {
  try {
    const result = await validateRequest(req, feedbackSchema);
    if (result.error) return result.error;

    const data = result.data as FeedbackRequestDTO;
    const session = await getServerSession(authOptions);
    const userAgent = req.headers.get('user-agent') || undefined;

    let userId: string | null = null;
    let userName = 'User';
    let userEmail = '';

    if (session?.user?.id) {
      // ── Authenticated Flow ────────────────────────────────────────────────
      userId = session.user.id;
      userName = session.user.name || 'User';
      userEmail = session.user.email || '';
    } else {
      // ── Unauthenticated Public Flow ───────────────────────────────────────
      const rawIp =
        req.headers.get('cf-connecting-ip') ||
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        undefined;

      // 1. Validate required unauthenticated fields
      if (!data.email || !data.email.trim()) {
        return NextResponse.json(
          { success: false, message: 'Please provide a valid email address.' },
          { status: 400 },
        );
      }

      userName = data.name?.trim() || 'Anonymous User';
      userEmail = data.email.trim();

      // 3. Verify Cloudflare Turnstile Token
      if (!data.turnstileToken) {
        return NextResponse.json(
          { success: false, message: 'Please complete the CAPTCHA verification.' },
          { status: 400 },
        );
      }

      const isValidCaptcha = await verifyTurnstileToken(data.turnstileToken, rawIp);
      if (!isValidCaptcha) {
        return NextResponse.json(
          { success: false, message: 'CAPTCHA verification failed. Please try again.' },
          { status: 400 },
        );
      }
    }

    // ── Save to Database ───────────────────────────────────────────────────
    const feedback = await prisma.feedback.create({
      data: {
        userId: userId || undefined,
        name: userName || undefined,
        email: userEmail || undefined,
        type: data.type,
        rating: data.rating,
        subject: data.subject,
        message: data.message,
        pageUrl: data.pageUrl,
        userAgent,
        status: 'NEW',
      },
    });

    // ── Fire-and-Forget Email Dispatch ─────────────────────────────────────
    if (userEmail) {
      sendFeedbackEmails({
        userName,
        userEmail,
        type: data.type,
        rating: data.rating,
        subject: data.subject,
        message: data.message,
        pageUrl: data.pageUrl,
        submittedAt: feedback.createdAt,
      }).catch((err) => {
        console.error('[sendFeedbackEmails error]:', err);
      });
    }

    return NextResponse.json(
      {
        success: true,
        id: feedback.id,
        message: 'Feedback submitted successfully!',
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('[POST /api/feedback]', err);
    return NextResponse.json(
      { success: false, message: 'Failed to submit feedback' },
      { status: 500 },
    );
  }
}
