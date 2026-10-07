import { inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { siteSettings } from "@/drizzle/schema";

// Every setting the committee can edit at /admin/settings. The values live in the
// site_settings table (key → text); a missing row means "not set".
export const SETTING_KEYS = [
  "org_name",
  "motto",
  "contact_email",
  "youtube_url",
  "facebook_url",
  "registration_fee",
  "registration_deadline",
] as const;
export type SettingKey = (typeof SETTING_KEYS)[number];
export type SiteSettings = Record<SettingKey, string>;

export const SETTING_DEFAULTS: SiteSettings = {
  org_name: "Batch 11, Khulna University",
  motto: "One as an individual, united as one",
  contact_email: "",
  youtube_url: "",
  facebook_url: "",
  registration_fee: "",
  registration_deadline: "",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const rows = await db.select().from(siteSettings).where(inArray(siteSettings.key, [...SETTING_KEYS]));
  const settings = { ...SETTING_DEFAULTS };
  for (const row of rows) {
    if ((SETTING_KEYS as readonly string[]).includes(row.key) && row.value.trim()) settings[row.key as SettingKey] = row.value;
  }
  return settings;
}

const formatDeadline = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso : new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(d);
};

// Fills the [AMOUNT] / [DEADLINE] markers in the reunion blog post and event text from
// the settings; while a value isn't set yet, the text says it's still to be announced
// instead of showing a raw bracket.
export function fillReunionPlaceholders(text: string, settings: SiteSettings): string {
  return text
    .replaceAll("[AMOUNT]", settings.registration_fee || "an amount to be announced")
    .replaceAll("[DEADLINE]", settings.registration_deadline ? formatDeadline(settings.registration_deadline) : "the deadline (to be announced)");
}

// Only http(s) links are ever rendered from settings (they end up in href attributes).
export function safeHttpUrl(value: string): string | undefined {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}
