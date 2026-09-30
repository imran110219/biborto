"use server";

import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/auth-schema";
import { members } from "@/drizzle/schema";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

// "Claim" not "sign up": members are committee-entered before anyone
// ever logs in (see db/schema.sql's comment on `members`), so this
// never creates a new member row — it only creates the `users` login
// row for a member row that already exists, and links the two.
//
// Claiming works for status='pending' as well as 'active' (a member
// awaiting approval can still set a password ahead of time), but
// signing in — see auth.ts's activeMemberByEmail() — requires
// status='active'. A newly-claimed pending member's first sign-in
// attempt will correctly fail until the committee approves them.
export async function claimAccount(_prevState: string | undefined, formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (typeof email !== "string" || typeof password !== "string" || typeof confirmPassword !== "string") {
    return "Missing fields.";
  }
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (password !== confirmPassword) return "Passwords don't match.";

  const normalizedEmail = email.trim().toLowerCase();
  const [member] = await db
    .select()
    .from(members)
    .where(sql`lower(${members.email}) = ${normalizedEmail}`)
    .limit(1);
  if (!member) return "No member record found for this email — contact the committee.";
  if (member.status === "suspended") return "This account has been suspended — contact the committee.";
  if (member.userId) return "This account has already been claimed. Sign in instead.";

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const [user] = await db.insert(users).values({ email: normalizedEmail, passwordHash, name: member.name }).returning();
    await db.update(members).set({ userId: user.id }).where(eq(members.id, member.id));
  } catch {
    return "Something went wrong claiming this account. Try again.";
  }

  try {
    await signIn("credentials", { email: normalizedEmail, password, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      // Claimed successfully but sign-in was rejected — the only way
      // that happens right after claiming is a pending member (correct:
      // they need committee approval first, not a bug).
      return member.status === "pending"
        ? "Account claimed. You can sign in once the committee approves your membership."
        : "Account claimed, but sign-in failed — try signing in manually.";
    }
    throw error; // NEXT_REDIRECT on success — must propagate
  }
}
