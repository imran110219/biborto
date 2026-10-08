// Helpers for how members enter the system. Nobody registers themselves: an admin (or a CSV import)
// adds an email and a roll, the person signs in with that email (Google, or a verified email link),
// and confirms the rest at /welcome. Pure functions — no database — so they are unit-tested.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLL = /^[0-9A-Za-z-]{3,20}$/;

export const isEmail = (value: string) => EMAIL.test(value);

/** Returns an error message, or undefined when the roll is acceptable. */
export function validateRoll(roll: string): string | undefined {
  if (!roll) return "Roll (student ID) is required.";
  if (!ROLL.test(roll)) return "Roll must be 3–20 letters, digits or hyphens.";
  return undefined;
}

/**
 * A Khulna University roll is six digits: the batch (11), the discipline code (01–24) and a serial
 * number — 110201 is batch 11, discipline 02 (CSE), student 01. Returns the two-digit discipline
 * code, or undefined when the roll doesn't have that shape.
 */
export function disciplineCodeFromRoll(roll: string): string | undefined {
  return /^\d{6}$/.test(roll) ? roll.slice(2, 4) : undefined;
}

/**
 * A stand-in display name for a record created from just an email address ("a.b.rahman@x" →
 * "A B Rahman"). It is never shown publicly: the record stays hidden until the person confirms their
 * real name at /welcome.
 */
export function placeholderName(email: string): string {
  const words = email
    .split("@")[0]
    .replace(/[^A-Za-z]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase());
  return words.length ? words.join(" ") : "New member";
}

/** The confirmed name a member types at /welcome: trimmed, single-spaced, 2–100 characters. */
export function validateDisplayName(raw: string): { name: string } | { error: string } {
  const name = raw.replace(/\s+/g, " ").trim();
  if (name.length < 2) return { error: "Please enter your full name." };
  if (name.length > 100) return { error: "Your name is too long (100 characters max)." };
  if (/[<>]/.test(name)) return { error: "Your name can't contain < or >." };
  return { name };
}
