"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export async function credentialsSignIn(_prevState: string | undefined, formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: (formData.get("callbackUrl") as string) || "/",
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
  await signIn("google", { redirectTo: (formData.get("callbackUrl") as string) || "/" });
}
