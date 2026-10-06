"use client";

import { useActionState } from "react";
import { deletePhoto } from "../actions";

export function DeletePhotoForm({ photoId, albumSlug }: { photoId: string; albumSlug: string }) {
  const [message, action, pending] = useActionState(deletePhoto.bind(null, photoId, albumSlug), undefined);
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm("Delete this photo from the gallery? This cannot be undone.")) event.preventDefault();
      }}
      className="flex items-center gap-3"
    >
      <button type="submit" disabled={pending} className="h-9 rounded-full border border-[#B3541E] px-4 text-sm font-semibold text-[#9C3D10] disabled:opacity-60">
        {pending ? "Deleting…" : "Delete photo"}
      </button>
      {message && <span role="status" className="text-xs text-text-secondary">{message}</span>}
    </form>
  );
}
