import type { Rule } from "./rate-limit";

// Every rate limit in one place. "Failures" rules count only failed attempts.
const FIFTEEN_MIN = 15 * 60;
const HOUR = 60 * 60;

export const LIMITS = {
  // Sign-in failures. Three counters so one attacker is stopped quickly, but cannot
  // easily lock a real member out of their own account:
  signInPair: { limit: 5, windowSeconds: FIFTEEN_MIN } satisfies Rule, // this email from this IP
  signInEmail: { limit: 25, windowSeconds: FIFTEEN_MIN } satisfies Rule, // this email from anywhere (distributed guessing)
  signInIp: { limit: 30, windowSeconds: FIFTEEN_MIN } satisfies Rule, // this IP across emails (password spraying)

  // Emails we send on request (password reset, account claim).
  emailRequestEmail: { limit: 3, windowSeconds: HOUR } satisfies Rule,
  emailRequestIp: { limit: 10, windowSeconds: HOUR } satisfies Rule,

  // Wrong "current password" when changing a password (someone on a stolen session).
  passwordChange: { limit: 5, windowSeconds: FIFTEEN_MIN } satisfies Rule,

  // Profile / cover photo uploads per member (each writes to R2).
  photoUpload: { limit: 30, windowSeconds: HOUR } satisfies Rule,
} as const;
