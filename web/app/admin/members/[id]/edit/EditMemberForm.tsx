"use client";

import { startTransition, useActionState } from "react";
import type { FormEvent } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { createMember, updateMember } from "@/app/admin/members/actions";
import type { AdminMemberDetail } from "@/lib/types";
import type { DisciplineOption } from "@/lib/db/queries/disciplines";
import type { CountryOption } from "@/lib/db/queries/countries";

const inputClasses = "h-11 w-full rounded-[10px] border border-border-input px-3 text-sm";
const textareaClasses = "w-full rounded-[10px] border border-border-input px-3 py-2.5 text-sm";
const labelClasses = "flex flex-col gap-1.5 text-sm font-semibold text-text-primary";
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const FORM_ID = "member-edit-form";

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

export function EditMemberForm({
  member,
  disciplines,
  countries,
  returnTo,
  mode = "edit",
}: {
  member: AdminMemberDetail;
  disciplines: DisciplineOption[];
  countries: CountryOption[];
  returnTo: string;
  mode?: "edit" | "create";
}) {
  const creating = mode === "create";
  const [error, formAction, pending] = useActionState(
    creating ? createMember : updateMember.bind(null, member.id),
    undefined,
  );

  // Submitted via onSubmit rather than the form's `action` prop: React resets
  // uncontrolled fields after an action finishes, which would wipe everything
  // typed whenever validation fails.
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => formAction(data));
  };

  return (
    <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-5">
      <input type="hidden" name="returnTo" value={returnTo} />
      <Card title="Profile" hint="Shown on the public member directory when the profile is public.">
        <label className={`${labelClasses} sm:col-span-2`}>
          Name
          <input name="name" defaultValue={member.name} required className={inputClasses} />
        </label>
        <label className={labelClasses}>
          Discipline
          <select name="disciplineId" defaultValue={member.disciplineId ?? ""} className={inputClasses}>
            <option value="">Not provided</option>
            {disciplines.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClasses}>
          Campus name
          <input name="campusName" defaultValue={member.campusName} className={inputClasses} />
        </label>
        <label className={`${labelClasses} sm:col-span-2`}>
          Short bio
          <textarea name="shortBio" defaultValue={member.shortBio} rows={2} className={textareaClasses} />
        </label>
        <label className={`${labelClasses} sm:col-span-2`}>
          Full bio
          <textarea name="bio" defaultValue={member.bio} rows={5} className={textareaClasses} />
        </label>
        <label className={labelClasses}>
          Favorite campus place
          <input name="favoriteCampusPlace" defaultValue={member.favoriteCampusPlace} className={inputClasses} />
        </label>
        <label className={labelClasses}>
          Most memorable event
          <input name="mostMemorableEvent" defaultValue={member.mostMemorableEvent} className={inputClasses} />
        </label>
      </Card>

      <Card title="Work & location">
        <label className={labelClasses}>
          Profession
          <input name="profession" defaultValue={member.profession} className={inputClasses} />
        </label>
        <label className={labelClasses}>
          Current employer
          <input name="currentEmployer" defaultValue={member.currentEmployer} className={inputClasses} />
        </label>
        <label className={labelClasses}>
          City
          <input name="city" defaultValue={member.city} className={inputClasses} />
        </label>
        <label className={labelClasses}>
          Country
          <select name="countryId" defaultValue={member.countryId ?? ""} className={inputClasses}>
            <option value="">Not provided</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </Card>

      <Card title="Links">
        <label className={labelClasses}>
          LinkedIn URL
          <input type="url" name="linkedinUrl" defaultValue={member.linkedinUrl} placeholder="https://" className={inputClasses} />
        </label>
        <label className={labelClasses}>
          Facebook URL
          <input type="url" name="facebookUrl" defaultValue={member.facebookUrl} placeholder="https://" className={inputClasses} />
        </label>
        <label className={`${labelClasses} sm:col-span-2`}>
          Website URL
          <input type="url" name="websiteUrl" defaultValue={member.websiteUrl} placeholder="https://" className={inputClasses} />
        </label>
      </Card>

      <Card title="Private details" hint="Visible to admins only — never shown publicly.">
        <label className={labelClasses}>
          Email
          {creating ? (
            <input type="email" name="email" required autoComplete="off" placeholder="name@example.com" className={inputClasses} />
          ) : (
            <input value={member.email} readOnly disabled className={`${inputClasses} bg-bg-admin text-text-secondary`} />
          )}
        </label>
        <label className={labelClasses}>
          Phone number
          <input type="tel" name="phoneNumber" defaultValue={member.phoneNumber} className={inputClasses} />
        </label>
        <label className={labelClasses}>
          Student ID
          <input name="studentId" defaultValue={member.studentId} className={inputClasses} />
        </label>
        <label className={labelClasses}>
          Blood group
          <select name="bloodGroup" defaultValue={member.bloodGroup ?? ""} className={inputClasses}>
            <option value="">Not provided</option>
            {BLOOD_GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClasses}>
          Date of birth
          <input type="date" name="dateOfBirth" defaultValue={member.dateOfBirth} className={inputClasses} />
        </label>
      </Card>

      <div className="sticky bottom-0 z-10 -mx-1 flex flex-wrap items-center gap-3 rounded-2xl border border-border-default bg-white/95 p-3 shadow-[0_-6px_20px_rgba(0,0,0,0.04)] backdrop-blur">
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-[10px] bg-brand-green px-6 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? (creating ? "Adding…" : "Saving…") : creating ? "Add member" : "Save changes"}
        </button>
        <Link
          href={returnTo}
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

// Lives in the page sidebar, outside the <form> element in the DOM, so every
// control carries form={FORM_ID} to submit with it.
export function AccessCard({
  member,
  isSelf,
  canEditRole,
}: {
  member: AdminMemberDetail;
  isSelf: boolean;
  canEditRole: boolean;
}) {
  const roleLocked = !canEditRole || isSelf;
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border-default bg-white p-5 sm:p-6">
      <h2 className="font-serif text-xl font-medium">Access &amp; visibility</h2>

      <label className={labelClasses}>
        Status
        <select form={FORM_ID} name="status" defaultValue={member.status} disabled={isSelf} className={inputClasses}>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        {isSelf && (
          <>
            <input form={FORM_ID} type="hidden" name="status" value={member.status} />
            <span className="text-xs font-normal text-text-secondary">You can&apos;t change your own status.</span>
          </>
        )}
      </label>

      <label className={labelClasses}>
        Platform role
        <select
          form={FORM_ID}
          name="platformRole"
          defaultValue={member.platformRole}
          disabled={roleLocked}
          className={inputClasses}
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
          <option value="superadmin">Superadmin</option>
        </select>
        {roleLocked && (
          <>
            <input form={FORM_ID} type="hidden" name="platformRole" value={member.platformRole} />
            <span className="text-xs font-normal text-text-secondary">
              {isSelf ? "You can\u2019t change your own role." : "Only a superadmin can change roles."}
            </span>
          </>
        )}
      </label>

      <label className="flex items-start gap-3 rounded-xl bg-bg-admin p-3.5 text-sm">
        <input form={FORM_ID} type="checkbox" name="isPublic" defaultChecked={member.isPublic} className="mt-0.5 h-4 w-4 accent-brand-green" />
        <span>
          <span className="block font-semibold">Show in public directory</span>
          <span className="text-xs text-text-secondary">When off, the profile is hidden from visitors.</span>
        </span>
      </label>
    </section>
  );
}
