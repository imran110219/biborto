"use client";

import { useActionState } from "react";
import { saveSettings } from "./actions";
import { retainedFormSubmit } from "@/lib/use-retained-form";
import type { SiteSettings } from "@/lib/settings";

const input = "h-11 rounded-lg border border-border-input px-3 font-normal disabled:bg-bg-admin disabled:text-text-secondary";
const card = "flex flex-col gap-4 rounded-2xl border border-border-default bg-white p-6";

export function SettingsForm({ settings, canEdit }: { settings: SiteSettings; canEdit: boolean }) {
  const [state, formAction, pending] = useActionState(saveSettings, undefined);
  const error = state && state !== "saved" ? state : undefined;

  return (
    <form onSubmit={retainedFormSubmit(formAction)} className="flex max-w-[640px] flex-col gap-6">
      <fieldset disabled={!canEdit || pending} className="contents">
        <section className={card}>
          <h2 className="font-semibold">Organization</h2>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Organization name
            <input name="org_name" defaultValue={settings.org_name} required maxLength={100} className={input} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Batch motto
            <input name="motto" defaultValue={settings.motto} required maxLength={100} className={input} />
            <span className="text-xs font-normal text-text-secondary">The headline on the home page. A comma starts a new line.</span>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Committee contact email
            <input name="contact_email" type="email" defaultValue={settings.contact_email} maxLength={120} placeholder="committee@example.com" className={input} />
            <span className="text-xs font-normal text-text-secondary">Shown as &ldquo;Contact the committee&rdquo; in the site footer. Leave empty to hide the link.</span>
          </label>
        </section>

        <section className={card}>
          <h2 className="font-semibold">Follow links</h2>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            YouTube channel URL
            <input name="youtube_url" type="url" defaultValue={settings.youtube_url} maxLength={300} placeholder="https://www.youtube.com/@…" className={input} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Facebook group URL
            <input name="facebook_url" type="url" defaultValue={settings.facebook_url} maxLength={300} placeholder="https://www.facebook.com/groups/…" className={input} />
            <span className="text-xs font-normal text-text-secondary">Links appear in the footer only when set.</span>
          </label>
        </section>

        <section className={card}>
          <h2 className="font-semibold">Grand Reunion defaults</h2>
          <p className="text-sm text-text-secondary">
            Fills the [AMOUNT] and [DEADLINE] markers in the reunion blog post and event page. Until set, those pages say the
            details are still to be announced.
          </p>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Registration fee
            <input name="registration_fee" defaultValue={settings.registration_fee} maxLength={80} placeholder="e.g. ৳500 per person" className={input} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Registration deadline
            <input name="registration_deadline" type="date" defaultValue={settings.registration_deadline} className={input} />
          </label>
        </section>
      </fieldset>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
      {state === "saved" && (
        <p role="status" className="rounded-xl bg-brand-green-tint px-4 py-3 text-sm font-medium text-brand-green">
          Settings saved.
        </p>
      )}
      {canEdit ? (
        <button type="submit" disabled={pending} className="h-11 self-start rounded-full bg-brand-green px-5 text-sm font-semibold text-white disabled:opacity-60">
          {pending ? "Saving…" : "Save changes"}
        </button>
      ) : (
        <p className="text-sm text-text-secondary">Only a superadmin can change settings.</p>
      )}
    </form>
  );
}
