"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { signIn, signInLockSeconds } from "@/auth";
import { clientIp, formatWait } from "@/lib/security/rate-limit";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { members } from "@/drizzle/schema";

export async function credentialsSignIn(_prevState: string | undefined, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const callbackUrl = String(formData.get("callbackUrl") ?? "");
  let redirectTo = callbackUrl || "/";

  // Locked out after repeated failures? Say so instead of a misleading "wrong password".
  // (The lock is keyed on whatever email was typed, so this reveals nothing about accounts.)
  const lockedFor = await signInLockSeconds(email, clientIp(await headers()));
  if (lockedFor > 0) return `Too many sign-in attempts. Please wait ${formatWait(lockedFor)} and try again.`;

  if (!callbackUrl && email) {
    const [member] = await db
      .select({ platformRole: members.platformRole })
      .from(members)
      .where(sql`lower(${members.email}) = ${email}`)
      .limit(1);
    if (member?.platformRole === "admin" || member?.platformRole === "superadmin") {
      redirectTo = "/admin/dashboard";
    }
  }

  try {
    await signIn("credentials", {
      email,
      password: formData.get("password"),
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      // Deliberately generic — see auth.ts's authorize() comment on why
      // "wrong password" vs. "no such account" aren't distinguished.
      return "Invalid email or password.";
    }
    throw error; // NEXT_REDIRECT on success — must propagate, not be caught
  }
}

export async function googleSignIn(formData: FormData) {
  try {
    await signIn("google", { redirectTo: (formData.get("callbackUrl") as string) || "/" });
  } catch (error) {
    if (error instanceof AuthError && error.type === "AccessDenied") {
      redirect("/signup?request=pending");
    }
    throw error;
  }
}

// Development shortcut: one-click superadmin sign-in using SUPERADMIN_PASSWORD
// from the server env (never sent to the client). Hard-disabled outside
// `next dev` so it can't exist in a production build.
export async function devSuperadminSignIn(formData: FormData) {
  if (process.env.NODE_ENV !== "development") throw new Error("Not available outside development.");
  const password = process.env.SUPERADMIN_PASSWORD;
  if (!password) throw new Error("SUPERADMIN_PASSWORD is not set.");
  const callbackUrl = String(formData.get("callbackUrl") ?? "");
  await signIn("credentials", {
    email: (process.env.SUPERADMIN_EMAIL || "superadmin@biborto11.com").trim().toLowerCase(),
    password,
    redirectTo: callbackUrl || "/admin/dashboard",
  });
}
