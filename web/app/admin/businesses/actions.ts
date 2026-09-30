"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { businesses } from "@/drizzle/schema";
import { requireAdminMemberId } from "@/lib/auth/require-admin";
import { BUSINESS_CATEGORIES, type BusinessCategory, type BusinessStatus } from "@/lib/types";

const revalidateBusinessPaths = () => {
  revalidatePath("/admin/businesses");
  revalidatePath("/admin/dashboard");
  revalidatePath("/business");
};

export async function approveBusiness(slug: string, _formData: FormData) {
  const adminId = await requireAdminMemberId();
  await db
    .update(businesses)
    .set({ status: "active", reviewedBy: adminId, reviewedAt: new Date().toISOString() })
    .where(eq(businesses.slug, slug));

  revalidateBusinessPaths();
}

export async function rejectBusiness(slug: string, _formData: FormData) {
  const adminId = await requireAdminMemberId();
  await db
    .update(businesses)
    .set({ status: "rejected", reviewedBy: adminId, reviewedAt: new Date().toISOString() })
    .where(eq(businesses.slug, slug));

  revalidateBusinessPaths();
}

async function bulkSetBusinessStatus(status: BusinessStatus, formData: FormData) {
  const adminId = await requireAdminMemberId();
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
  await requireAdminMemberId();

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "") as BusinessCategory;
  const city = String(formData.get("city") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const offerings = String(formData.get("offerings") ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  const testimonial = String(formData.get("testimonial") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();

  if (!name) return "Name is required.";
  if (!BUSINESS_CATEGORIES.includes(category)) return "Choose a valid category.";

  await db
    .update(businesses)
    .set({
      name,
      category,
      city: city || null,
      tagline: tagline || null,
      description: description || null,
      offerings,
      testimonial: testimonial || null,
      phone: phone || null,
      email: email || null,
      website: website || null,
    })
    .where(eq(businesses.slug, slug));

  revalidateBusinessPaths();
  revalidatePath(`/admin/businesses/${slug}/edit`);
  revalidatePath(`/business/${slug}`);
  redirect("/admin/businesses");
}
