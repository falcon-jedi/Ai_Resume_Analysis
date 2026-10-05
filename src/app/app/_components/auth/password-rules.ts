export interface PasswordRule {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: 'min-length',
    label: 'At least 8 characters',
    test: (p) => p.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'One uppercase letter (A–Z)',
    test: (p) => /[A-Z]/.test(p),
  },
  {
    id: 'lowercase',
    label: 'One lowercase letter (a–z)',
    test: (p) => /[a-z]/.test(p),
  },
  {
    id: 'number',
    label: 'One number (0–9)',
    test: (p) => /[0-9]/.test(p),
  },
  {
    id: 'special',
    label: 'One special character (!@#$…)',
    test: (p) => /[^A-Za-z0-9]/.test(p),
  },
];

/** Returns how many rules the password currently satisfies (0–5). */
export function countSatisfied(password: string): number {
  return PASSWORD_RULES.filter((r) => r.test(password)).length;
}

/** Returns true only when every rule passes. */
export function allSatisfied(password: string): boolean {
  return PASSWORD_RULES.every((r) => r.test(password));
}
