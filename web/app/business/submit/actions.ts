"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { businesses } from "@/drizzle/schema";
import { requireMemberId } from "@/lib/auth/session-member";
import { parseWebsite } from "@/lib/url";
import { BUSINESS_CATEGORIES, type BusinessCategory } from "@/lib/types";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function submitBusiness(_prevState: string | undefined, formData: FormData) {
  const memberId = await requireMemberId();

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "") as BusinessCategory;
  const city = String(formData.get("city") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const offerings = String(formData.get("offerings") ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const linkedin = String(formData.get("linkedinUrl") ?? "").trim();
  const facebook = String(formData.get("facebookUrl") ?? "").trim();

  if (!name) return "Business name is required.";
  if (!BUSINESS_CATEGORIES.includes(category)) return "Choose a category.";
  if (name.length > 120 || city.length > 80 || tagline.length > 160 || phone.length > 40 || email.length > 120) {
    return "One of the fields is too long.";
  }
  if (description.length > 5000 || offerings.length > 20 || offerings.some((o) => o.length > 80)) {
    return "Description or offerings are too long.";
  }
  const websiteUrl = parseWebsite(website);
  if (websiteUrl === undefined) return "Enter a valid website address (http or https).";
  const linkedinUrl = parseWebsite(linkedin);
  if (linkedinUrl === undefined) return "Enter a valid LinkedIn address (http or https).";
  const facebookUrl = parseWebsite(facebook);
  if (facebookUrl === undefined) return "Enter a valid Facebook address (http or https).";

  const slug = `${slugify(name)}-${Math.random().toString(36).slice(2, 7)}`;

  await db.insert(businesses).values({
    slug,
    ownerMemberId: memberId,
    name,
    category,
    city: city || null,
    tagline: tagline || null,
    description: description || null,
    offerings,
    testimonial: null,
    phone: phone || null,
    email: email || null,
    website: websiteUrl,
    linkedinUrl,
    facebookUrl,
  });

  redirect("/business?submitted=1");
}
