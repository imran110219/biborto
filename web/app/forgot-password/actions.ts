"use server";

import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { and, eq, gt, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { users, verificationTokens } from "@/lib/db/auth-schema";
import { members } from "@/drizzle/schema";
import { resetLink, sendPasswordResetEmail } from "@/lib/email";

// Password reset for members who have already claimed their account. The
// mailbox on the roster is the proof of ownership: a one-time, hashed,
// one-hour token is emailed and then redeemed to set a new password — the same
// shape as the claim flow in app/signup/actions.ts, under its own token
// namespace so a claim link can never be used to reset (or vice versa).

const TOKEN_TTL_MS = 60 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
const identifierFor = (email: string) => `reset:${email}`;

// Same reply whatever the email is, so the form can't be used to probe which
// addresses are registered.
const REQUEST_SENT = "If that email belongs to a registered member, we've sent a password reset link. It's valid for 1 hour.";

export async function requestPasswordReset(_prevState: string | undefined, formData: FormData) {
  const email = formData.get("email");
  if (typeof email !== "string" || !email.includes("@")) return "Enter your email address.";
  const normalizedEmail = email.trim().toLowerCase();

  const [member] = await db
    .select({ name: members.name, status: members.status, userId: members.userId })
    .from(members)
    .where(sql`lower(${members.email}) = ${normalizedEmail}`)
    .limit(1);

  // Only claimed, non-suspended accounts can reset; everyone else gets the same reply.
  if (!member || !member.userId || member.status === "suspended") return REQUEST_SENT;

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
  if (recent) return REQUEST_SENT; // one was just sent — don't let the form spam an inbox

  const token = randomBytes(32).toString("base64url");
  await db.delete(verificationTokens).where(eq(verificationTokens.identifier, identifier));
  await db.insert(verificationTokens).values({ identifier, token: hashToken(token), expires: new Date(Date.now() + TOKEN_TTL_MS) });

  try {
    await sendPasswordResetEmail(normalizedEmail, member.name, resetLink(token, normalizedEmail));
  } catch (error) {
    console.error("Sending password reset email failed.", error);
    return "We couldn't send the email right now. Try again later or contact the committee.";
  }
  return REQUEST_SENT;
}

export async function completePasswordReset(_prevState: string | undefined, formData: FormData) {
  const email = formData.get("email");
  const token = formData.get("token");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (typeof email !== "string" || typeof token !== "string" || typeof password !== "string" || typeof confirmPassword !== "string") {
    return "Missing fields.";
  }
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (password.length > 200) return "Password is too long.";
  if (password !== confirmPassword) return "Passwords don't match.";

  const normalizedEmail = email.trim().toLowerCase();
  const invalid = "This link is invalid or has expired. Request a new one.";

  // delete..returning makes redemption atomic: a token works at most once.
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
    .select({ status: members.status, userId: members.userId })
    .from(members)
    .where(sql`lower(${members.email}) = ${normalizedEmail}`)
    .limit(1);
  if (!member?.userId) return invalid;
  if (member.status === "suspended") return "This account has been suspended — contact the committee.";

  await db.update(users).set({ passwordHash: await bcrypt.hash(password, 10) }).where(eq(users.id, member.userId));

  redirect("/signin?reset=1");
}
