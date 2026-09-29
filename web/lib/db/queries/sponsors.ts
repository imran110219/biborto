import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { sponsors } from "@/drizzle/schema";
import { initialsOf } from "@/lib/db/format";
import type { Sponsor } from "@/lib/types";

// sponsor_tier's enum declaration order (diamond, gold, silver, bronze —
// see db/schema.sql) is also its sort order, so ordering by the column
// directly gives the display order the site wants with no extra logic.
export async function getActiveSponsors(): Promise<Sponsor[]> {
  const rows = await db.select().from(sponsors).where(eq(sponsors.active, true)).orderBy(sponsors.tier);

  return rows.map((row) => ({
    id: row.id,
    initials: initialsOf(row.name),
    name: row.name,
    tier: row.tier,
    website: row.website ?? "",
    active: row.active,
  }));
}

export async function getDiamondSponsor(): Promise<Sponsor | undefined> {
  const [row] = await db
    .select()
    .from(sponsors)
    .where(and(eq(sponsors.active, true), eq(sponsors.tier, "diamond")))
    .limit(1);

  if (!row) return undefined;

  return {
    id: row.id,
    initials: initialsOf(row.name),
    name: row.name,
    tier: row.tier,
    website: row.website ?? "",
    active: row.active,
  };
}
