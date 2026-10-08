import { and, count, eq, ilike, ne, or, sql, type SQL } from "drizzle-orm";
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
export async function getPublicMembers({ limit, excludeSlug }: { limit?: number; excludeSlug?: string } = {}): Promise<PublicMember[]> {
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
    .where(and(eq(members.status, "active"), eq(members.isPublic, true), excludeSlug ? ne(members.slug, excludeSlug) : undefined))
    .orderBy(members.name)
    .limit(limit ?? 10_000); // pages that only show a handful pass a limit instead of loading everyone

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

export const PUBLIC_MEMBERS_PAGE_SIZE = 24;

export interface PublicMemberFilters {
  q?: string;
  disciplineId?: string;
  city?: string;
}

function publicMemberWhere(filters: PublicMemberFilters) {
  const conditions: (SQL | undefined)[] = [eq(members.status, "active"), eq(members.isPublic, true)];
  const q = filters.q?.trim();
  if (q) {
    // Escape LIKE wildcards so a literal % or _ isn't treated as a pattern.
    const pattern = `%${q.replace(/[\\%_]/g, "\\$&")}%`;
    conditions.push(
      or(
        ilike(members.name, pattern),
        ilike(members.profession, pattern),
        ilike(members.currentEmployer, pattern),
        ilike(members.city, pattern),
      ),
    );
  }
  if (filters.disciplineId) conditions.push(eq(members.disciplineId, filters.disciplineId));
  if (filters.city) conditions.push(eq(members.city, filters.city));
  return and(...conditions);
}

// Filtered, paginated public directory. Only the columns PublicMember carries
// are selected (no email/phone/etc. — see the comment on getPublicMembers).
export async function getPublicMembersPage(filters: PublicMemberFilters & { page: number }) {
  const where = publicMemberWhere(filters);
  const [{ total }] = await db.select({ total: count() }).from(members).where(where);
  const pageCount = Math.max(1, Math.ceil(total / PUBLIC_MEMBERS_PAGE_SIZE));
  const page = Math.min(Math.max(1, filters.page), pageCount);

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
    .where(where)
    .orderBy(members.name)
    .limit(PUBLIC_MEMBERS_PAGE_SIZE)
    .offset((page - 1) * PUBLIC_MEMBERS_PAGE_SIZE);

  const items: PublicMember[] = rows.map((row) => ({
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
  return { items, total, page, pageCount };
}

// Filter options drawn from what's actually published, so every choice returns results.
export async function getPublicMemberFilterOptions() {
  const visible = and(eq(members.status, "active"), eq(members.isPublic, true));
  const [disciplineRows, cityRows] = await Promise.all([
    db
      .selectDistinct({ id: disciplines.id, name: disciplines.name })
      .from(members)
      .innerJoin(disciplines, eq(disciplines.id, members.disciplineId))
      .where(visible)
      .orderBy(disciplines.name),
    db.selectDistinct({ city: members.city }).from(members).where(visible).orderBy(members.city),
  ]);
  return {
    disciplines: disciplineRows,
    cities: cityRows.map((r) => r.city).filter((c): c is string => !!c),
  };
}

// A profile has two URLs: the name slug (`/members/md-zahidur-rahman`, members.slug) and the
// roll slug (`/members/arch-110101`: discipline short code + roll, lowercase, hyphenated).
// Either resolves here. The roll is only used to *find* the row; it is never selected or
// returned (student ID stays admin-only). A member with no discipline or roll has no roll slug.
export async function getPublicMemberBySlug(slugOrRoll: string): Promise<PublicMemberDetail | undefined> {
  const slug = slugOrRoll;
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
    .where(and(or(eq(members.slug, slug), sql`lower(${disciplines.shortCode} || '-' || ${members.studentId}) = ${slug.toLowerCase()}`), eq(members.status, "active"), eq(members.isPublic, true)))
    // If a roll ever equalled another member's name slug, the name slug wins.
    .orderBy(sql`(${members.slug} = ${slug}) desc`)
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
function adminMemberWhere(filters: Omit<AdminMemberFilters, "page">) {
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
  return and(...conditions);
}

export async function getAdminMembersPage(filters: AdminMemberFilters) {
  const where = adminMemberWhere(filters);

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

export interface MemberExportRow {
  name: string;
  email: string;
  phoneNumber: string | null;
  studentId: string | null;
  discipline: string | null;
  campusName: string | null;
  profession: string | null;
  currentEmployer: string | null;
  city: string | null;
  country: string | null;
  bloodGroup: string | null;
  dateOfBirth: string | null;
  platformRole: PlatformRole;
  status: MemberStatus;
  isPublic: boolean;
  joinedAt: string;
}

// Every row matching the filters (no pagination), including admin-only
// fields — callers must be superadmin-gated.
export async function getAdminMembersForExport(filters: Omit<AdminMemberFilters, "page">): Promise<MemberExportRow[]> {
  const rows = await db
    .select({
      name: members.name,
      email: members.email,
      phoneNumber: members.phoneNumber,
      studentId: members.studentId,
      discipline: disciplines.name,
      campusName: members.campusName,
      profession: members.profession,
      currentEmployer: members.currentEmployer,
      city: members.city,
      country: countries.name,
      bloodGroup: members.bloodGroup,
      dateOfBirth: members.dateOfBirth,
      platformRole: members.platformRole,
      status: members.status,
      isPublic: members.isPublic,
      joinedAt: members.joinedAt,
    })
    .from(members)
    .leftJoin(disciplines, eq(disciplines.id, members.disciplineId))
    .leftJoin(countries, eq(countries.id, members.countryId))
    .where(adminMemberWhere(filters))
    .orderBy(members.name);
  return rows.map((r) => ({ ...r, joinedAt: new Date(r.joinedAt).toISOString().slice(0, 10) }));
}

// Backs the admin member edit form — the one place admin-only fields
// are read individually rather than as part of the full list above.
export async function getAdminMemberById(id: string): Promise<AdminMemberDetail | undefined> {
  const [row] = await db
    .select({
      id: members.id,
      slug: members.slug,
      disciplineShortCode: disciplines.shortCode,
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
    .leftJoin(disciplines, eq(disciplines.id, members.disciplineId))
    .where(eq(members.id, id))
    .limit(1);

  if (!row) return undefined;

  return {
    id: row.id,
    slug: row.slug,
    rollSlug: row.disciplineShortCode && row.studentId ? `${row.disciplineShortCode}-${row.studentId}`.toLowerCase() : undefined,
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
