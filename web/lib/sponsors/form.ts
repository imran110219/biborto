import { parseWebsite } from "@/lib/url";
import type { SponsorTier } from "@/lib/types";

// Plain module (a "use server" file may only export async functions).

export const SPONSOR_TIERS: SponsorTier[] = ["diamond", "gold", "silver", "bronze"];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface SponsorFormValues {
  name: string;
  tier: SponsorTier;
  website: string | null;
  businessId: string | null;
  active: boolean;
}

export function parseSponsorForm(formData: FormData): { error: string } | { values: SponsorFormValues } {
  const text = (key: string) => String(formData.get(key) ?? "").trim();
  const name = text("name");
  const tier = text("tier") as SponsorTier;
  const businessId = text("businessId");

  if (!name) return { error: "Name is required." };
  if (name.length > 120) return { error: "Name is too long (120 characters max)." };
  if (!SPONSOR_TIERS.includes(tier)) return { error: "Choose a valid tier." };
  if (businessId && !UUID.test(businessId)) return { error: "Choose a valid business." };
  const website = parseWebsite(text("website"));
  if (website === undefined) return { error: "Enter a valid website address (http or https)." };

  return { values: { name, tier, website, businessId: businessId || null, active: formData.get("active") === "on" } };
}
