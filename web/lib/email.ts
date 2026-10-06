import { Resend } from "resend";

// Base URL used inside emailed links. Taken from config, never from the
// request's Host header, so a forged Host can't point a verification
// link at an attacker's domain.
function appUrl(): string {
  const url = process.env.APP_URL ?? process.env.AUTH_URL;
  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://localhost:3000";
  throw new Error("APP_URL is not set.");
}

export function claimLink(token: string, email: string): string {
  const params = new URLSearchParams({ token, email });
  return `${appUrl()}/signup/verify?${params}`;
}

export async function sendClaimEmail(to: string, name: string, link: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV === "production") throw new Error("RESEND_API_KEY is not set.");
    console.info(`[dev] RESEND_API_KEY not set — claim link for ${to}: ${link}`);
    return;
  }

  const from = process.env.EMAIL_FROM;
  if (!from) throw new Error("EMAIL_FROM is not set.");

  const { error } = await new Resend(apiKey).emails.send({
    from,
    to,
    subject: "Verify your Batch 11 account",
    text: `Hi ${name},\n\nUse this link to set your password and claim your Batch 11 account (valid for 1 hour):\n\n${link}\n\nIf you didn't ask for this, you can ignore this email.`,
  });
  if (error) throw new Error(`Resend failed: ${error.message}`);
}

export function resetLink(token: string, email: string): string {
  const params = new URLSearchParams({ token, email });
  return `${appUrl()}/reset-password?${params}`;
}

export async function sendPasswordResetEmail(to: string, name: string, link: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV === "production") throw new Error("RESEND_API_KEY is not set.");
    console.info(`[dev] RESEND_API_KEY not set — password reset link for ${to}: ${link}`);
    return;
  }

  const from = process.env.EMAIL_FROM;
  if (!from) throw new Error("EMAIL_FROM is not set.");

  const { error } = await new Resend(apiKey).emails.send({
    from,
    to,
    subject: "Reset your Batch 11 password",
    text: `Hi ${name},\n\nUse this link to choose a new password for your Batch 11 account (valid for 1 hour):\n\n${link}\n\nIf you didn't ask for this, you can ignore this email — your password won't change.`,
  });
  if (error) throw new Error(`Resend failed: ${error.message}`);
}
