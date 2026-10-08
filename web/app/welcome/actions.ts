"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, isNull, ne } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/auth-schema";
import { members } from "@/drizzle/schema";
import { getActiveSessionMemberId } from "@/lib/auth/session-member";
import { logActivity } from "@/lib/activity";
import { slugify } from "@/lib/members/form";
import { validateDisplayName } from "@/lib/members/onboarding";
import { consume, formatWait } from "@/lib/security/rate-limit";
import { LIMITS } from "@/lib/security/limits";

// First sign-in: the member confirms who they are. Admins only entered an email and a roll, so the
// name is the member's own. This is the one time they set it — afterwards only an admin can change it.
// Completing it also publishes the profile in the member directory (unless they untick the box),
// and gives the profile its name-based URL.
export async function completeOnboarding(_prevState: string | undefined, formData: FormData) {
  const memberId = await getActiveSessionMemberId();
  if (!memberId) return "Sign in again to continue.";

  const limit = await consume(`onboarding:member:${memberId}`, LIMITS.onboarding);
  if (!limit.allowed) return `Too many attempts. Please try again in ${formatWait(limit.retryAfterSeconds)}.`;

  const parsed = validateDisplayName(String(formData.get("name") ?? ""));
  if ("error" in parsed) return parsed.error;
  const showInDirectory = formData.get("isPublic") === "on";

  const [member] = await db
    .select({ id: members.id, userId: members.userId, completed: members.profileCompletedAt })
    .from(members)
    .where(eq(members.id, memberId))
    .limit(1);
  if (!member) return "We couldn't find your membership. Contact the committee.";
  if (member.completed) redirect("/account");

  // The name-based profile URL: slugified name, "-2", "-3"… if another member already has it.
  const base = slugify(parsed.name);
  let slug = base;
  for (let n = 2; ; n++) {
    const [taken] = await db.select({ id: members.id }).from(members).where(and(eq(members.slug, slug), ne(members.id, memberId))).limit(1);
    if (!taken) break;
    slug = `${base}-${n}`;
  }

  // `profile_completed_at is null` makes this a one-shot even if the form is submitted twice.
  const [updated] = await db
    .update(members)
    .set({ name: parsed.name, slug, isPublic: showInDirectory, profileCompletedAt: new Date().toISOString() })
    .where(and(eq(members.id, memberId), isNull(members.profileCompletedAt)))
    .returning({ id: members.id });
  if (!updated) redirect("/account");

  if (member.userId) await db.update(users).set({ name: parsed.name }).where(eq(users.id, member.userId));

  await logActivity({ actorId: memberId, action: "member.onboarded", targetType: "member", targetId: memberId, summary: `{actor} joined and confirmed their profile` });

  for (const path of ["/members", "/admin/members", "/admin/dashboard", "/sitemap.xml"]) revalidatePath(path);
  redirect("/account?welcome=1");
}
