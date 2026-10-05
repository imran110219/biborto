"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { members } from "@/drizzle/schema";
import { requireAdmin, requireSuperadmin } from "@/lib/auth/require-admin";
import type { MemberStatus } from "@/lib/types";
import { parseMemberForm, safeReturnTo, slugify } from "@/lib/members/form";

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

export async function updateMember(memberId: string, _prevState: string | undefined, formData: FormData) {
  // Admins can view member profiles; only a superadmin may edit them.
  await requireSuperadmin();
  const actor = await requireAdmin();

  const parsed = parseMemberForm(formData, { requireEmail: false });
  if ("error" in parsed) return parsed.error;
  const { email: _email, returnTo, ...values } = parsed.values;

  const [target] = await db
    .select({ platformRole: members.platformRole, status: members.status })
    .from(members)
    .where(eq(members.id, memberId))
    .limit(1);
  if (!target) return "Member not found.";

  if (values.platformRole !== target.platformRole) {
    if (actor.role !== "superadmin") return "Only a superadmin can change platform roles.";
    if (memberId === actor.id) return "You can't change your own role.";
  }
  const statusChanged = values.status !== target.status;
  if (statusChanged && memberId === actor.id) return "You can't change your own status.";

  await db
    .update(members)
    .set({
      ...values,
      ...(statusChanged ? { reviewedBy: actor.id, reviewedAt: new Date().toISOString() } : {}),
    })
    .where(eq(members.id, memberId));

  revalidateMemberPaths();
  revalidatePath(`/admin/members/${memberId}/edit`);
  redirect(safeReturnTo(returnTo));
}

// Committee-entered roster record. No auth user is created — the person
// claims it later at /signup, which links the existing row by email.
export async function createMember(_prevState: string | undefined, formData: FormData) {
  const actorId = await requireSuperadmin();

  const parsed = parseMemberForm(formData, { requireEmail: true });
  if ("error" in parsed) return parsed.error;
  const { returnTo: _returnTo, ...values } = parsed.values;

  // Sign-in matches on lower(email), so uniqueness is checked the same way.
  const [existing] = await db
    .select({ id: members.id })
    .from(members)
    .where(sql`lower(${members.email}) = ${values.email}`)
    .limit(1);
  if (existing) return "A member with this email already exists.";

  const base = slugify(values.name);
  let slug = base;
  for (let n = 2; ; n++) {
    const [taken] = await db.select({ id: members.id }).from(members).where(eq(members.slug, slug)).limit(1);
    if (!taken) break;
    slug = `${base}-${n}`;
  }

  let created: { id: string } | undefined;
  try {
    [created] = await db
      .insert(members)
      .values({ ...values, slug, reviewedBy: actorId, reviewedAt: new Date().toISOString() })
      .returning({ id: members.id });
  } catch (error) {
    // Lost a race on the unique email/slug between the checks above and the insert.
    const code = (error as { code?: string; cause?: { code?: string } }).code ?? (error as { cause?: { code?: string } }).cause?.code;
    if (code === "23505") return "A member with this email already exists.";
    throw error;
  }

  revalidateMemberPaths();
  redirect(`/admin/members/${created.id}`);
}
