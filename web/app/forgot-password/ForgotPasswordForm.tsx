"use client";

import { useActionState } from "react";
import Link from "next/link";
import { MailIcon } from "@/components/ui/icons";
import { retainedFormSubmit } from "@/lib/use-retained-form";
import { requestPasswordReset } from "./actions";

export function ForgotPasswordForm() {
  const [message, formAction, pending] = useActionState(requestPasswordReset, undefined);

  return (
    <div className="flex w-full max-w-[420px] flex-col gap-[22px]">
      <div>
        <h1 className="font-serif text-3xl font-medium">Forgot your password?</h1>
        <p className="mt-1 text-text-secondary">Enter the email on your Batch 11 account and we&apos;ll send you a link to choose a new one.</p>
      </div>

      {message && (
        <p role="status" className="rounded-xl bg-[#F8F3E6] px-4 py-3 text-sm text-text-primary">
          {message}
        </p>
      )}

      <form onSubmit={retainedFormSubmit(formAction)} className="flex flex-col gap-[22px]">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Email
          <span className="relative flex items-center">
            <span className="absolute left-3.5 text-text-secondary">
              <MailIcon />
            </span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="h-[52px] w-full rounded-xl border border-border-input pl-11 pr-4 font-normal"
            />
          </span>
        </label>
        <button
          type="submit"
          disabled={pending}
          className="flex h-[52px] items-center justify-center rounded-xl bg-brand-green font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="text-center text-sm text-text-secondary">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-brand-green">
          Claim your account
        </Link>
      </p>
      <Link href="/signin" className="text-center text-sm font-semibold text-brand-green">
        Back to sign in
      </Link>
    </div>
  );
}
