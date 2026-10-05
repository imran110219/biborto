"use client";

import { useActionState, useRef } from "react";
import { createAlbum } from "./actions";

const inputClasses = "h-12 w-full rounded-xl border border-border-input bg-white px-3 font-normal";
const labelClasses = "flex flex-col gap-1.5 text-sm font-semibold";

export function CreateAlbumForm({
  events,
  disciplines,
}: {
  events: { id: string; title: string }[];
  disciplines: { id: string; name: string }[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, formAction, pending] = useActionState(async (prev: string | undefined, formData: FormData) => {
    const result = await createAlbum(prev, formData);
    if (!result) formRef.current?.reset();
    return result;
  }, undefined);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      {error && <p role="alert" className="rounded-xl bg-[#FBEAE3] px-4 py-3 text-sm text-[#9C3D10]">{error}</p>}
      <div className="grid gap-4 md:grid-cols-3">
        <label className={labelClasses}>
          Album name
          <input name="name" required maxLength={120} className={inputClasses} />
        </label>
        <label className={labelClasses}>
          Event (optional)
          <select name="eventId" defaultValue="" className={inputClasses}>
            <option value="">— None —</option>
            {events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
        </label>
        <label className={labelClasses}>
          Discipline (optional)
          <select name="disciplineId" defaultValue="" className={inputClasses}>
            <option value="">— None —</option>
            {disciplines.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </label>
      </div>
      <div>
        <button
          type="submit"
          disabled={pending}
          className="flex h-11 items-center justify-center rounded-full bg-brand-green px-5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create album"}
        </button>
      </div>
    </form>
  );
}
