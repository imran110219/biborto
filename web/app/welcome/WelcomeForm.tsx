"use client";

import { useActionState } from "react";
import { signOut } from "next-auth/react";
import { completeOnboarding } from "./actions";
import { retainedFormSubmit } from "@/lib/use-retained-form";

export function WelcomeForm({ batchName, email, roll, discipline, suggestedName }: { batchName: string; email: string; roll: string; discipline: string; suggestedName: string }) {
  const [error, formAction, pending] = useActionState(completeOnboarding, undefined);

  return (
    <div className="flex w-full max-w-[460px] flex-col gap-6 rounded-3xl border border-border-default bg-white p-7 sm:p-9">
      <div>
        <h1 className="font-serif text-3xl font-medium">Welcome to {batchName}</h1>
        <p className="mt-1 text-text-secondary">Let&apos;s make sure this is you. The committee added you with these details:</p>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 rounded-2xl bg-brand-green-tint/50 p-4 text-sm">
        <dt className="text-text-secondary">Roll</dt>
        <dd className="font-mono font-semibold">{roll || "—"}</dd>
        <dt className="text-text-secondary">Discipline</dt>
        <dd className="font-semibold">{discipline || "—"}</dd>
        <dt className="text-text-secondary">Email</dt>
        <dd className="break-all font-semibold">{email}</dd>
      </dl>

      <form onSubmit={retainedFormSubmit(formAction)} method="post" className="flex flex-col gap-5">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Your full name
          <input
            name="name"
            required
            minLength={2}
            maxLength={100}
            defaultValue={suggestedName}
            autoComplete="name"
            placeholder="As your batchmates know you"
            className="h-[52px] rounded-xl border border-border-input px-4 font-normal"
          />
          <span className="text-xs font-normal text-text-secondary">You set this once. After that only the committee can change it.</span>
        </label>

        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="isPublic" defaultChecked className="mt-1 accent-brand-green" />
          <span>
            <span className="font-semibold">Show me in the member directory</span>
            <span className="block text-text-secondary">Your name, discipline and what you add to your profile. You can change this any time.</span>
          </span>
        </label>

        {error && (
          <p role="alert" className="rounded-xl bg-[#F8ECE4] px-4 py-3 text-sm text-[#9C3D10]">
            {error}
          </p>
        )}

        <button type="submit" disabled={pending} className="h-[52px] rounded-xl bg-brand-green font-semibold text-white disabled:opacity-60">
          {pending ? "Saving…" : "Yes, that's me — continue"}
        </button>
      </form>

      <p className="text-center text-sm text-text-secondary">
        Not you, or something looks wrong?{" "}
        <button type="button" onClick={() => void signOut({ redirectTo: "/signin" })} className="font-semibold text-brand-green">
          Sign out
        </button>{" "}
        and tell the committee.
      </p>
    </div>
  );
}
