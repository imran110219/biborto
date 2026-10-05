"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Video } from "@/lib/types";

const inputClasses = "h-11 w-full rounded-[10px] border border-border-input px-3 text-sm";
const labelClasses = "flex flex-col gap-1.5 text-sm font-semibold";

type VideoFormAction = (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;

export function VideoForm({
  video,
  action,
  submitLabel,
  events,
  disciplines,
}: {
  video?: Video;
  action: VideoFormAction;
  submitLabel: string;
  events: { id: string; title: string }[];
  disciplines: { id: string; name: string }[];
}) {
  const [error, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {error && <p className="rounded-xl bg-[#FBEAE3] px-4 py-3 text-sm text-[#9C3D10]">{error}</p>}

      <label className={labelClasses}>
        Title
        <input name="title" defaultValue={video?.title} required className={inputClasses} />
      </label>

      <label className={labelClasses}>
        YouTube URL
        <input name="youtubeUrl" defaultValue={video?.youtubeUrl} required placeholder="https://youtube.com/watch?v=..." className={inputClasses} />
      </label>

      <label className={labelClasses}>
        Event (optional)
        <select name="eventId" defaultValue={video?.eventId ?? ""} className={inputClasses}>
          <option value="">— None —</option>
          {events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>
      </label>

      <label className={labelClasses}>
        Discipline (optional)
        <select name="disciplineId" defaultValue={video?.disciplineId ?? ""} className={inputClasses}>
          <option value="">— None —</option>
          {disciplines.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
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
          href="/admin/videos"
          className="flex h-11 items-center rounded-[10px] border border-border-input px-5 text-sm font-semibold"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
