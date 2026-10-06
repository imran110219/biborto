"use client";

import { useEffect, useRef } from "react";
import { clearDraft, isEmptyDraft, writeDraft } from "@/lib/blog/draft";

const read = (form: HTMLFormElement, name: string) => {
  const el = form.elements.namedItem(name);
  return el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement ? el.value : "";
};

// Renders nothing. Placed inside the member submit <form>, it watches the form's
// fields and mirrors them into localStorage whenever they change (checked every
// 1.5 s, and again when the tab is hidden or closed). Polling the form — rather than
// listening for input events — also catches the rich-text editor, which updates its
// hidden `body` field from script, and the cover upload, which sets `coverKey`.
export function DraftAutosave({ storageKey, onSaved }: { storageKey: string; onSaved: (at: number) => void }) {
  const marker = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const form = marker.current?.closest("form");
    if (!form) return;

    const snapshot = () => ({
      title: read(form, "title"),
      body: read(form, "body"),
      coverKey: read(form, "coverKey"),
      category: read(form, "category"),
      tags: read(form, "tags"),
    });
    let last = JSON.stringify(snapshot()); // what's on screen now (blank, or the restored draft) isn't "new"

    const save = () => {
      const current = snapshot();
      const json = JSON.stringify(current);
      if (json === last) return;
      last = json;
      if (isEmptyDraft(current)) {
        clearDraft(storageKey); // the writer emptied the form — nothing worth keeping
        return;
      }
      const at = Date.now();
      if (writeDraft(storageKey, { ...current, savedAt: at })) onSaved(at);
    };

    const onHide = () => {
      if (document.visibilityState === "hidden") save();
    };
    const timer = window.setInterval(save, 1500);
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", save);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", save);
    };
  }, [storageKey, onSaved]);

  return <span ref={marker} hidden />;
}
