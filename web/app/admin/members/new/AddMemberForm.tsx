"use client";

import { useActionState } from "react";
import { createMember } from "../actions";
import { retainedFormSubmit } from "@/lib/use-retained-form";
import type { DisciplineOption } from "@/lib/db/queries/disciplines";

const input = "h-11 w-full rounded-[10px] border border-border-input bg-white px-3 text-sm";

export function AddMemberForm({ disciplines }: { disciplines: DisciplineOption[] }) {
  const [error, formAction, pending] = useActionState(createMember, undefined);

  return (
    <form onSubmit={retainedFormSubmit(formAction)} method="post" className="flex flex-col gap-5 rounded-2xl border border-border-default bg-white p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Email
          <input name="email" type="email" required maxLength={200} placeholder="name@example.com" autoComplete="off" className={input} />
          <span className="text-xs font-normal text-text-secondary">The address they will sign in with. A Gmail address lets them use Google.</span>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Roll (student ID)
          <input name="studentId" required maxLength={20} placeholder="110201" inputMode="numeric" autoComplete="off" className={`${input} font-mono`} />
          <span className="text-xs font-normal text-text-secondary">Unique per member. The discipline is read from it.</span>
        </label>
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-semibold sm:max-w-[420px]">
        Discipline <span className="font-normal text-text-secondary">(optional — only if the roll doesn&apos;t give it)</span>
        <select name="disciplineId" defaultValue="" className={input}>
          <option value="">Work it out from the roll</option>
          {disciplines.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </label>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <button type="submit" disabled={pending} className="h-11 self-start rounded-full bg-brand-green px-5 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "Adding…" : "Add member"}
      </button>
    </form>
  );
}
