"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { members } from "@/drizzle/schema";

// proxy.ts already keeps signed-out/non-admin users off /admin/**, but a
// Server Action is its own callable endpoint — reachable directly, not
// just through the page that renders its bound form — so it needs the
// same role check restated here.
async function requireAdminMemberId(): Promise<string> {
  const session = await auth();
  const role = session?.user?.platformRole;
  if (role !== "admin" && role !== "superadmin") {
    throw new Error("Not authorized.");
  }

  const [admin] = await db
    .select({ id: members.id })
    .from(members)
    .where(eq(members.userId, session!.user.id))
    .limit(1);
  if (!admin) throw new Error("Not authorized.");
  return admin.id;
}

export async function approveMember(memberId: string, _formData: FormData) {
  const adminId = await requireAdminMemberId();
  await db
    .update(members)
    .set({ status: "active", reviewedBy: adminId, reviewedAt: new Date().toISOString() })
    .where(eq(members.id, memberId));

  revalidatePath("/admin/members");
  revalidatePath("/admin/dashboard");
}

export async function suspendMember(memberId: string, _formData: FormData) {
  const adminId = await requireAdminMemberId();
  await db
    .update(members)
    .set({ status: "suspended", reviewedBy: adminId, reviewedAt: new Date().toISOString() })
    .where(eq(members.id, memberId));

  revalidatePath("/admin/members");
  revalidatePath("/admin/dashboard");
}
