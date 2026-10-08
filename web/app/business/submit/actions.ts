"use server";

import { consume, formatWait } from "@/lib/security/rate-limit";
import { LIMITS } from "@/lib/security/limits";
import { logActivity } from "@/lib/activity";
import { redirect } from "next/navigation";
import { and, count, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { businesses } from "@/drizzle/schema";
import { getActiveSessionMemberId } from "@/lib/auth/session-member";
import { MAX_BUSINESSES_PER_MEMBER } from "@/lib/businesses/limits";
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
  const memberId = await getActiveSessionMemberId();
  if (!memberId) return "Sign in with an active membership to list a business.";

  const limit = await consume(`business-submit:member:${memberId}`, LIMITS.businessSubmit);
  if (!limit.allowed) return `You're submitting too quickly. Please try again in ${formatWait(limit.retryAfterSeconds)}.`;

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

  // The cap is checked and the row inserted inside one transaction holding a
  // per-member advisory lock, so two simultaneous submissions can't both read
  // "1 of 2 used" and both succeed.
  const accepted = await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`business-limit:${memberId}`}))`);
    const [{ used }] = await tx
      .select({ used: count() })
      .from(businesses)
      .where(and(eq(businesses.ownerMemberId, memberId), inArray(businesses.status, ["pending", "active"])));
    if (used >= MAX_BUSINESSES_PER_MEMBER) return false;

    await tx.insert(businesses).values({
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
    return true;
  });
  if (!accepted) return `You can list at most ${MAX_BUSINESSES_PER_MEMBER} businesses. Contact the committee if you need another.`;

  await logActivity({ actorId: memberId, action: "business.submitted", targetType: "business", summary: `{actor} submitted the business listing "${name}" for review` });

  redirect("/business?submitted=1");
}
