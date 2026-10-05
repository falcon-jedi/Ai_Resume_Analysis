import NextAuth from 'next-auth';
import { authOptions } from './options';

/**
 * Auth.js catch-all route handler.
 *
 * Handles all /api/auth/* requests:
 * - GET  /api/auth/signin
 * - GET  /api/auth/signout
 * - POST /api/auth/signin/:provider
 * - POST /api/auth/signout
 * - GET  /api/auth/session
 * - GET  /api/auth/csrf
 * - GET  /api/auth/providers
 * - GET  /api/auth/callback/:provider
 *
 * IMPORTANT: The route path is
 *   src/app/api/(controller)/auth/[...nextauth]/route.ts
 *
 * Next.js App Router route groups (parenthesized segments like (controller))
 * are stripped from the URL, so this maps to /api/auth/[...nextauth].
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
