"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updateBusiness } from "@/app/admin/businesses/actions";
import { BUSINESS_CATEGORIES, type AdminBusinessDetail } from "@/lib/types";

const inputClasses = "h-11 w-full rounded-[10px] border border-border-input px-3 text-sm";
const textareaClasses = "w-full rounded-[10px] border border-border-input p-3 text-sm";
const labelClasses = "flex flex-col gap-1.5 text-sm font-semibold";

export function EditBusinessForm({ business }: { business: AdminBusinessDetail }) {
  const [error, formAction, pending] = useActionState(updateBusiness.bind(null, business.slug), undefined);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {error && <p className="rounded-xl bg-[#FBEAE3] px-4 py-3 text-sm text-[#9C3D10]">{error}</p>}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label className={labelClasses}>
          Name
          <input name="name" defaultValue={business.name} required className={inputClasses} />
        </label>

        <label className={labelClasses}>
          Category
          <select name="category" defaultValue={business.category} className={inputClasses}>
            {BUSINESS_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClasses}>
          City
          <input name="city" defaultValue={business.city} className={inputClasses} />
        </label>

        <label className={labelClasses}>
          Tagline
          <input name="tagline" defaultValue={business.tagline} className={inputClasses} />
        </label>

        <label className={labelClasses}>
          Phone
          <input name="phone" defaultValue={business.phone} className={inputClasses} />
        </label>

        <label className={labelClasses}>
          Email
          <input name="email" type="email" defaultValue={business.email} className={inputClasses} />
        </label>

        <label className={labelClasses}>
          Website
          <input name="website" defaultValue={business.website} className={inputClasses} />
        </label>
      </div>

      <label className={labelClasses}>
        Description
        <textarea name="description" defaultValue={business.description} rows={4} className={textareaClasses} />
      </label>

      <label className={labelClasses}>
        Offerings (comma-separated)
        <input name="offerings" defaultValue={business.offerings.join(", ")} className={inputClasses} />
      </label>

      <label className={labelClasses}>
        Testimonial
        <textarea name="testimonial" defaultValue={business.testimonial} rows={3} className={textareaClasses} />
      </label>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-[10px] bg-brand-green px-5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
        <Link
          href="/admin/businesses"
          className="flex h-11 items-center rounded-[10px] border border-border-input px-5 text-sm font-semibold"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
