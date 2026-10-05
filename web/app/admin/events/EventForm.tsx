"use client";

import { useActionState } from "react";
import { retainedFormSubmit } from "@/lib/use-retained-form";
import Link from "next/link";
import { EVENT_CATEGORIES, type AdminEventDetail } from "@/lib/types";

const inputClasses = "h-11 w-full rounded-[10px] border border-border-input px-3 text-sm";
const textareaClasses = "w-full rounded-[10px] border border-border-input p-3 text-sm";
const labelClasses = "flex flex-col gap-1.5 text-sm font-semibold";

type EventFormAction = (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;

export function EventForm({ event, action, submitLabel }: { event?: AdminEventDetail; action: EventFormAction; submitLabel: string }) {
  const [error, formAction, pending] = useActionState(action, undefined);

  return (
    <form onSubmit={retainedFormSubmit(formAction)} className="flex flex-col gap-5">
      {error && <p className="rounded-xl bg-[#FBEAE3] px-4 py-3 text-sm text-[#9C3D10]">{error}</p>}

      <label className={labelClasses}>
        Title
        <input name="title" defaultValue={event?.title} required className={inputClasses} />
      </label>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <label className={labelClasses}>
          Date
          <input type="date" name="eventDate" defaultValue={event?.eventDate} required className={inputClasses} />
        </label>
        <label className={labelClasses}>
          Start time
          <input type="time" name="startTime" defaultValue={event?.startTime} className={inputClasses} />
        </label>
        <label className={labelClasses}>
          End time
          <input type="time" name="endTime" defaultValue={event?.endTime} className={inputClasses} />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label className={labelClasses}>
          Location
          <input name="location" defaultValue={event?.location} className={inputClasses} />
        </label>
        <label className={labelClasses}>
          Category
          <select name="category" defaultValue={event?.category ?? ""} className={inputClasses}>
            <option value="">No category</option>
            {EVENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className={labelClasses}>
        Description
        <textarea name="description" defaultValue={event?.description} rows={4} className={textareaClasses} />
      </label>

      <label className="flex items-center gap-2.5 text-sm font-semibold">
        <input type="checkbox" name="featured" defaultChecked={event?.featured} className="h-4 w-4" />
        Feature this event
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
          href="/admin/events"
          className="flex h-11 items-center rounded-[10px] border border-border-input px-5 text-sm font-semibold"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
