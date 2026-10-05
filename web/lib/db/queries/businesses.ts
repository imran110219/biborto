import { and, count, eq, ilike, or, type SQL } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { businesses, members } from "@/drizzle/schema";
import { initialsOf } from "@/lib/db/format";
import type { AdminBusinessDetail, Business, BusinessCategory, BusinessStatus } from "@/lib/types";

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
  linkedinUrl: businesses.linkedinUrl,
  facebookUrl: businesses.facebookUrl,
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
  linkedinUrl: string | null;
  facebookUrl: string | null;
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
    linkedinUrl: row.linkedinUrl ?? undefined,
    facebookUrl: row.facebookUrl ?? undefined,
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

// Admin-only: every business regardless of status, with the real status
// (toBusiness() above always hardcodes "active" for the public queries,
// since their where clause guarantees it — this one carries the real
// column instead).
export async function getAdminBusinesses(): Promise<Business[]> {
  const rows = await db
    .select({ ...publicBusinessSelection, status: businesses.status })
    .from(businesses)
    .leftJoin(members, eq(members.id, businesses.ownerMemberId))
    .orderBy(businesses.name);

  return rows.map((row) => ({ ...toBusiness(row), status: row.status }));
}

// Backs the admin business edit form.
export async function getAdminBusinessBySlug(slug: string): Promise<AdminBusinessDetail | undefined> {
  const [row] = await db
    .select({
      slug: businesses.slug,
      name: businesses.name,
      category: businesses.category,
      city: businesses.city,
      status: businesses.status,
      tagline: businesses.tagline,
      description: businesses.description,
      offerings: businesses.offerings,
      testimonial: businesses.testimonial,
      phone: businesses.phone,
      email: businesses.email,
      website: businesses.website,
      linkedinUrl: businesses.linkedinUrl,
      facebookUrl: businesses.facebookUrl,
      ownerMemberId: businesses.ownerMemberId,
      ownerName: members.name,
      submittedAt: businesses.submittedAt,
    })
    .from(businesses)
    .leftJoin(members, eq(members.id, businesses.ownerMemberId))
    .where(eq(businesses.slug, slug))
    .limit(1);

  if (!row) return undefined;

  return {
    slug: row.slug,
    name: row.name,
    category: row.category,
    city: row.city ?? "",
    status: row.status,
    tagline: row.tagline ?? "",
    description: row.description ?? "",
    offerings: row.offerings,
    testimonial: row.testimonial ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    website: row.website ?? "",
    linkedinUrl: row.linkedinUrl ?? "",
    facebookUrl: row.facebookUrl ?? "",
    ownerMemberId: row.ownerMemberId,
    ownerName: row.ownerName ?? "",
    submittedAt: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
      new Date(row.submittedAt),
    ),
  };
}

export const BUSINESSES_PAGE_SIZE = 25;
export const PUBLIC_BUSINESSES_PAGE_SIZE = 12;

export interface BusinessListFilters {
  q?: string;
  status?: BusinessStatus;
  category?: BusinessCategory;
  city?: string;
}

// Shared by the admin list, the public directory and the CSV export. Needs
// `members` joined (owner name is searchable) — every caller left-joins it.
function businessWhere(filters: BusinessListFilters, { publicOnly }: { publicOnly: boolean }) {
  const conditions: (SQL | undefined)[] = [];
  if (publicOnly) conditions.push(eq(businesses.status, "active"));
  else if (filters.status) conditions.push(eq(businesses.status, filters.status));

  const q = filters.q?.trim();
  if (q) {
    // Escape LIKE wildcards so a literal % or _ isn't treated as a pattern.
    const pattern = `%${q.replace(/[\\%_]/g, "\\$&")}%`;
    conditions.push(or(ilike(businesses.name, pattern), ilike(businesses.city, pattern), ilike(members.name, pattern)));
  }
  if (filters.category) conditions.push(eq(businesses.category, filters.category));
  if (filters.city) conditions.push(eq(businesses.city, filters.city));
  return and(...conditions);
}

async function businessPage(filters: BusinessListFilters & { page: number }, publicOnly: boolean, pageSize: number) {
  const where = businessWhere(filters, { publicOnly });
  const [{ total }] = await db
    .select({ total: count() })
    .from(businesses)
    .leftJoin(members, eq(members.id, businesses.ownerMemberId))
    .where(where);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, filters.page), pageCount);

  const rows = await db
    .select({ ...publicBusinessSelection, status: businesses.status })
    .from(businesses)
    .leftJoin(members, eq(members.id, businesses.ownerMemberId))
    .where(where)
    .orderBy(businesses.name)
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return { items: rows.map((row) => ({ ...toBusiness(row), status: row.status })), total, page, pageCount };
}

export const getAdminBusinessesPage = (filters: BusinessListFilters & { page: number }) =>
  businessPage(filters, false, BUSINESSES_PAGE_SIZE);

// Public directory: active listings only (status filter ignored).
export const getPublicBusinessesPage = (filters: BusinessListFilters & { page: number }) =>
  businessPage(filters, true, PUBLIC_BUSINESSES_PAGE_SIZE);

// Distinct cities among active listings, for the public city filter.
export async function getPublicBusinessCities(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ city: businesses.city })
    .from(businesses)
    .where(eq(businesses.status, "active"))
    .orderBy(businesses.city);
  return rows.map((r) => r.city).filter((c): c is string => !!c);
}

export interface BusinessExportRow {
  name: string;
  ownerName: string | null;
  ownerEmail: string | null;
  category: string;
  city: string | null;
  status: BusinessStatus;
  tagline: string | null;
  offerings: string[];
  phone: string | null;
  email: string | null;
  website: string | null;
  linkedinUrl: string | null;
  facebookUrl: string | null;
  submittedAt: string;
}

// Every row matching the filters (no pagination) — superadmin-gated by callers.
export async function getAdminBusinessesForExport(filters: BusinessListFilters): Promise<BusinessExportRow[]> {
  const rows = await db
    .select({
      name: businesses.name,
      ownerName: members.name,
      ownerEmail: members.email,
      category: businesses.category,
      city: businesses.city,
      status: businesses.status,
      tagline: businesses.tagline,
      offerings: businesses.offerings,
      phone: businesses.phone,
      email: businesses.email,
      website: businesses.website,
      linkedinUrl: businesses.linkedinUrl,
      facebookUrl: businesses.facebookUrl,
      submittedAt: businesses.submittedAt,
    })
    .from(businesses)
    .leftJoin(members, eq(members.id, businesses.ownerMemberId))
    .where(businessWhere(filters, { publicOnly: false }))
    .orderBy(businesses.name);
  return rows.map((r) => ({ ...r, submittedAt: new Date(r.submittedAt).toISOString().slice(0, 10) }));
}

export interface OwnerOption {
  id: string;
  name: string;
}

// Active members, for the owner <select> on the admin business form.
export async function getBusinessOwnerOptions(): Promise<OwnerOption[]> {
  return db
    .select({ id: members.id, name: members.name })
    .from(members)
    .where(eq(members.status, "active"))
    .orderBy(members.name);
}
