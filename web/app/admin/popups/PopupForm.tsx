"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createPopup, updatePopup } from "@/app/admin/popups/actions";
import { retainedFormSubmit } from "@/lib/use-retained-form";
import { DEFAULT_HEIGHT, MAX_HEIGHT, MAX_HTML_LENGTH, MIN_HEIGHT } from "@/lib/popups/form";
import type { Popup, PopupKind } from "@/lib/types";

const inputClasses = "h-11 w-full rounded-[10px] border border-border-input px-3 text-sm";
const labelClasses = "flex flex-col gap-1.5 text-sm font-semibold";

const SAMPLE_HTML = `<div style="display:flex;height:100%;align-items:center;justify-content:center;
  background:#0f3d2e;color:#fff;font-family:sans-serif;text-align:center;padding:24px">
  <div>
    <h2 style="margin:0 0 8px">Grand Reunion 2026</h2>
    <p style="margin:0 0 16px">Save the date — see you there!</p>
    <a href="https://example.com" style="color:#f5c26b">Learn more</a>
  </div>
</div>`;

export function PopupForm({ popup, mode }: { popup?: Popup; mode: "create" | "edit" }) {
  const creating = mode === "create";
  const [kind, setKind] = useState<PopupKind>(popup?.kind ?? "html");
  const [error, formAction, pending] = useActionState(
    creating ? createPopup : updatePopup.bind(null, popup?.id ?? ""),
    undefined,
  );
  // An image popup can't go live before it has an image (uploaded on the edit page).
  const canActivate = kind === "html" || !!popup?.imageUrl;

  return (
    <form onSubmit={retainedFormSubmit(formAction)} className="flex max-w-3xl flex-col gap-5">
      <section className="flex flex-col gap-4 rounded-2xl border border-border-default bg-white p-5 sm:p-6">
        <label className={labelClasses}>
          Title <span className="font-normal text-text-secondary">(admin label — visitors don&apos;t see it)</span>
          <input name="title" defaultValue={popup?.title} required maxLength={100} className={inputClasses} />
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1.5 text-sm font-semibold">Type</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["html", "Custom HTML", "Your own markup, CSS and JavaScript — including animations."],
                ["image", "Image / animated GIF", "A JPEG, PNG, WebP or animated GIF, optionally linking somewhere."],
              ] as const
            ).map(([value, title, hint]) => (
              <label
                key={value}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-sm ${
                  kind === value ? "border-brand-green bg-brand-green-tint/40" : "border-border-default"
                }`}
              >
                <input type="radio" name="kind" value={value} checked={kind === value} onChange={() => setKind(value)} className="mt-0.5 accent-brand-green" />
                <span>
                  <span className="block font-semibold">{title}</span>
                  <span className="text-xs text-text-secondary">{hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Both sections stay mounted so nothing typed is lost when switching type. */}
        <div hidden={kind !== "html"} className="flex flex-col gap-4">
          <label className={labelClasses}>
            HTML
            <textarea
              name="htmlContent"
              defaultValue={popup?.htmlContent}
              rows={14}
              maxLength={MAX_HTML_LENGTH}
              spellCheck={false}
              placeholder={SAMPLE_HTML}
              className="w-full rounded-[10px] border border-border-input p-3 font-mono text-xs leading-relaxed"
            />
            <span className="text-xs font-normal text-text-secondary">
              Runs in an isolated, sandboxed frame: scripts and CSS animations work, links open in a new tab, but it
              can&apos;t read the site or its cookies. Fill the frame with <code>height:100%</code>.
            </span>
          </label>
          <label className={`${labelClasses} sm:w-56`}>
            Frame height (px)
            <input
              type="number"
              name="heightPx"
              defaultValue={popup?.heightPx ?? DEFAULT_HEIGHT}
              min={MIN_HEIGHT}
              max={MAX_HEIGHT}
              className={inputClasses}
            />
          </label>
        </div>

        <div hidden={kind !== "image"} className="grid gap-4 sm:grid-cols-2">
          <label className={labelClasses}>
            Alt text
            <input name="altText" defaultValue={popup?.altText} maxLength={200} placeholder="Describe the image" className={inputClasses} />
          </label>
          <label className={labelClasses}>
            Link (optional)
            <input name="linkUrl" defaultValue={popup?.linkUrl} placeholder="https://" className={inputClasses} />
          </label>
          {creating && (
            <p className="text-sm text-text-secondary sm:col-span-2">You&apos;ll upload the image on the next step.</p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border-default bg-white p-5 sm:p-6">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="active"
            defaultChecked={popup?.active && canActivate}
            disabled={!canActivate}
            className="mt-0.5 h-4 w-4 accent-brand-green disabled:opacity-40"
          />
          <span>
            <span className="block font-semibold">Active</span>
            <span className="text-xs text-text-secondary">
              {canActivate
                ? "Shown on the home page every time it loads. Only one popup can be active — activating this turns the others off."
                : "Upload an image first (after saving), then you can activate this popup."}
            </span>
          </span>
        </label>
      </section>

      <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-border-default bg-white/95 p-3 shadow-[0_-6px_20px_rgba(0,0,0,0.04)] backdrop-blur">
        <button type="submit" disabled={pending} className="h-11 rounded-[10px] bg-brand-green px-6 text-sm font-semibold text-white disabled:opacity-60">
          {pending ? "Saving…" : creating ? "Create popup" : "Save changes"}
        </button>
        <Link href="/admin/popups" className="flex h-11 items-center rounded-[10px] border border-border-input px-5 text-sm font-semibold">
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
