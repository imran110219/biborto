"use client";

import { useActionState } from "react";
import { retainedFormSubmit } from "@/lib/use-retained-form";
import Link from "next/link";
import { MailIcon } from "@/components/ui/icons";
import { googleSignIn } from "@/app/signin/actions";
import { requestClaim } from "./actions";

export function SignUpForm({ requestPending = false }: { requestPending?: boolean }) {
  const [message, formAction, pending] = useActionState(requestClaim, undefined);

  return (
    <div className="flex w-full max-w-[420px] flex-col gap-[22px]">
      <div>
        <h2 className="font-serif text-3xl font-medium">Request membership</h2>
        <p className="mt-1 text-text-secondary">
          Gmail members can continue with Google below. Everyone else: enter your roster email and we&apos;ll send a link to set your password.
        </p>
      </div>

      {message && (
        <p role="status" className="rounded-xl bg-[#F8F3E6] px-4 py-3 text-sm text-text-primary">
          {message}
        </p>
      )}

      {requestPending && (
        <p role="status" className="rounded-xl bg-[#F8F3E6] px-4 py-3 text-sm text-text-primary">
          Access is waiting on admin review. A first-time Google sign-in sends a membership request; existing pending members can sign in after approval. If you already have an active membership, contact the committee for help.
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
              placeholder="you@example.com"
              className="h-[52px] w-full rounded-xl border border-border-input pl-11 pr-4 font-normal"
            />
          </span>
        </label>

        <button
          type="submit"
          disabled={pending}
          className="flex h-[52px] items-center justify-center rounded-xl bg-brand-green text-white font-semibold disabled:opacity-60"
        >
          {pending ? "Sending…" : "Email me a verification link"}
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs text-text-secondary">
        <span className="h-px flex-1 bg-border-input" />
        <span>OR</span>
        <span className="h-px flex-1 bg-border-input" />
      </div>
      <form action={googleSignIn}>
        <button
          type="submit"
          className="flex h-[52px] w-full items-center justify-center rounded-xl border border-border-input bg-white font-semibold text-text-primary"
        >
          Continue with Google
        </button>
      </form>

      <p className="text-center text-sm text-text-secondary">
        Already claimed your account?{" "}
        <Link href="/signin" className="font-semibold text-brand-green">
          Sign in
        </Link>
      </p>
      <Link href="/" className="text-center text-sm font-semibold text-brand-green">
        Back to the public site
      </Link>
    </div>
  );
}
