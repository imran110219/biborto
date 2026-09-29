"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { members } from "@/drizzle/schema";
import { requireAdminMemberId } from "@/lib/auth/require-admin";

export async function approveMember(memberId: string, _formData: FormData) {
  const adminId = await requireAdminMemberId();
  await db
    .update(members)
    .set({ status: "active", reviewedBy: adminId, reviewedAt: new Date().toISOString() })
    .where(eq(members.id, memberId));

  revalidatePath("/admin/members");
  revalidatePath("/admin/dashboard");
  revalidatePath("/members");
}

export async function suspendMember(memberId: string, _formData: FormData) {
  const adminId = await requireAdminMemberId();
  await db
    .update(members)
    .set({ status: "suspended", reviewedBy: adminId, reviewedAt: new Date().toISOString() })
    .where(eq(members.id, memberId));

  revalidatePath("/admin/members");
  revalidatePath("/admin/dashboard");
  revalidatePath("/members");
}
