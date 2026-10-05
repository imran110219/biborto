"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { members } from "@/drizzle/schema";
import { requireAdminMemberId } from "@/lib/auth/require-admin";
import type { MemberStatus, PlatformRole } from "@/lib/types";

const revalidateMemberPaths = () => {
  revalidatePath("/admin/members");
  revalidatePath("/admin/dashboard");
  revalidatePath("/members");
};

export async function approveMember(memberId: string, _formData: FormData) {
  const adminId = await requireAdminMemberId();
  await db
    .update(members)
    .set({ status: "active", reviewedBy: adminId, reviewedAt: new Date().toISOString() })
    .where(eq(members.id, memberId));

  revalidateMemberPaths();
}

export async function suspendMember(memberId: string, _formData: FormData) {
  const adminId = await requireAdminMemberId();
  await db
    .update(members)
    .set({ status: "suspended", reviewedBy: adminId, reviewedAt: new Date().toISOString() })
    .where(eq(members.id, memberId));

  revalidateMemberPaths();
}

export async function reactivateMember(memberId: string, _formData: FormData) {
  const adminId = await requireAdminMemberId();
  await db
    .update(members)
    .set({ status: "active", reviewedBy: adminId, reviewedAt: new Date().toISOString() })
    .where(eq(members.id, memberId));

  revalidateMemberPaths();
}

async function bulkSetMemberStatus(status: MemberStatus, formData: FormData) {
  const adminId = await requireAdminMemberId();
  const ids = formData.getAll("memberIds").map(String).filter(Boolean);
  if (ids.length === 0) return;

  await db
    .update(members)
    .set({ status, reviewedBy: adminId, reviewedAt: new Date().toISOString() })
    .where(inArray(members.id, ids));

  revalidateMemberPaths();
}

export async function bulkActivateMembers(formData: FormData) {
  await bulkSetMemberStatus("active", formData);
}

export async function bulkSuspendMembers(formData: FormData) {
  await bulkSetMemberStatus("suspended", formData);
}

export async function updateMember(memberId: string, _prevState: string | undefined, formData: FormData) {
  await requireAdminMemberId();

  const name = String(formData.get("name") ?? "").trim();
  const disciplineId = String(formData.get("disciplineId") ?? "") || null;
  const campusName = String(formData.get("campusName") ?? "").trim();
  const shortBio = String(formData.get("shortBio") ?? "").trim();
  const favoriteCampusPlace = String(formData.get("favoriteCampusPlace") ?? "").trim();
  const mostMemorableEvent = String(formData.get("mostMemorableEvent") ?? "").trim();
  const profession = String(formData.get("profession") ?? "").trim();
  const currentEmployer = String(formData.get("currentEmployer") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const platformRole = String(formData.get("platformRole") ?? "member") as PlatformRole;
  const isPublic = formData.get("isPublic") === "on";

  if (!name) return "Name is required.";

  await db
    .update(members)
    .set({
      name,
      disciplineId,
      campusName: campusName || null,
      shortBio: shortBio || null,
      favoriteCampusPlace: favoriteCampusPlace || null,
      mostMemorableEvent: mostMemorableEvent || null,
      profession: profession || null,
      currentEmployer: currentEmployer || null,
      city: city || null,
      platformRole,
      isPublic,
    })
    .where(eq(members.id, memberId));

  revalidateMemberPaths();
  revalidatePath(`/admin/members/${memberId}/edit`);
  redirect("/admin/members");
}
