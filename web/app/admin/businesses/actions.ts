"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { businesses } from "@/drizzle/schema";
import { requireAdminMemberId } from "@/lib/auth/require-admin";

export async function approveBusiness(slug: string, _formData: FormData) {
  const adminId = await requireAdminMemberId();
  await db
    .update(businesses)
    .set({ status: "active", reviewedBy: adminId, reviewedAt: new Date().toISOString() })
    .where(eq(businesses.slug, slug));

  revalidatePath("/admin/businesses");
  revalidatePath("/admin/dashboard");
  revalidatePath("/business");
}

export async function rejectBusiness(slug: string, _formData: FormData) {
  const adminId = await requireAdminMemberId();
  await db
    .update(businesses)
    .set({ status: "rejected", reviewedBy: adminId, reviewedAt: new Date().toISOString() })
    .where(eq(businesses.slug, slug));

  revalidatePath("/admin/businesses");
  revalidatePath("/admin/dashboard");
}
