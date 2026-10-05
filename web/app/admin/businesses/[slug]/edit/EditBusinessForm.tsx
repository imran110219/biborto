"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { createBusiness, updateBusiness } from "@/app/admin/businesses/actions";
import { retainedFormSubmit } from "@/lib/use-retained-form";
import { BUSINESS_CATEGORIES, type AdminBusinessDetail } from "@/lib/types";
import type { OwnerOption } from "@/lib/db/queries/businesses";

const inputClasses = "h-11 w-full rounded-[10px] border border-border-input px-3 text-sm";
const textareaClasses = "w-full rounded-[10px] border border-border-input px-3 py-2.5 text-sm";
const labelClasses = "flex flex-col gap-1.5 text-sm font-semibold";

function Card({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border-default bg-white p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="font-serif text-xl font-medium">{title}</h2>
        {hint && <p className="mt-0.5 text-sm text-text-secondary">{hint}</p>}
      </div>
      <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function EditBusinessForm({
  business,
  owners,
  mode = "edit",
}: {
  business: AdminBusinessDetail;
  owners: OwnerOption[];
  mode?: "edit" | "create";
}) {
  const creating = mode === "create";
  const [error, formAction, pending] = useActionState(
    creating ? createBusiness : updateBusiness.bind(null, business.slug),
    undefined,
  );

  return (
    <form onSubmit={retainedFormSubmit(formAction)} className="flex max-w-3xl flex-col gap-5">
      <Card title="Listing">
        <label className={`${labelClasses} sm:col-span-2`}>
          Name
          <input name="name" defaultValue={business.name} required maxLength={120} className={inputClasses} />
        </label>
        <label className={labelClasses}>
          Category
          <select name="category" defaultValue={business.category || BUSINESS_CATEGORIES[0]} className={inputClasses}>
            {BUSINESS_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClasses}>
          City
          <input name="city" defaultValue={business.city} maxLength={80} className={inputClasses} />
        </label>
        <label className={`${labelClasses} sm:col-span-2`}>
          Tagline
          <input name="tagline" defaultValue={business.tagline} maxLength={160} placeholder="One line describing what they do" className={inputClasses} />
        </label>
        <label className={`${labelClasses} sm:col-span-2`}>
          Description
          <textarea name="description" defaultValue={business.description} rows={5} className={textareaClasses} />
        </label>
        <label className={`${labelClasses} sm:col-span-2`}>
          Offerings (comma-separated)
          <input name="offerings" defaultValue={business.offerings.join(", ")} placeholder="Catering, event planning, ..." className={inputClasses} />
        </label>
        <label className={`${labelClasses} sm:col-span-2`}>
          Testimonial
          <textarea name="testimonial" defaultValue={business.testimonial} rows={3} className={textareaClasses} />
        </label>
      </Card>

      <Card title="Contact & links">
        <label className={labelClasses}>
          Phone
          <input name="phone" defaultValue={business.phone} maxLength={40} className={inputClasses} />
        </label>
        <label className={labelClasses}>
          Email
          <input name="email" type="email" defaultValue={business.email} className={inputClasses} />
        </label>
        <label className={`${labelClasses} sm:col-span-2`}>
          Website
          <input name="website" defaultValue={business.website} placeholder="https://" className={inputClasses} />
        </label>
        <label className={labelClasses}>
          LinkedIn
          <input name="linkedinUrl" defaultValue={business.linkedinUrl} placeholder="https://linkedin.com/company/…" className={inputClasses} />
        </label>
        <label className={labelClasses}>
          Facebook
          <input name="facebookUrl" defaultValue={business.facebookUrl} placeholder="https://facebook.com/…" className={inputClasses} />
        </label>
      </Card>

      <Card title="Ownership & status" hint="The owner is the member who runs the business. Only active listings appear in the public directory.">
        <label className={labelClasses}>
          Owner
          <select name="ownerMemberId" defaultValue={business.ownerMemberId ?? ""} className={inputClasses}>
            <option value="">No owner</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClasses}>
          Status
          <select name="status" defaultValue={business.status} className={inputClasses}>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>
      </Card>

      <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-border-default bg-white/95 p-3 shadow-[0_-6px_20px_rgba(0,0,0,0.04)] backdrop-blur">
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-[10px] bg-brand-green px-6 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? (creating ? "Adding…" : "Saving…") : creating ? "Add listing" : "Save changes"}
        </button>
        <Link
          href="/admin/businesses"
          className="flex h-11 items-center rounded-[10px] border border-border-input px-5 text-sm font-semibold"
        >
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
