"use client";

import { useActionState, useRef } from "react";
import { startTransition } from "react";
import { changePassword, type PasswordState } from "./actions";

const inputClasses = "h-11 w-full rounded-[10px] border border-border-input px-3 text-sm";
const labelClasses = "flex flex-col gap-1.5 text-sm font-semibold";

export function ChangePasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(async (prev: PasswordState, formData: FormData) => {
    const result = await changePassword(prev, formData);
    if (result?.ok) formRef.current?.reset(); // clear the three password boxes after success only
    return result;
  }, undefined);

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border-default bg-white p-5 sm:p-6">
      <div>
        <h2 className="font-serif text-xl font-medium">Password</h2>
        <p className="text-sm text-text-secondary">
          {hasPassword
            ? "Change the password you use to sign in with your email."
            : "You sign in with Google. Set a password if you also want to sign in with your email."}
        </p>
      </div>
      <form method="post"
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          startTransition(() => formAction(data));
        }}
        className="flex flex-col gap-4"
      >
        {hasPassword && (
          <label className={labelClasses}>
            Current password
            <input type="password" name="currentPassword" required autoComplete="current-password" className={inputClasses} />
          </label>
        )}
        <label className={labelClasses}>
          New password
          <input type="password" name="newPassword" required minLength={8} autoComplete="new-password" placeholder="At least 8 characters" className={inputClasses} />
        </label>
        <label className={labelClasses}>
          Confirm new password
          <input type="password" name="confirmPassword" required minLength={8} autoComplete="new-password" className={inputClasses} />
        </label>
        <button type="submit" disabled={pending} className="h-11 rounded-[10px] border border-brand-green px-5 text-sm font-semibold text-brand-green disabled:opacity-60">
          {pending ? "Saving…" : hasPassword ? "Change password" : "Set password"}
        </button>
        {state && (
          <p role={state.ok ? "status" : "alert"} className={`text-sm font-medium ${state.ok ? "text-brand-green" : "text-[#9C3D10]"}`}>
            {state.message}
          </p>
        )}
      </form>
    </section>
  );
}
