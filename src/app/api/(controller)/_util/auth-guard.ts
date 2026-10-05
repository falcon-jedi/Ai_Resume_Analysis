import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/(controller)/auth/[...nextauth]/options';

/**
 * Returns the authenticated session or a 401 NextResponse.
 * Usage:
 *   const { session, error } = await requireAuth();
 *   if (error) return error;
 *   const userId = session.user.id;
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return {
      session: null,
      error: NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }),
    };
  }
  return { session, error: null };
}
