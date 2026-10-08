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

  // Content a member submits for review. The per-member caps (pending posts, listings) already
  // bound what is stored; these also bound the *attempts* (each one parses a large form).
  blogSubmit: { limit: 10, windowSeconds: HOUR } satisfies Rule,
  businessSubmit: { limit: 6, windowSeconds: HOUR } satisfies Rule,

  // Blog editor image uploads per member (each reads up to 8 MB and writes to R2).
  blogImageUpload: { limit: 60, windowSeconds: HOUR } satisfies Rule,

  // RSVP toggles per member (cheap, but a script could hammer them).
  rsvp: { limit: 60, windowSeconds: HOUR } satisfies Rule,

  // CSV member imports per superadmin (each analyzes up to 2,000 rows).
  memberImport: { limit: 30, windowSeconds: HOUR } satisfies Rule,

  // Profile / cover photo uploads per member (each writes to R2).
  photoUpload: { limit: 30, windowSeconds: HOUR } satisfies Rule,
} as const;
