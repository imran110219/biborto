"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { businesses } from "@/drizzle/schema";
import { requireSuperadmin } from "@/lib/auth/require-admin";
import { businessSlug, parseBusinessForm } from "@/lib/businesses/form";
import type { BusinessStatus } from "@/lib/types";

// Business moderation and editing is superadmin-only (same rule as members);
// admins have view-only access.
const revalidateBusinessPaths = () => {
  revalidatePath("/admin/businesses");
  revalidatePath("/admin/dashboard");
  revalidatePath("/business");
};

export async function approveBusiness(slug: string, _formData: FormData) {
  const adminId = await requireSuperadmin();
  await db
    .update(businesses)
    .set({ status: "active", reviewedBy: adminId, reviewedAt: new Date().toISOString() })
    .where(eq(businesses.slug, slug));

  revalidateBusinessPaths();
}

export async function rejectBusiness(slug: string, _formData: FormData) {
  const adminId = await requireSuperadmin();
  await db
    .update(businesses)
    .set({ status: "rejected", reviewedBy: adminId, reviewedAt: new Date().toISOString() })
    .where(eq(businesses.slug, slug));

  revalidateBusinessPaths();
}

async function bulkSetBusinessStatus(status: BusinessStatus, formData: FormData) {
  const adminId = await requireSuperadmin();
  const slugs = formData.getAll("businessSlugs").map(String).filter(Boolean);
  if (slugs.length === 0) return;

  await db
    .update(businesses)
    .set({ status, reviewedBy: adminId, reviewedAt: new Date().toISOString() })
    .where(inArray(businesses.slug, slugs));

  revalidateBusinessPaths();
}

export async function bulkApproveBusinesses(formData: FormData) {
  await bulkSetBusinessStatus("active", formData);
}

export async function bulkRejectBusinesses(formData: FormData) {
  await bulkSetBusinessStatus("rejected", formData);
}

export async function updateBusiness(slug: string, _prevState: string | undefined, formData: FormData) {
  const actorId = await requireSuperadmin();

  const parsed = parseBusinessForm(formData);
  if ("error" in parsed) return parsed.error;
  const values = parsed.values;

  const [target] = await db.select({ status: businesses.status }).from(businesses).where(eq(businesses.slug, slug)).limit(1);
  if (!target) return "Listing not found.";
  const statusChanged = values.status !== target.status;

  await db
    .update(businesses)
    .set({ ...values, ...(statusChanged ? { reviewedBy: actorId, reviewedAt: new Date().toISOString() } : {}) })
    .where(eq(businesses.slug, slug));

  revalidateBusinessPaths();
  revalidatePath(`/admin/businesses/${slug}`);
  revalidatePath(`/admin/businesses/${slug}/edit`);
  revalidatePath(`/business/${slug}`);
  redirect("/admin/businesses");
}

// Committee-entered listing (as opposed to a member's self-submission, which
// starts pending). Slug is generated from the name, suffixed on collision.
export async function createBusiness(_prevState: string | undefined, formData: FormData) {
  const actorId = await requireSuperadmin();

  const parsed = parseBusinessForm(formData);
  if ("error" in parsed) return parsed.error;
  const values = parsed.values;

  const base = businessSlug(values.name);
  let slug = base;
  for (let n = 2; ; n++) {
    const [taken] = await db.select({ id: businesses.id }).from(businesses).where(eq(businesses.slug, slug)).limit(1);
    if (!taken) break;
    slug = `${base}-${n}`;
  }

  try {
    await db.insert(businesses).values({ ...values, slug, reviewedBy: actorId, reviewedAt: new Date().toISOString() });
  } catch (error) {
    // Lost a race on the unique slug between the check above and the insert.
    const code = (error as { code?: string; cause?: { code?: string } }).code ?? (error as { cause?: { code?: string } }).cause?.code;
    if (code === "23505") return "That listing name was just taken — try again.";
    throw error;
  }

  revalidateBusinessPaths();
  redirect(`/admin/businesses/${slug}`);
}
