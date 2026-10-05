"use client";

import { useActionState } from "react";
import { updateAlbum, deleteAlbum } from "../actions";

const inputClasses = "h-11 w-full rounded-[10px] border border-border-input px-3 text-sm";
const labelClasses = "flex flex-col gap-1.5 text-sm font-semibold";

export function AlbumSettings({
  album,
  events,
  disciplines,
}: {
  album: { id: string; slug: string; name: string; eventId?: string; disciplineId?: string };
  events: { id: string; title: string }[];
  disciplines: { id: string; name: string }[];
}) {
  const [saveMessage, saveAction, savePending] = useActionState(updateAlbum.bind(null, album.id, album.slug), undefined);
  const [deleteMessage, deleteAction, deletePending] = useActionState(deleteAlbum.bind(null, album.id, album.slug), undefined);

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-border-default bg-white p-6">
      <h2 className="text-lg font-semibold">Album details</h2>
      <form action={saveAction} className="flex flex-col gap-4">
        <label className={labelClasses}>
          Album name
          <input name="name" defaultValue={album.name} required maxLength={120} className={inputClasses} />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className={labelClasses}>
            Event (optional)
            <select name="eventId" defaultValue={album.eventId ?? ""} className={inputClasses}>
              <option value="">— None —</option>
              {events.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}
            </select>
          </label>
          <label className={labelClasses}>
            Discipline (optional)
            <select name="disciplineId" defaultValue={album.disciplineId ?? ""} className={inputClasses}>
              <option value="">— None —</option>
              {disciplines.map((discipline) => <option key={discipline.id} value={discipline.id}>{discipline.name}</option>)}
            </select>
          </label>
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={savePending} className="h-10 rounded-full bg-brand-green px-4 text-sm font-semibold text-white disabled:opacity-60">
            {savePending ? "Saving…" : "Save album"}
          </button>
          {saveMessage && <span role="status" className="text-sm text-text-secondary">{saveMessage}</span>}
        </div>
      </form>

      <form
        action={deleteAction}
        onSubmit={(event) => {
          if (!window.confirm(`Delete the album “${album.name}”? This cannot be undone.`)) event.preventDefault();
        }}
        className="flex flex-wrap items-center gap-3 border-t border-border-default pt-4"
      >
        <button type="submit" disabled={deletePending} className="h-10 rounded-full border border-[#B3541E] px-4 text-sm font-semibold text-[#9C3D10] disabled:opacity-60">
          {deletePending ? "Deleting…" : "Delete empty album"}
        </button>
        {deleteMessage && <span role="status" className="text-sm text-[#9C3D10]">{deleteMessage}</span>}
        <p className="w-full text-xs text-text-secondary">An album can only be deleted after its photos are removed.</p>
      </form>
    </section>
  );
}
