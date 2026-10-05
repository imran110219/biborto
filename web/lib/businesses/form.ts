import { parseWebsite } from "@/lib/url";
import { BUSINESS_CATEGORIES, type BusinessCategory, type BusinessStatus } from "@/lib/types";

// Shared by the admin create and update Server Actions (plain module — a
// "use server" file may only export async functions).

export const BUSINESS_STATUSES: BusinessStatus[] = ["pending", "active", "rejected"];

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface BusinessFormValues {
  name: string;
  category: BusinessCategory;
  city: string | null;
  tagline: string | null;
  description: string | null;
  offerings: string[];
  testimonial: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  linkedinUrl: string | null;
  facebookUrl: string | null;
  ownerMemberId: string | null;
  status: BusinessStatus;
}

export function parseBusinessForm(formData: FormData): { error: string } | { values: BusinessFormValues } {
  const text = (key: string) => String(formData.get(key) ?? "").trim();
  const opt = (key: string) => text(key) || null;

  const name = text("name");
  const category = text("category") as BusinessCategory;
  const status = text("status") as BusinessStatus;
  const ownerMemberId = text("ownerMemberId");
  const email = text("email");
  const offerings = text("offerings")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  if (!name) return { error: "Name is required." };
  if (name.length > 120) return { error: "Name is too long (120 characters max)." };
  if (!BUSINESS_CATEGORIES.includes(category)) return { error: "Choose a valid category." };
  if (!BUSINESS_STATUSES.includes(status)) return { error: "Choose a valid status." };
  if (ownerMemberId && !UUID.test(ownerMemberId)) return { error: "Choose a valid owner." };
  if (email && !EMAIL.test(email)) return { error: "Enter a valid email address." };
  if (text("city").length > 80 || text("tagline").length > 160 || text("phone").length > 40 || email.length > 120) {
    return { error: "One of the fields is too long." };
  }
  if (text("description").length > 5000 || text("testimonial").length > 2000) {
    return { error: "Description or testimonial is too long." };
  }
  if (offerings.length > 20 || offerings.some((o) => o.length > 80)) {
    return { error: "Offerings are too long (20 items, 80 characters each)." };
  }

  const website = parseWebsite(text("website"));
  if (website === undefined) return { error: "Enter a valid website address (http or https)." };
  const linkedinUrl = parseWebsite(text("linkedinUrl"));
  if (linkedinUrl === undefined) return { error: "Enter a valid LinkedIn address (http or https)." };
  const facebookUrl = parseWebsite(text("facebookUrl"));
  if (facebookUrl === undefined) return { error: "Enter a valid Facebook address (http or https)." };

  return {
    values: {
      name,
      category,
      city: opt("city"),
      tagline: opt("tagline"),
      description: opt("description"),
      offerings,
      testimonial: opt("testimonial"),
      phone: opt("phone"),
      email: email || null,
      website,
      linkedinUrl,
      facebookUrl,
      ownerMemberId: ownerMemberId || null,
      status,
    },
  };
}

export function businessSlug(name: string) {
  const base = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "business";
}
