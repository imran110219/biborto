"use client";

import { useActionState } from "react";
import { updatePhotoCaption } from "../actions";

export function CaptionForm({ photoId, albumSlug, caption }: { photoId: string; albumSlug: string; caption: string }) {
  const [message, formAction, pending] = useActionState(updatePhotoCaption.bind(null, photoId, albumSlug), undefined);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input
        name="caption"
        defaultValue={caption}
        maxLength={250}
        placeholder="Caption"
        className="h-10 rounded-[10px] border border-border-input px-3 text-sm"
      />
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="h-9 rounded-full bg-brand-green px-4 text-sm font-semibold text-white disabled:opacity-60">
          {pending ? "Saving…" : "Save caption"}
        </button>
        {message && <span aria-live="polite" className="text-xs text-text-secondary">{message}</span>}
      </div>
    </form>
  );
}
