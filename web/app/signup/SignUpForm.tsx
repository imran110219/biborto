"use client";

import { useActionState } from "react";
import Link from "next/link";
import { LockIcon, MailIcon } from "@/components/ui/icons";
import { claimAccount } from "./actions";

export function SignUpForm() {
  const [message, formAction, pending] = useActionState(claimAccount, undefined);

  return (
    <div className="flex w-full max-w-[420px] flex-col gap-[22px]">
      <div>
        <h2 className="font-serif text-3xl font-medium">Request membership</h2>
        <p className="mt-1 text-text-secondary">
          Use the email the committee already has on file for you — this claims your existing member record,
          it doesn&apos;t create a new one.
        </p>
      </div>

      {message && (
        <p role="alert" className="rounded-xl bg-[#F8ECE4] px-4 py-3 text-sm text-[#9C3D10]">
          {message}
        </p>
      )}

      <form action={formAction} className="flex flex-col gap-[22px]">
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
              type="password"
              name="password"
              required
              minLength={8}
              placeholder="At least 8 characters"
              className="h-[52px] w-full rounded-xl border border-border-input pl-11 pr-4 font-normal"
            />
          </span>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Confirm password
          <span className="relative flex items-center">
            <span className="absolute left-3.5 text-text-secondary">
              <LockIcon size={16} />
            </span>
            <input
              type="password"
              name="confirmPassword"
              required
              minLength={8}
              placeholder="Type it again"
              className="h-[52px] w-full rounded-xl border border-border-input pl-11 pr-4 font-normal"
            />
          </span>
        </label>

        <button
          type="submit"
          disabled={pending}
          className="flex h-[52px] items-center justify-center rounded-xl bg-brand-green text-white font-semibold disabled:opacity-60"
        >
          {pending ? "Claiming…" : "Claim account"}
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
