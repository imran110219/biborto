"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { members } from "@/drizzle/schema";

export async function credentialsSignIn(_prevState: string | undefined, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const callbackUrl = String(formData.get("callbackUrl") ?? "");
  let redirectTo = callbackUrl || "/";

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
