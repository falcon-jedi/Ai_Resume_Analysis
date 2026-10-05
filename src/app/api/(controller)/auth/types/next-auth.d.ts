/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth, { DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';

/**
 * Type augmentations for NextAuth.
 *
 * Extends the default Session and JWT types to include
 * custom fields (id, role, emailVerified) that we add
 * in the jwt and session callbacks.
 */

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      emailVerified: Date | null;
    } & DefaultSession['user'];
  }

  interface User {
    role?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
    emailVerified?: Date | null;
  }
}
