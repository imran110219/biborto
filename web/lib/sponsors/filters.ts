import type { SponsorTier } from "@/lib/types";

const TIERS: SponsorTier[] = ["diamond", "gold", "silver", "bronze"];
const STATUSES = ["active", "inactive"] as const;
export type SponsorStatusFilter = (typeof STATUSES)[number];

type Raw = string | string[] | undefined;
const first = (v: Raw) => (Array.isArray(v) ? v[0] : v) ?? "";

export interface ParsedSponsorFilters {
  q: string;
  tier?: SponsorTier;
  status?: SponsorStatusFilter;
}

// Validates the admin sponsors list's URL params (?q=&tier=&status=).
export function parseSponsorFilters(sp: Record<string, Raw>): ParsedSponsorFilters {
  return {
    q: first(sp.q).slice(0, 100),
    tier: TIERS.find((t) => t === first(sp.tier)),
    status: STATUSES.find((s) => s === first(sp.status)),
  };
}
