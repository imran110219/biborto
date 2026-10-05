"use client";

import { useActionState } from "react";
import { retainedFormSubmit } from "@/lib/use-retained-form";
import { BUSINESS_CATEGORIES } from "@/lib/types";
import { submitBusiness } from "./actions";

const inputClasses = "h-11 w-full rounded-[10px] border border-border-input px-3 text-sm";
const textareaClasses = "w-full rounded-[10px] border border-border-input p-3 text-sm";
const labelClasses = "flex flex-col gap-1.5 text-sm font-semibold";

export function SubmitBusinessForm() {
  const [error, formAction, pending] = useActionState(submitBusiness, undefined);

  return (
    <form onSubmit={retainedFormSubmit(formAction)} className="flex flex-col gap-5">
      {error && <p className="rounded-xl bg-[#FBEAE3] px-4 py-3 text-sm text-[#9C3D10]">{error}</p>}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label className={labelClasses}>
          Business name
          <input name="name" required className={inputClasses} />
        </label>

        <label className={labelClasses}>
          Category
          <select name="category" defaultValue={BUSINESS_CATEGORIES[0]} className={inputClasses}>
            {BUSINESS_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClasses}>
          City
          <input name="city" className={inputClasses} />
        </label>

        <label className={labelClasses}>
          Tagline
          <input name="tagline" placeholder="One line describing what you do" className={inputClasses} />
        </label>

        <label className={labelClasses}>
          Phone
          <input name="phone" className={inputClasses} />
        </label>

        <label className={labelClasses}>
          Email
          <input name="email" type="email" className={inputClasses} />
        </label>

        <label className={labelClasses}>
          Website
          <input name="website" placeholder="https://" className={inputClasses} />
        </label>

        <label className={labelClasses}>
          LinkedIn
          <input name="linkedinUrl" placeholder="https://linkedin.com/company/…" className={inputClasses} />
        </label>

        <label className={labelClasses}>
          Facebook
          <input name="facebookUrl" placeholder="https://facebook.com/…" className={inputClasses} />
        </label>
      </div>

      <label className={labelClasses}>
        Description
        <textarea name="description" rows={4} className={textareaClasses} />
      </label>

      <label className={labelClasses}>
        Offerings (comma-separated)
        <input name="offerings" placeholder="Catering, event planning, ..." className={inputClasses} />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-xl bg-brand-green px-6 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit for review"}
      </button>
    </form>
  );
}
