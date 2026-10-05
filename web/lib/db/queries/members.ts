import { and, count, eq, ilike, or, type SQL } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { members, disciplines, countries } from "@/drizzle/schema";
import { initialsOf, formatMonthYear } from "@/lib/db/format";
import type { AdminMemberDetail, MemberStatus, PlatformRole, Member, PublicMember, PublicMemberDetail } from "@/lib/types";
import { getR2PublicUrl } from "@/lib/r2";

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
    .leftJoin(disciplines, eq(disciplines.id, members.disciplineId))
    .where(and(eq(members.status, "active"), eq(members.isPublic, true)))
    .orderBy(members.name);

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    initials: initialsOf(row.name),
    discipline: row.discipline ?? "Not provided",
    profession: row.profession ?? "",
    city: row.city ?? "",
    avatarKey: row.avatarKey ?? undefined,
    avatarUrl: row.avatarKey ? getR2PublicUrl(row.avatarKey) : undefined,
  }));
}

export async function getPublicMemberBySlug(slug: string): Promise<PublicMemberDetail | undefined> {
  const [row] = await db
    .select({
      id: members.id,
      slug: members.slug,
      name: members.name,
      discipline: disciplines.name,
      campusName: members.campusName,
      shortBio: members.shortBio,
      favoriteCampusPlace: members.favoriteCampusPlace,
      mostMemorableEvent: members.mostMemorableEvent,
      profession: members.profession,
      currentEmployer: members.currentEmployer,
      bio: members.bio,
      city: members.city,
      avatarKey: members.avatarKey,
      coverPhotoKey: members.coverPhotoKey,
      country: countries.name,
      linkedinUrl: members.linkedinUrl,
      facebookUrl: members.facebookUrl,
      websiteUrl: members.websiteUrl,
      joinedAt: members.joinedAt,
    })
    .from(members)
    .leftJoin(disciplines, eq(disciplines.id, members.disciplineId))
    .leftJoin(countries, eq(countries.id, members.countryId))
    .where(and(eq(members.slug, slug), eq(members.status, "active"), eq(members.isPublic, true)))
    .limit(1);

  if (!row) return undefined;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    initials: initialsOf(row.name),
    discipline: row.discipline ?? "Not provided",
    campusName: row.campusName ?? undefined,
    shortBio: row.shortBio ?? undefined,
    favoriteCampusPlace: row.favoriteCampusPlace ?? undefined,
    mostMemorableEvent: row.mostMemorableEvent ?? undefined,
    profession: row.profession ?? "",
    currentEmployer: row.currentEmployer ?? undefined,
    bio: row.bio ?? undefined,
    city: row.city ?? "",
    avatarKey: row.avatarKey ?? undefined,
    avatarUrl: row.avatarKey ? getR2PublicUrl(row.avatarKey) : undefined,
    coverPhotoUrl: row.coverPhotoKey ? getR2PublicUrl(row.coverPhotoKey) : undefined,
    country: row.country ?? undefined,
    linkedinUrl: row.linkedinUrl ?? undefined,
    facebookUrl: row.facebookUrl ?? undefined,
    websiteUrl: row.websiteUrl ?? undefined,
    joinedAt: formatMonthYear(row.joinedAt),
  };
}

// Admin-only: every member regardless of status/is_public, plus the
// admin-only columns public_members excludes (email, studentId, status,
// platformRole) — safe here since this never flows to a public page.
export async function getAdminMembers(): Promise<Member[]> {
  const rows = await db
    .select({
      id: members.id,
      name: members.name,
      discipline: disciplines.name,
      profession: members.profession,
      city: members.city,
      email: members.email,
      studentId: members.studentId,
      platformRole: members.platformRole,
      status: members.status,
      joinedAt: members.joinedAt,
    })
    .from(members)
    .leftJoin(disciplines, eq(disciplines.id, members.disciplineId))
    .orderBy(members.name);

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    initials: initialsOf(row.name),
    discipline: row.discipline ?? "Not provided",
    profession: row.profession ?? "",
    city: row.city ?? "",
    email: row.email,
    studentId: row.studentId ?? undefined,
    platformRole: row.platformRole,
    status: row.status,
    joinedAt: formatMonthYear(row.joinedAt),
  }));
}

export const ADMIN_MEMBERS_PAGE_SIZE = 25;

export interface AdminMemberFilters {
  q?: string;
  status?: MemberStatus;
  disciplineId?: string;
  role?: PlatformRole;
  page: number;
}

