"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { siteSettings } from "@/drizzle/schema";
import { requireSuperadmin } from "@/lib/auth/require-admin";
import { logActivity } from "@/lib/activity";
import { SETTING_KEYS, safeHttpUrl, type SettingKey } from "@/lib/settings";
import { sql } from "drizzle-orm";

const MAX_LENGTH: Record<SettingKey, number> = {
  org_name: 100,
  contact_email: 120,
  youtube_url: 300,
  facebook_url: 300,
  registration_fee: 80,
  registration_deadline: 10,
};

// Returns an error string, or undefined (the state useActionState shows) on success;
// "saved" is returned as a distinct marker so the form can show a confirmation.
export async function saveSettings(_prev: string | undefined, formData: FormData): Promise<string | undefined> {
  const actorId = await requireSuperadmin();

  const values = {} as Record<SettingKey, string>;
  for (const key of SETTING_KEYS) values[key] = String(formData.get(key) ?? "").trim().slice(0, MAX_LENGTH[key] + 1);
  for (const key of SETTING_KEYS) if (values[key].length > MAX_LENGTH[key]) return "One of the fields is too long.";

  if (!values.org_name) return "Organization name is required.";
  if (values.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contact_email)) return "Enter a valid contact email address.";
  for (const key of ["youtube_url", "facebook_url"] as const) {
    if (values[key] && !safeHttpUrl(values[key])) return "Social links must be full http(s) addresses.";
  }
  if (values.registration_deadline && !/^\d{4}-\d{2}-\d{2}$/.test(values.registration_deadline)) return "Enter a valid registration deadline.";

  // An emptied field deletes its row ("not set"); the rest are upserted.
  for (const key of SETTING_KEYS) {
    if (values[key]) {
      await db
        .insert(siteSettings)
        .values({ key, value: values[key] })
        .onConflictDoUpdate({ target: siteSettings.key, set: { value: values[key] } });
    } else {
      await db.delete(siteSettings).where(sql`${siteSettings.key} = ${key}`);
    }
  }

  await logActivity({ actorId, action: "settings.updated", targetType: "settings", summary: "{actor} updated the site settings" });

  revalidatePath("/", "layout"); // footer + reunion text appear site-wide
  return "saved";
}
