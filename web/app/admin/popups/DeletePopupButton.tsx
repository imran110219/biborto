"use client";

import { deletePopup } from "@/app/admin/popups/actions";

export function DeletePopupButton({ id, title }: { id: string; title: string }) {
  return (
    <form
      action={deletePopup.bind(null, id)}
      onSubmit={(event) => {
        if (!window.confirm(`Delete the popup “${title}”? This cannot be undone.`)) event.preventDefault();
      }}
    >
      <button className="h-9 rounded-lg border border-border-input bg-white px-3 text-xs font-semibold text-[#9C3D10]">Delete</button>
    </form>
  );
}
