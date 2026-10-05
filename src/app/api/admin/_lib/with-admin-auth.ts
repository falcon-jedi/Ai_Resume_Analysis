import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/(controller)/auth/[...nextauth]/options';
import { NextResponse } from 'next/server';

export type AdminSession = {
  user: { id: string; email: string; name?: string | null; role: string };
};

/**
 * Validates admin session. Returns { session } or a 401/403 NextResponse.
 *
 * Usage:
 *   const result = await withAdminAuth();
 *   if (result instanceof NextResponse) return result;
 *   const { session } = result;
 */
export async function withAdminAuth(): Promise<{ session: AdminSession } | NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  return { session: session as AdminSession };
}
