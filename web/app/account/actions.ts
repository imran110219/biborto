"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/auth-schema";
import { members } from "@/drizzle/schema";
import { parseSelfProfileForm } from "@/lib/members/form";
import { consume, formatWait, peek, reset } from "@/lib/security/rate-limit";
import { LIMITS } from "@/lib/security/limits";

// Self-service: every action here acts on the signed-in member only. The member
// id is resolved from the session (never taken from the form), and the profile
// action only writes the fields parseSelfProfileForm returns — identity and
// access fields (name, discipline, email, student ID, role, status) can't be
// changed from here.

async function currentMember() {
  const session = await auth();
  if (!session?.user?.id) return undefined;
  const [member] = await db
    .select({ id: members.id, slug: members.slug, status: members.status })
    .from(members)
    .where(eq(members.userId, session.user.id))
    .limit(1);
  return member?.status === "active" ? member : undefined;
}

export async function updateMyProfile(_prevState: string | undefined, formData: FormData) {
  const member = await currentMember();
  if (!member) return "Sign in again to update your profile.";

  const parsed = parseSelfProfileForm(formData);
  if ("error" in parsed) return parsed.error;

  try {
    await db.update(members).set(parsed.values).where(eq(members.id, member.id));
  } catch (error) {
    const code = (error as { code?: string; cause?: { code?: string } }).code ?? (error as { cause?: { code?: string } }).cause?.code;
    if (code === "23503") return "Choose a valid country."; // country_id foreign key
    throw error;
  }

  revalidatePath("/account");
  revalidatePath("/members");
  revalidatePath(`/members/${member.slug}`);
  revalidatePath("/admin/members");
  redirect("/account?saved=1");
}

export type PasswordState = { ok: boolean; message: string } | undefined;

export async function changePassword(_prevState: PasswordState, formData: FormData): Promise<PasswordState> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "Sign in again to change your password." };

  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (next.length < 8) return { ok: false, message: "New password must be at least 8 characters." };
  if (next.length > 200) return { ok: false, message: "New password is too long." };
  if (next !== confirm) return { ok: false, message: "New passwords don't match." };

  const [user] = await db.select({ id: users.id, passwordHash: users.passwordHash }).from(users).where(eq(users.id, session.user.id)).limit(1);
  if (!user) return { ok: false, message: "Sign in again to change your password." };

  // Guessing the current password from a hijacked session is the attack this stops.
  const lockKey = `pwchange:user:${user.id}`;
  const lock = await peek(lockKey, LIMITS.passwordChange);
  if (lock.blocked) return { ok: false, message: `Too many incorrect attempts. Try again in ${formatWait(lock.retryAfterSeconds)}.` };

  // A Google-only account has no password yet, so there's nothing to confirm —
  // the live session is the proof. Everyone else must give their current one.
  if (user.passwordHash) {
    if (!current || !(await bcrypt.compare(current, user.passwordHash))) {
      await consume(lockKey, LIMITS.passwordChange);
      return { ok: false, message: "Your current password is incorrect." };
    }
    if (await bcrypt.compare(next, user.passwordHash)) {
      return { ok: false, message: "Choose a password different from your current one." };
    }
  }

  await db.update(users).set({ passwordHash: await bcrypt.hash(next, 10) }).where(eq(users.id, user.id));
  await reset(lockKey);
  return { ok: true, message: user.passwordHash ? "Password updated." : "Password set. You can now sign in with your email and password too." };
}
