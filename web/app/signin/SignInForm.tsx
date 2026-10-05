"use client";

import { useActionState, useEffect, useRef } from "react";
import { retainedFormSubmit } from "@/lib/use-retained-form";
import Link from "next/link";
import { LockIcon, MailIcon } from "@/components/ui/icons";
import { credentialsSignIn, devSuperadminSignIn, googleSignIn } from "./actions";

export function SignInForm({ callbackUrl }: { callbackUrl: string }) {
  const [error, formAction, pending] = useActionState(credentialsSignIn, undefined);
  const passwordRef = useRef<HTMLInputElement>(null);

  // The email stays after a failed attempt (retainedFormSubmit), the password doesn't.
  useEffect(() => {
    if (!pending && error && passwordRef.current) passwordRef.current.value = "";
  }, [pending, error]);

  return (
    <div className="flex w-full max-w-[420px] flex-col gap-[22px]">
      <div>
        <h2 className="font-serif text-3xl font-medium">Sign in</h2>
        <p className="mt-1 text-text-secondary">Use the email you registered with.</p>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-[#F8ECE4] px-4 py-3 text-sm text-[#9C3D10]">
          {error}
        </p>
      )}

      <form onSubmit={retainedFormSubmit(formAction)} className="flex flex-col gap-[22px]">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />

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

        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Password
          <span className="relative flex items-center">
            <span className="absolute left-3.5 text-text-secondary">
              <LockIcon size={16} />
            </span>
            <input
              ref={passwordRef}
              type="password"
              name="password"
              required
              placeholder="Your password"
              className="h-[52px] w-full rounded-xl border border-border-input pl-11 pr-4 font-normal"
            />
          </span>
        </label>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2.5">
            <input type="checkbox" className="h-[18px] w-[18px] accent-brand-green" />
            Keep me signed in
          </label>
          <Link href="#" className="font-semibold text-brand-green">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="flex h-[52px] items-center justify-center rounded-xl bg-brand-green text-white font-semibold disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="flex items-center gap-3 text-sm text-text-secondary">
        <span className="h-px flex-1 bg-border-default" />
        or
        <span className="h-px flex-1 bg-border-default" />
      </div>

      <form action={googleSignIn}>
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <button
          type="submit"
          className="flex h-[52px] w-full items-center justify-center rounded-xl border border-border-input bg-white font-semibold"
        >
          Continue with Google
        </button>
      </form>

      {process.env.NODE_ENV === "development" && (
        <form action={devSuperadminSignIn}>
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <button
            type="submit"
            className="flex h-[44px] w-full items-center justify-center rounded-xl border border-dashed border-border-input text-sm font-semibold text-text-secondary"
          >
            Dev: sign in as superadmin
          </button>
        </form>
      )}

      <p className="text-center text-sm text-text-secondary">
        Not registered yet?{" "}
        <Link href="/signup" className="font-semibold text-brand-green">
          Request membership
        </Link>
      </p>
      <Link href="/" className="text-center text-sm font-semibold text-brand-green">
        Back to the public site
      </Link>
    </div>
  );
}
