import { randomBytes } from 'crypto';

/**
 * Generate a cryptographically secure random token(email verification, password reset).
 */
export function generateToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Generate a token expiration date.
 */
export function generateExpiration(hours: number = 1): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}
