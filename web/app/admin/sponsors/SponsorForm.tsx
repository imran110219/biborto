"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { retainedFormSubmit } from "@/lib/use-retained-form";
import type { BusinessOption } from "@/lib/db/queries/sponsors";
import type { Sponsor, SponsorTier } from "@/lib/types";

const inputClasses = "h-11 w-full rounded-[10px] border border-border-input px-3 text-sm";
const labelClasses = "flex flex-col gap-1.5 text-sm font-semibold";

type SponsorFormAction = (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;

export function SponsorForm({
  sponsor,
  action,
  submitLabel,
  businesses,
  activeDiamond,
}: {
  sponsor?: Sponsor;
  action: SponsorFormAction;
  submitLabel: string;
  businesses: BusinessOption[];
  // The currently active diamond sponsor, if any — to warn that saving another one deactivates it.
  activeDiamond?: { id: string; name: string };
}) {
  const [error, formAction, pending] = useActionState(action, undefined);
  const [tier, setTier] = useState<SponsorTier>(sponsor?.tier ?? "bronze");
  const [active, setActive] = useState(sponsor?.active ?? true);
  const replacesDiamond = tier === "diamond" && active && !!activeDiamond && activeDiamond.id !== sponsor?.id;

  return (
    <form onSubmit={retainedFormSubmit(formAction)} className="flex flex-col gap-5">
      <section className="flex flex-col gap-4 rounded-2xl border border-border-default bg-white p-5 sm:p-6">
        <label className={labelClasses}>
          Name
          <input name="name" defaultValue={sponsor?.name} required maxLength={120} className={inputClasses} />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClasses}>
            Tier
            <select name="tier" value={tier} onChange={(e) => setTier(e.target.value as SponsorTier)} className={inputClasses}>
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
        </div>

        <label className={labelClasses}>
          Linked business <span className="font-normal text-text-secondary">(optional — a Business Directory listing)</span>
          <select name="businessId" defaultValue={sponsor?.businessId ?? ""} className={inputClasses}>
            <option value="">No linked business</option>
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="active" checked={active} onChange={(e) => setActive(e.target.checked)} className="mt-0.5 h-4 w-4 accent-brand-green" />
          <span>
            <span className="block font-semibold">Active</span>
            <span className="text-xs text-text-secondary">Inactive sponsors are hidden from the public site.</span>
          </span>
        </label>

        {tier === "diamond" && (
          <p className={`rounded-xl px-4 py-3 text-sm ${replacesDiamond ? "bg-[#F8F3E6] text-text-primary" : "bg-diamond-tint text-diamond"}`}>
            {replacesDiamond ? (
              <>
                Only one diamond sponsor can be active. Saving this will deactivate <strong>{activeDiamond.name}</strong>.
              </>
            ) : (
              "Only one diamond sponsor can be active at a time."
            )}
          </p>
        )}
      </section>

      <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-border-default bg-white/95 p-3 shadow-[0_-6px_20px_rgba(0,0,0,0.04)] backdrop-blur">
        <button type="submit" disabled={pending} className="h-11 rounded-[10px] bg-brand-green px-6 text-sm font-semibold text-white disabled:opacity-60">
          {pending ? "Saving…" : submitLabel}
        </button>
        <Link href="/admin/sponsors" className="flex h-11 items-center rounded-[10px] border border-border-input px-5 text-sm font-semibold">
          Cancel
        </Link>
        {error && (
          <p role="alert" className="min-w-0 flex-1 text-sm font-medium text-[#9C3D10]">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
