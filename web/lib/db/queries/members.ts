import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { members, disciplines, countries } from "@/drizzle/schema";
import { initialsOf, formatMonthYear } from "@/lib/db/format";
import type { PublicMember, PublicMemberDetail } from "@/lib/types";

// Same filter public_members (db/schema.sql) encodes — replicated here
// rather than selecting from the view directly, since this query also
// needs to join disciplines (the view only carries discipline_id, not
// the display name) and pick which columns to expose. See PublicMember's
// comment in lib/types.ts for why email/platformRole/status/studentId
// are never included.
export async function getPublicMembers(): Promise<PublicMember[]> {
  const rows = await db
    .select({
      id: members.id,
      slug: members.slug,
      name: members.name,
      discipline: disciplines.name,
      profession: members.profession,
      city: members.city,
      avatarKey: members.avatarKey,
    })
    .from(members)
    .innerJoin(disciplines, eq(disciplines.id, members.disciplineId))
    .where(and(eq(members.status, "active"), eq(members.isPublic, true)))
    .orderBy(members.name);

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    initials: initialsOf(row.name),
    discipline: row.discipline,
    profession: row.profession ?? "",
    city: row.city ?? "",
    avatarKey: row.avatarKey ?? undefined,
  }));
}

export async function getPublicMemberBySlug(slug: string): Promise<PublicMemberDetail | undefined> {
  const [row] = await db
    .select({
      id: members.id,
      slug: members.slug,
      name: members.name,
      discipline: disciplines.name,
      profession: members.profession,
      currentEmployer: members.currentEmployer,
      bio: members.bio,
      city: members.city,
      avatarKey: members.avatarKey,
      country: countries.name,
      linkedinUrl: members.linkedinUrl,
      facebookUrl: members.facebookUrl,
      websiteUrl: members.websiteUrl,
      joinedAt: members.joinedAt,
    })
    .from(members)
    .innerJoin(disciplines, eq(disciplines.id, members.disciplineId))
    .leftJoin(countries, eq(countries.id, members.countryId))
    .where(and(eq(members.slug, slug), eq(members.status, "active"), eq(members.isPublic, true)))
    .limit(1);

  if (!row) return undefined;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    initials: initialsOf(row.name),
    discipline: row.discipline,
    profession: row.profession ?? "",
    currentEmployer: row.currentEmployer ?? undefined,
    bio: row.bio ?? undefined,
    city: row.city ?? "",
    avatarKey: row.avatarKey ?? undefined,
    country: row.country ?? undefined,
    linkedinUrl: row.linkedinUrl ?? undefined,
    facebookUrl: row.facebookUrl ?? undefined,
    websiteUrl: row.websiteUrl ?? undefined,
    joinedAt: formatMonthYear(row.joinedAt),
  };
}
