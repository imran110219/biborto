"use server";

import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { and, eq, gt, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users, verificationTokens } from "@/lib/db/auth-schema";
import { members } from "@/drizzle/schema";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { claimLink, sendClaimEmail } from "@/lib/email";

// "Claim" not "sign up": members are committee-entered before anyone
// ever logs in (see db/schema.sql's comment on `members`), so this
// never creates a new member row — it only creates the `users` login
// row for a member row that already exists, and links the two.
//
// Claiming is two steps so only the owner of the roster email can do it:
//   1. requestClaim — emails a one-time link to the address on the roster.
//   2. completeClaim — the link carries a token; presenting it proves
//      mailbox ownership, and only then is the password set.
//
// Works for status='pending' as well as 'active' (a member awaiting
// approval can still set a password ahead of time), but signing in — see
// auth.ts's activeMemberByEmail() — requires status='active'.

const TOKEN_TTL_MS = 60 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
const identifierFor = (email: string) => `claim:${email}`;

const REQUEST_SENT = "If that email is on the member roster, we've sent a verification link. It's valid for 1 hour.";

export async function requestClaim(_prevState: string | undefined, formData: FormData) {
  const email = formData.get("email");
  if (typeof email !== "string" || !email.includes("@")) return "Enter your email address.";
  const normalizedEmail = email.trim().toLowerCase();

  const [member] = await db
    .select()
    .from(members)
    .where(sql`lower(${members.email}) = ${normalizedEmail}`)
    .limit(1);

  // Same response whether or not a claimable record exists, so this form
  // can't be used to probe which emails are on the roster.
  if (!member || member.status === "suspended" || member.userId) return REQUEST_SENT;

  const identifier = identifierFor(normalizedEmail);
  const [recent] = await db
    .select({ expires: verificationTokens.expires })
    .from(verificationTokens)
    .where(
      and(
        eq(verificationTokens.identifier, identifier),
        gt(verificationTokens.expires, new Date(Date.now() + TOKEN_TTL_MS - RESEND_COOLDOWN_MS)),
      ),
    )
    .limit(1);
  if (recent) return REQUEST_SENT; // one was just sent — don't let the form be used to spam an inbox

  const token = randomBytes(32).toString("base64url");
  await db.delete(verificationTokens).where(eq(verificationTokens.identifier, identifier));
  await db.insert(verificationTokens).values({
    identifier,
    token: hashToken(token),
    expires: new Date(Date.now() + TOKEN_TTL_MS),
  });

  try {
    await sendClaimEmail(normalizedEmail, member.name, claimLink(token, normalizedEmail));
  } catch (error) {
    console.error("Sending claim email failed.", error);
    return "We couldn't send the email right now. Try again later or contact the committee.";
  }
  return REQUEST_SENT;
}

export async function completeClaim(_prevState: string | undefined, formData: FormData) {
  const email = formData.get("email");
  const token = formData.get("token");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (
    typeof email !== "string" ||
    typeof token !== "string" ||
    typeof password !== "string" ||
    typeof confirmPassword !== "string"
  ) {
    return "Missing fields.";
  }
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (password !== confirmPassword) return "Passwords don't match.";

  const normalizedEmail = email.trim().toLowerCase();
  const invalid = "This link is invalid or has expired. Request a new one.";

  // Consuming the token is the atomic step: delete..returning means a
  // token can be redeemed at most once even under concurrent requests.
  const [consumed] = await db
    .delete(verificationTokens)
    .where(
      and(
        eq(verificationTokens.identifier, identifierFor(normalizedEmail)),
        eq(verificationTokens.token, hashToken(token)),
        gt(verificationTokens.expires, new Date()),
      ),
    )
    .returning();
  if (!consumed) return invalid;

  const [member] = await db
    .select()
    .from(members)
    .where(sql`lower(${members.email}) = ${normalizedEmail}`)
    .limit(1);
  if (!member) return invalid;
  if (member.status === "suspended") return "This account has been suspended — contact the committee.";
  if (member.userId) return "This account has already been claimed. Sign in instead.";

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const [user] = await db.insert(users).values({ email: normalizedEmail, passwordHash, name: member.name }).returning();
    await db.update(members).set({ userId: user.id }).where(eq(members.id, member.id));
  } catch {
    return "Something went wrong claiming this account. Request a new link and try again.";
  }

  try {
    await signIn("credentials", { email: normalizedEmail, password, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      return member.status === "pending"
        ? "Account claimed. You can sign in once the committee approves your membership."
        : "Account claimed, but sign-in failed — try signing in manually.";
    }
    throw error; // NEXT_REDIRECT on success — must propagate
  }
}
