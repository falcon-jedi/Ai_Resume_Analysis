import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from '@/app/_lib/prisma';

/**
 * Auth.js (NextAuth v4) configuration.
 *
 * STRATEGY: JWT — no database sessions.
 * COOKIE: HTTP-only, Secure, SameSite=Lax
 *
 * PROVIDERS:
 * 1. Google OAuth — auto-verifies email, creates/links account
 * 2. Credentials — email + password, requires email verification
 *
 * JWT CALLBACKS:
 * - `jwt` callback: enriches the token with user ID, role, email
 * - `session` callback: exposes token data to the client session
 *
 * SIGN-IN CALLBACK:
 * - Blocks unverified credential users
 * - Auto-links Google accounts to existing credential users
 */
export const authOptions: NextAuthOptions = {
  // ─────────────────────────────────────────
  // PROVIDERS
  // ─────────────────────────────────────────
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        // Find user
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!user || !user.password) {
          // No user found, or user signed up via OAuth (no password)
          throw new Error('Invalid email or password');
        }

        // Verify password
        const isValid = await compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Invalid email or password');
        }

        // Check email verification
        if (!user.emailVerified) {
          throw new Error('Please verify your email before logging in');
        }

        // Return user object — this becomes the `user` param in jwt callback
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],

  // ─────────────────────────────────────────
  // SESSION STRATEGY: JWT (no database sessions)
  // ─────────────────────────────────────────
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  // ─────────────────────────────────────────
  // JWT CONFIG
  // ─────────────────────────────────────────
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  // ─────────────────────────────────────────
  // PAGES (custom auth pages)
  // ─────────────────────────────────────────
  pages: {
    signIn: '/app/login',
    error: '/app/login',
  },

  // ─────────────────────────────────────────
  // COOKIES — HTTP-only, Secure, SameSite
  // ─────────────────────────────────────────
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === 'production'
          ? '__Secure-next-auth.session-token'
          : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  // ─────────────────────────────────────────
  // CALLBACKS
  // ─────────────────────────────────────────
  callbacks: {
    /**
     * signIn callback — runs BEFORE a session is created.
     *
     * For Google OAuth:
     * - Auto-creates user if new
     * - Links Google account to existing credential user (same email)
     * - Auto-verifies email
     *
     * For Credentials:
     * - authorize() already handles validation
     */
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        const email = user.email?.toLowerCase().trim();
        if (!email) return false;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email },
          include: { accounts: true },
        });

        if (existingUser) {
          // Check if Google account is already linked
          const hasGoogleAccount = existingUser.accounts.some((acc) => acc.provider === 'google');

          if (!hasGoogleAccount) {
            // Link Google account to existing user
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
              },
            });
          }

          // Auto-verify email for Google users
          if (!existingUser.emailVerified) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                emailVerified: new Date(),
                image: existingUser.image || user.image,
                name: existingUser.name || user.name,
              },
            });
          }
        } else {
          // Create new user + account for first-time Google login
          await prisma.user.create({
            data: {
              email,
              name: user.name || (profile as { name?: string })?.name,
              image: user.image,
              emailVerified: new Date(), // Google emails are pre-verified
              accounts: {
                create: {
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  refresh_token: account.refresh_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                },
              },
            },
          });
        }

        return true;
      }

      // Credentials — authorize() already validated
      return true;
    },

    /**
     * JWT callback — enriches the JWT with user data from DB.
     *
     * Runs on:
     * - Initial sign-in (user object is available)
     * - Every subsequent request (only token is available)
     */
    async jwt({ token, user, account, trigger }) {
      // Initial sign-in — populate token with user data
      if (user) {
        // For Google OAuth, we need to fetch the DB user to get the real ID
        if (account?.provider === 'google') {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email!.toLowerCase().trim() },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.emailVerified = dbUser.emailVerified;
          }
        } else {
          // Credentials — user object comes from authorize()
          token.id = user.id;
          token.role = (user as { role?: string }).role || 'USER';
        }

        // Hybrid admin promotion: if email is in ADMIN_EMAILS whitelist,
        // ensure DB role is 'ADMIN' and reflect in token.
        const adminEmails = (process.env.ADMIN_EMAILS ?? '')
          .split(',')
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean);
        const email = (user.email ?? '').toLowerCase();
        if (adminEmails.includes(email) && token.id) {
          await prisma.user.updateMany({
            where: { id: token.id as string, NOT: { role: 'ADMIN' } },
            data: { role: 'ADMIN' },
          });
          token.role = 'ADMIN';
        }
      }

      // Refresh user data on session update
      if (trigger === 'update' && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
        });
        if (dbUser) {
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.image = dbUser.image;
          token.role = dbUser.role;
        }
      }

      return token;
    },

    /**
     * Session callback — shapes the session object sent to the client.
     *
     * SECURITY: Only expose safe fields. Never expose password.
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.emailVerified = token.emailVerified as Date | null;
      }
      return session;
    },
  },

  // ─────────────────────────────────────────
  // EVENTS (optional logging hooks)
  // ─────────────────────────────────────────
  events: {
    async signIn({ user }) {
      console.log(`[AUTH] User signed in: ${user.email}`);
    },
  },

  // ─────────────────────────────────────────
  // SECRET
  // ─────────────────────────────────────────
  secret: process.env.NEXTAUTH_SECRET,

  // ─────────────────────────────────────────
  // DEBUG (only in development)
  // ─────────────────────────────────────────
  debug: process.env.NODE_ENV === 'development',
};