// Filtered, paginated variant of getAdminMembers for the admin members list.
// (The dashboard still uses getAdminMembers — it needs every row.)
export async function getAdminMembersPage(filters: AdminMemberFilters) {
  const conditions: (SQL | undefined)[] = [];
  const q = filters.q?.trim();
  if (q) {
    // Escape LIKE wildcards so a literal % or _ in the search isn't a pattern.
    const pattern = `%${q.replace(/[\\%_]/g, "\\$&")}%`;
    conditions.push(
      or(
        ilike(members.name, pattern),
        ilike(members.email, pattern),
        ilike(members.studentId, pattern),
        ilike(members.city, pattern),
      ),
    );
  }
  if (filters.status) conditions.push(eq(members.status, filters.status));
  if (filters.disciplineId) conditions.push(eq(members.disciplineId, filters.disciplineId));
  if (filters.role) conditions.push(eq(members.platformRole, filters.role));
  const where = and(...conditions);

  const [{ total }] = await db.select({ total: count() }).from(members).where(where);
  const pageCount = Math.max(1, Math.ceil(total / ADMIN_MEMBERS_PAGE_SIZE));
  const page = Math.min(Math.max(1, filters.page), pageCount);

  const rows = await db
    .select({
      id: members.id,
      name: members.name,
      discipline: disciplines.name,
      profession: members.profession,
      city: members.city,
      email: members.email,
      studentId: members.studentId,
      platformRole: members.platformRole,
      status: members.status,
      joinedAt: members.joinedAt,
    })
    .from(members)
    .leftJoin(disciplines, eq(disciplines.id, members.disciplineId))
    .where(where)
    .orderBy(members.name)
    .limit(ADMIN_MEMBERS_PAGE_SIZE)
    .offset((page - 1) * ADMIN_MEMBERS_PAGE_SIZE);

  const items: Member[] = rows.map((row) => ({
    id: row.id,
    name: row.name,
    initials: initialsOf(row.name),
    discipline: row.discipline ?? "Not provided",
    profession: row.profession ?? "",
    city: row.city ?? "",
    email: row.email,
    studentId: row.studentId ?? undefined,
    platformRole: row.platformRole,
    status: row.status,
    joinedAt: formatMonthYear(row.joinedAt),
  }));

  return { items, total, page, pageCount };
}

// Backs the admin member edit form — the one place admin-only fields
// are read individually rather than as part of the full list above.
export async function getAdminMemberById(id: string): Promise<AdminMemberDetail | undefined> {
  const [row] = await db
    .select({
      id: members.id,
      name: members.name,
      disciplineId: members.disciplineId,
      campusName: members.campusName,
      avatarKey: members.avatarKey,
      coverPhotoKey: members.coverPhotoKey,
      shortBio: members.shortBio,
      favoriteCampusPlace: members.favoriteCampusPlace,
      mostMemorableEvent: members.mostMemorableEvent,
      profession: members.profession,
      currentEmployer: members.currentEmployer,
      city: members.city,
      countryId: members.countryId,
      bio: members.bio,
      linkedinUrl: members.linkedinUrl,
      facebookUrl: members.facebookUrl,
      websiteUrl: members.websiteUrl,
      email: members.email,
      phoneNumber: members.phoneNumber,
      studentId: members.studentId,
      bloodGroup: members.bloodGroup,
      dateOfBirth: members.dateOfBirth,
      platformRole: members.platformRole,
      status: members.status,
      isPublic: members.isPublic,
    })
    .from(members)
    .where(eq(members.id, id))
    .limit(1);

  if (!row) return undefined;

  return {
    id: row.id,
    name: row.name,
    disciplineId: row.disciplineId,
    campusName: row.campusName ?? "",
    avatarUrl: row.avatarKey ? getR2PublicUrl(row.avatarKey) : undefined,
    coverPhotoUrl: row.coverPhotoKey ? getR2PublicUrl(row.coverPhotoKey) : undefined,
    shortBio: row.shortBio ?? "",
    favoriteCampusPlace: row.favoriteCampusPlace ?? "",
    mostMemorableEvent: row.mostMemorableEvent ?? "",
    profession: row.profession ?? "",
    currentEmployer: row.currentEmployer ?? "",
    city: row.city ?? "",
    countryId: row.countryId,
    bio: row.bio ?? "",
    linkedinUrl: row.linkedinUrl ?? "",
    facebookUrl: row.facebookUrl ?? "",
    websiteUrl: row.websiteUrl ?? "",
    email: row.email,
    phoneNumber: row.phoneNumber ?? "",
    studentId: row.studentId ?? "",
    bloodGroup: row.bloodGroup,
    dateOfBirth: row.dateOfBirth ?? "",
    platformRole: row.platformRole,
    status: row.status,
    isPublic: row.isPublic,
  };
}
