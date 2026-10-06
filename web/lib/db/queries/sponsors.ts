import { and, eq, ilike, or, type SQL } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { businesses, sponsors } from "@/drizzle/schema";
import { initialsOf } from "@/lib/db/format";
import { getR2PublicUrl } from "@/lib/r2";
import type { Sponsor, SponsorTier } from "@/lib/types";

function logoUrlFor(key: string | null): string | undefined {
  if (!key) return undefined;
  try {
    return getR2PublicUrl(key);
  } catch {
    return undefined; // R2_PUBLIC_URL not configured — fall back to initials
  }
}

function toSponsor(row: typeof sponsors.$inferSelect, businessName?: string | null): Sponsor {
  return {
    id: row.id,
    initials: initialsOf(row.name),
    name: row.name,
    tier: row.tier,
    website: row.website ?? "",
    active: row.active,
    logoUrl: logoUrlFor(row.logoKey),
    businessId: row.businessId,
    businessName: businessName ?? undefined,
  };
}

// sponsor_tier's enum declaration order (diamond, gold, silver, bronze —
// see db/schema.sql) is also its sort order, so ordering by the column
// directly gives the display order the site wants with no extra logic.
export async function getActiveSponsors(): Promise<Sponsor[]> {
  const rows = await db.select().from(sponsors).where(eq(sponsors.active, true)).orderBy(sponsors.tier, sponsors.name);
  return rows.map((row) => toSponsor(row));
}

export interface SponsorListFilters {
  q?: string;
  tier?: SponsorTier;
  status?: "active" | "inactive";
}

// Admin-only: every sponsor regardless of active status, optionally filtered.
export async function getAdminSponsors(filters: SponsorListFilters = {}): Promise<Sponsor[]> {
  const conditions: (SQL | undefined)[] = [];
  const q = filters.q?.trim();
  if (q) {
    // Escape LIKE wildcards so a literal % or _ isn't treated as a pattern.
    const pattern = `%${q.replace(/[\\%_]/g, "\\$&")}%`;
    conditions.push(or(ilike(sponsors.name, pattern), ilike(sponsors.website, pattern), ilike(businesses.name, pattern)));
  }
  if (filters.tier) conditions.push(eq(sponsors.tier, filters.tier));
  if (filters.status) conditions.push(eq(sponsors.active, filters.status === "active"));

  const rows = await db
    .select({ sponsor: sponsors, businessName: businesses.name })
    .from(sponsors)
    .leftJoin(businesses, eq(businesses.id, sponsors.businessId))
    .where(and(...conditions))
    .orderBy(sponsors.tier, sponsors.name);
  return rows.map((r) => toSponsor(r.sponsor, r.businessName));
}

export async function getAdminSponsorById(id: string): Promise<Sponsor | undefined> {
  const [row] = await db
    .select({ sponsor: sponsors, businessName: businesses.name })
    .from(sponsors)
    .leftJoin(businesses, eq(businesses.id, sponsors.businessId))
    .where(eq(sponsors.id, id))
    .limit(1);
  return row ? toSponsor(row.sponsor, row.businessName) : undefined;
}

// The (at most one — a partial unique index guarantees it) active diamond
// sponsor, shown as "Sponsored by" on the events pages.
export async function getDiamondSponsor(): Promise<Sponsor | undefined> {
  const [row] = await db
    .select()
    .from(sponsors)
    .where(and(eq(sponsors.active, true), eq(sponsors.tier, "diamond")))
    .limit(1);
  return row ? toSponsor(row) : undefined;
}

export interface BusinessOption {
  id: string;
  name: string;
}

// Business Directory listings, for the optional "linked business" <select>.
export async function getSponsorBusinessOptions(): Promise<BusinessOption[]> {
  return db.select({ id: businesses.id, name: businesses.name }).from(businesses).orderBy(businesses.name);
}
