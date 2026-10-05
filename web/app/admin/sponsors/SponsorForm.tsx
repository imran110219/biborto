"use client";

import { useActionState } from "react";
import { retainedFormSubmit } from "@/lib/use-retained-form";
import Link from "next/link";
import type { Sponsor } from "@/lib/types";

const inputClasses = "h-11 w-full rounded-[10px] border border-border-input px-3 text-sm";
const labelClasses = "flex flex-col gap-1.5 text-sm font-semibold";

type SponsorFormAction = (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;

export function SponsorForm({ sponsor, action, submitLabel }: { sponsor?: Sponsor; action: SponsorFormAction; submitLabel: string }) {
  const [error, formAction, pending] = useActionState(action, undefined);

  return (
    <form onSubmit={retainedFormSubmit(formAction)} className="flex flex-col gap-5">
      {error && <p className="rounded-xl bg-[#FBEAE3] px-4 py-3 text-sm text-[#9C3D10]">{error}</p>}

      <label className={labelClasses}>
        Name
        <input name="name" defaultValue={sponsor?.name} required className={inputClasses} />
      </label>

      <label className={labelClasses}>
        Tier
        <select name="tier" defaultValue={sponsor?.tier ?? "bronze"} className={inputClasses}>
          <option value="diamond">Diamond</option>
          <option value="gold">Gold</option>
          <option value="silver">Silver</option>
          <option value="bronze">Bronze</option>
        </select>
      </label>

      <label className={labelClasses}>
        Website
        <input name="website" defaultValue={sponsor?.website} placeholder="https://" className={inputClasses} />
      </label>

      <label className="flex items-center gap-2.5 text-sm font-semibold">
        <input type="checkbox" name="active" defaultChecked={sponsor?.active ?? true} className="h-4 w-4" />
        Active
      </label>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-[10px] bg-brand-green px-5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        <Link
          href="/admin/sponsors"
          className="flex h-11 items-center rounded-[10px] border border-border-input px-5 text-sm font-semibold"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
