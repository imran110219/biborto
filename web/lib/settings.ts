import { inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { siteSettings } from "@/drizzle/schema";

// Every setting the committee can edit at /admin/settings. The values live in the
// site_settings table (key → text); a missing row means "not set".
export const SETTING_KEYS = [
  "batch_name",
  "institution",
  "motto",
  "theme_color",
  "accent_color",
  "hero_description",
  "footer_description",
  "contact_email",
  "youtube_url",
  "facebook_url",
  "registration_fee",
  "registration_deadline",
] as const;
export type SettingKey = (typeof SETTING_KEYS)[number];
export type SiteSettings = Record<SettingKey, string>;

export const SETTING_DEFAULTS: SiteSettings = {
  batch_name: "Batch 11",
  institution: "Khulna University",
  motto: "One as an individual, united as one",
  theme_color: "#1e4a38",
  accent_color: "#9a6414",
  hero_description:
    "The home of Khulna University Batch 11. Find batchmates, read their stories, join the next reunion, and relive campus days in photos and videos.",
  footer_description: "The official space for Khulna University Batch 11 to stay connected.",
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

// The identity strings every page shares (header, footer, sign-in screens, page titles,
// emails). `logoText` is the number inside the round logo: the digits of the batch name
// ("Batch 11" → "11"), or its initials when it has none.
export interface Brand {
  batchName: string;
  institution: string;
  logoText: string;
}

export function brandOf(settings: SiteSettings): Brand {
  const batchName = settings.batch_name;
  const digits = batchName.match(/\d+/)?.[0];
  const initials = batchName.split(/\s+/).map((w) => w[0]).join("").slice(0, 3).toUpperCase();
  return { batchName, institution: settings.institution, logoText: digits ?? initials };
}

export async function getBrand(): Promise<Brand> {
  return brandOf(await getSiteSettings());
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
