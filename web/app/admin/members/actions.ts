"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { members } from "@/drizzle/schema";
import { requireAdmin, requireSuperadmin } from "@/lib/auth/require-admin";
import type { MemberStatus, PlatformRole } from "@/lib/types";

const PLATFORM_ROLES: PlatformRole[] = ["member", "admin", "superadmin"];

// Member moderation (approve/suspend/reactivate/edit) is superadmin-only;
// admins have view-only access to member profiles.
const revalidateMemberPaths = () => {
  revalidatePath("/admin/members");
  revalidatePath("/admin/dashboard");
  revalidatePath("/members");
};

export async function approveMember(memberId: string, _formData: FormData) {
  const adminId = await requireSuperadmin();
  await db
    .update(members)
    .set({ status: "active", reviewedBy: adminId, reviewedAt: new Date().toISOString() })
    .where(eq(members.id, memberId));

  revalidateMemberPaths();
}

export async function suspendMember(memberId: string, _formData: FormData) {
  const adminId = await requireSuperadmin();
  if (memberId === adminId) return; // an admin can't lock themselves out
  await db
    .update(members)
    .set({ status: "suspended", reviewedBy: adminId, reviewedAt: new Date().toISOString() })
    .where(eq(members.id, memberId));

  revalidateMemberPaths();
}

export async function reactivateMember(memberId: string, _formData: FormData) {
  const adminId = await requireSuperadmin();
  await db
    .update(members)
    .set({ status: "active", reviewedBy: adminId, reviewedAt: new Date().toISOString() })
    .where(eq(members.id, memberId));

  revalidateMemberPaths();
}

async function bulkSetMemberStatus(status: MemberStatus, formData: FormData) {
  const adminId = await requireSuperadmin();
  const ids = formData.getAll("memberIds").map(String).filter(Boolean);
  // An admin can't suspend themselves, even as part of a bulk selection.
  const targets = status === "suspended" ? ids.filter((id) => id !== adminId) : ids;
  if (targets.length === 0) return;

  await db
    .update(members)
    .set({ status, reviewedBy: adminId, reviewedAt: new Date().toISOString() })
    .where(inArray(members.id, targets));

  revalidateMemberPaths();
}

export async function bulkActivateMembers(formData: FormData) {
  await bulkSetMemberStatus("active", formData);
}

export async function bulkSuspendMembers(formData: FormData) {
  await bulkSetMemberStatus("suspended", formData);
}

const MEMBER_STATUSES: MemberStatus[] = ["pending", "active", "suspended"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
type BloodGroup = (typeof BLOOD_GROUPS)[number];

// Only same-site admin paths — returnTo comes from a hidden form field, so
// it must not become an open redirect.
const safeReturnTo = (value: string) =>
  value.startsWith("/admin/") && !value.startsWith("//") && !value.includes("\\") ? value : "/admin/members";

function isHttpUrl(value: string) {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

export async function updateMember(memberId: string, _prevState: string | undefined, formData: FormData) {
  // Admins can view member profiles; only a superadmin may edit them.
  await requireSuperadmin();
  const actor = await requireAdmin();
  const text = (key: string) => String(formData.get(key) ?? "").trim();

  const name = text("name");
  const disciplineId = text("disciplineId") || null;
  const countryId = text("countryId") || null;
  const campusName = text("campusName");
  const shortBio = text("shortBio");
  const bio = text("bio");
  const favoriteCampusPlace = text("favoriteCampusPlace");
  const mostMemorableEvent = text("mostMemorableEvent");
  const profession = text("profession");
  const currentEmployer = text("currentEmployer");
  const city = text("city");
  const linkedinUrl = text("linkedinUrl");
  const facebookUrl = text("facebookUrl");
  const websiteUrl = text("websiteUrl");
  const phoneNumber = text("phoneNumber");
  const studentId = text("studentId");
  const bloodGroupRaw = text("bloodGroup");
  const dateOfBirth = text("dateOfBirth");
  const requestedRole = text("platformRole");
  const requestedStatus = text("status");
  const isPublic = formData.get("isPublic") === "on";
  const returnTo = safeReturnTo(text("returnTo"));

  if (!name) return "Name is required.";
  if (!PLATFORM_ROLES.includes(requestedRole as PlatformRole)) return "Choose a valid role.";
  if (!MEMBER_STATUSES.includes(requestedStatus as MemberStatus)) return "Choose a valid status.";
  for (const [label, url] of [["LinkedIn", linkedinUrl], ["Facebook", facebookUrl], ["Website", websiteUrl]]) {
    if (url && !isHttpUrl(url)) return `${label} URL must start with http:// or https://.`;
  }
  if (bloodGroupRaw && !BLOOD_GROUPS.includes(bloodGroupRaw as BloodGroup)) return "Choose a valid blood group.";
  if (dateOfBirth) {
    const parsed = new Date(`${dateOfBirth}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth) || Number.isNaN(parsed.getTime()) || parsed > new Date()) {
      return "Enter a valid date of birth.";
    }
  }
  const platformRole = requestedRole as PlatformRole;
  const status = requestedStatus as MemberStatus;

  const [target] = await db
    .select({ platformRole: members.platformRole, status: members.status })
    .from(members)
    .where(eq(members.id, memberId))
    .limit(1);
  if (!target) return "Member not found.";

  if (platformRole !== target.platformRole) {
    if (actor.role !== "superadmin") return "Only a superadmin can change platform roles.";
    if (memberId === actor.id) return "You can't change your own role.";
  }
  const statusChanged = status !== target.status;
  if (statusChanged && memberId === actor.id) return "You can't change your own status.";

  await db
    .update(members)
    .set({
      name,
      disciplineId,
      countryId,
      campusName: campusName || null,
      shortBio: shortBio || null,
      bio: bio || null,
      favoriteCampusPlace: favoriteCampusPlace || null,
      mostMemorableEvent: mostMemorableEvent || null,
      profession: profession || null,
      currentEmployer: currentEmployer || null,
      city: city || null,
      linkedinUrl: linkedinUrl || null,
      facebookUrl: facebookUrl || null,
      websiteUrl: websiteUrl || null,
      phoneNumber: phoneNumber || null,
      studentId: studentId || null,
      bloodGroup: (bloodGroupRaw as BloodGroup) || null,
      dateOfBirth: dateOfBirth || null,
      platformRole,
      status,
      isPublic,
      ...(statusChanged ? { reviewedBy: actor.id, reviewedAt: new Date().toISOString() } : {}),
    })
    .where(eq(members.id, memberId));

  revalidateMemberPaths();
  revalidatePath(`/admin/members/${memberId}/edit`);
  redirect(returnTo);
}
