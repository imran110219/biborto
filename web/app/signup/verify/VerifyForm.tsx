"use client";

import { useActionState } from "react";
import Link from "next/link";
import { LockIcon } from "@/components/ui/icons";
import { completeClaim } from "../actions";

export function VerifyForm({ token, email }: { token: string; email: string }) {
  const [message, formAction, pending] = useActionState(completeClaim, undefined);

  return (
    <div className="flex w-full max-w-[420px] flex-col gap-[22px]">
      <div>
        <h1 className="font-serif text-3xl font-medium">Set your password</h1>
        <p className="mt-1 text-text-secondary">Email verified for {email}. Choose a password to finish claiming your account.</p>
      </div>

      {message && (
        <p role="alert" className="rounded-xl bg-[#F8ECE4] px-4 py-3 text-sm text-[#9C3D10]">
          {message}
        </p>
      )}

      <form action={formAction} className="flex flex-col gap-[22px]">
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="email" value={email} />
        {(["password", "confirmPassword"] as const).map((name) => (
          <label key={name} className="flex flex-col gap-1.5 text-sm font-semibold">
            {name === "password" ? "Password" : "Confirm password"}
            <span className="relative flex items-center">
              <span className="absolute left-3.5 text-text-secondary">
                <LockIcon size={16} />
              </span>
              <input
                type="password"
                name={name}
                required
                minLength={8}
                placeholder={name === "password" ? "At least 8 characters" : "Type it again"}
                className="h-[52px] w-full rounded-xl border border-border-input pl-11 pr-4 font-normal"
              />
            </span>
          </label>
        ))}
        <button
          type="submit"
          disabled={pending}
          className="flex h-[52px] items-center justify-center rounded-xl bg-brand-green font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Claiming…" : "Claim account"}
        </button>
      </form>
      <Link href="/signup" className="text-center text-sm font-semibold text-brand-green">
        Request a new link
      </Link>
    </div>
  );
}
