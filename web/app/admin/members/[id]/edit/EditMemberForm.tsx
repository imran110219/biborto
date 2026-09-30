"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updateMember } from "@/app/admin/members/actions";
import type { AdminMemberDetail } from "@/lib/types";
import type { DisciplineOption } from "@/lib/db/queries/disciplines";

const inputClasses = "h-11 w-full rounded-[10px] border border-border-input px-3 text-sm";
const labelClasses = "flex flex-col gap-1.5 text-sm font-semibold";

export function EditMemberForm({
  member,
  disciplines,
}: {
  member: AdminMemberDetail;
  disciplines: DisciplineOption[];
}) {
  const [error, formAction, pending] = useActionState(updateMember.bind(null, member.id), undefined);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {error && <p className="rounded-xl bg-[#FBEAE3] px-4 py-3 text-sm text-[#9C3D10]">{error}</p>}

      <label className={labelClasses}>
        Name
        <input name="name" defaultValue={member.name} required className={inputClasses} />
      </label>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
          Platform role
          <select name="platformRole" defaultValue={member.platformRole} className={inputClasses}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Superadmin</option>
          </select>
        </label>

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
      </div>

      <label className="flex items-center gap-2.5 text-sm font-semibold">
        <input type="checkbox" name="isPublic" defaultChecked={member.isPublic} className="h-4 w-4" />
        Show in the public member directory
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
          href="/admin/members"
          className="flex h-11 items-center rounded-[10px] border border-border-input px-5 text-sm font-semibold"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
