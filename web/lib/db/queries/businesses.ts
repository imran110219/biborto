import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { businesses, members } from "@/drizzle/schema";
import { initialsOf } from "@/lib/db/format";
import type { Business } from "@/lib/types";

// public_businesses (db/schema.sql) doesn't carry owner_member_id — it's
// a pure public-safe column projection. Owner name needs a join, so
// this queries the base table directly with the same status filter the
// view encodes, rather than selecting from the view and joining after.
const publicBusinessSelection = {
  slug: businesses.slug,
  name: businesses.name,
  category: businesses.category,
  ownerName: members.name,
  city: businesses.city,
  submittedAt: businesses.submittedAt,
  tagline: businesses.tagline,
  description: businesses.description,
  offerings: businesses.offerings,
  testimonial: businesses.testimonial,
  phone: businesses.phone,
  email: businesses.email,
  website: businesses.website,
} as const;

function toBusiness(row: {
  slug: string;
  name: string;
  category: string;
  ownerName: string | null;
  city: string | null;
  submittedAt: string;
  tagline: string | null;
  description: string | null;
  offerings: string[];
  testimonial: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
}): Business {
  return {
    slug: row.slug,
    initials: initialsOf(row.name),
    name: row.name,
    category: row.category,
    ownerName: row.ownerName ?? "",
    city: row.city ?? "",
    status: "active", // only status this query ever returns — see the where clause below
    submittedAt: new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(
      new Date(row.submittedAt)
    ),
    tagline: row.tagline ?? "",
    description: row.description ?? "",
    offerings: row.offerings,
    testimonial: row.testimonial ?? "",
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    website: row.website ?? undefined,
  };
}

export async function getPublicBusinesses(): Promise<Business[]> {
  const rows = await db
    .select(publicBusinessSelection)
    .from(businesses)
    .leftJoin(members, eq(members.id, businesses.ownerMemberId))
    .where(eq(businesses.status, "active"))
    .orderBy(businesses.name);

  return rows.map(toBusiness);
}

export async function getPublicBusinessBySlug(slug: string): Promise<Business | undefined> {
  const [row] = await db
    .select(publicBusinessSelection)
    .from(businesses)
    .leftJoin(members, eq(members.id, businesses.ownerMemberId))
    .where(and(eq(businesses.slug, slug), eq(businesses.status, "active")))
    .limit(1);

  return row ? toBusiness(row) : undefined;
}
