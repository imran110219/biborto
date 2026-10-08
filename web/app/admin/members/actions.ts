"use server";

import { logActivity, memberNames } from "@/lib/activity";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { disciplines, members } from "@/drizzle/schema";
import { requireAdmin, requireSuperadmin } from "@/lib/auth/require-admin";
import type { MemberStatus } from "@/lib/types";
import { parseMemberForm, safeReturnTo, slugify } from "@/lib/members/form";
import { disciplineCodeFromRoll, isEmail, placeholderName, validateRoll } from "@/lib/members/onboarding";

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
  const [name] = await memberNames([memberId]);
  await logActivity({ actorId: adminId, action: "member.approved", targetType: "member", targetId: memberId, summary: `{actor} approved ${name ?? "a member"}` });

  revalidateMemberPaths();
}

export async function suspendMember(memberId: string, _formData: FormData) {
  const adminId = await requireSuperadmin();
  if (memberId === adminId) return; // an admin can't lock themselves out
  await db
    .update(members)
    .set({ status: "suspended", reviewedBy: adminId, reviewedAt: new Date().toISOString() })
    .where(eq(members.id, memberId));
  const [name] = await memberNames([memberId]);
  await logActivity({ actorId: adminId, action: "member.suspended", targetType: "member", targetId: memberId, summary: `{actor} suspended ${name ?? "a member"}` });

  revalidateMemberPaths();
}

export async function reactivateMember(memberId: string, _formData: FormData) {
  const adminId = await requireSuperadmin();
  await db
    .update(members)
    .set({ status: "active", reviewedBy: adminId, reviewedAt: new Date().toISOString() })
    .where(eq(members.id, memberId));
  const [name] = await memberNames([memberId]);
  await logActivity({ actorId: adminId, action: "member.reactivated", targetType: "member", targetId: memberId, summary: `{actor} reactivated ${name ?? "a member"}` });

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
  await logActivity({
    actorId: adminId,
    action: status === "active" ? "member.bulk_activated" : "member.bulk_suspended",
    targetType: "member",
    summary: `{actor} ${status === "active" ? "activated" : "suspended"} ${targets.length} member${targets.length === 1 ? "" : "s"}`,
  });

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

  if (values.studentId) {
    const [clash] = await db
      .select({ name: members.name })
      .from(members)
      .where(and(eq(members.studentId, values.studentId), ne(members.id, memberId)))
      .limit(1);
    if (clash) return `Student ID ${values.studentId} already belongs to ${clash.name}.`;
  }

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

// Adds a roster record from just an email and a roll — nobody registers themselves. The person
// signs in with that email (Google, or the verified-email link at /signup) and confirms their name
// at /welcome; until then the record is hidden from the public directory. Discipline comes from the
// roll (digits 3–4 are the discipline code) unless the admin picks one. No login account is created.
export async function createMember(_prevState: string | undefined, formData: FormData) {
  const actorId = await requireSuperadmin();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const roll = String(formData.get("studentId") ?? "").trim();
  const chosenDiscipline = String(formData.get("disciplineId") ?? "").trim();

  if (!isEmail(email) || email.length > 200) return "Enter a valid email address.";
  const rollError = validateRoll(roll);
  if (rollError) return rollError;

  let disciplineId = chosenDiscipline || null;
  if (!disciplineId) {
    const code = disciplineCodeFromRoll(roll);
    const [derived] = code ? await db.select({ id: disciplines.id }).from(disciplines).where(eq(disciplines.code, code)).limit(1) : [];
    if (!derived) return "Couldn't work out the discipline from this roll — choose it from the list.";
    disciplineId = derived.id;
  }

  // Sign-in matches on lower(email), so uniqueness is checked the same way.
  const [sameEmail] = await db.select({ id: members.id }).from(members).where(sql`lower(${members.email}) = ${email}`).limit(1);
  if (sameEmail) return "A member with this email already exists.";
  const [sameRoll] = await db.select({ name: members.name, email: members.email }).from(members).where(eq(members.studentId, roll)).limit(1);
  if (sameRoll) return `Roll ${roll} already belongs to ${sameRoll.name} (${sameRoll.email}).`;

  const base = slugify(placeholderName(email));
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
      .values({
        slug,
        name: placeholderName(email),
        email,
        studentId: roll,
        disciplineId,
        platformRole: "member",
        status: "active",
        isPublic: false, // hidden until the member confirms their details at /welcome
        reviewedBy: actorId,
        reviewedAt: new Date().toISOString(),
      })
      .returning({ id: members.id });
  } catch (error) {
    // Lost a race on the unique email/roll between the checks above and the insert.
    const code = (error as { code?: string; cause?: { code?: string } }).code ?? (error as { cause?: { code?: string } }).cause?.code;
    if (code === "23505") return "A member with this email or roll already exists.";
    throw error;
  }

  await logActivity({ actorId, action: "member.created", targetType: "member", targetId: created.id, summary: `{actor} added ${email} (roll ${roll}) to the roster` });

  revalidateMemberPaths();
  redirect(`/admin/members/new?added=${encodeURIComponent(email)}&roll=${encodeURIComponent(roll)}`);
}
