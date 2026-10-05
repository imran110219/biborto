import { BUSINESS_CATEGORIES, type BusinessCategory, type BusinessStatus } from "@/lib/types";

const STATUSES: BusinessStatus[] = ["active", "pending", "rejected"];

type Raw = string | string[] | undefined;
const first = (v: Raw) => (Array.isArray(v) ? v[0] : v) ?? "";

export interface ParsedBusinessFilters {
  q: string;
  status?: BusinessStatus;
  category?: BusinessCategory;
  city: string;
  page: number;
}

// Validates the business list URL params (admin list, public directory and the
// CSV export all read them), dropping anything unrecognized. `status` is only
// meaningful for the admin views; the public directory ignores it.
export function parseBusinessFilters(sp: Record<string, Raw>): ParsedBusinessFilters {
  const page = Number.parseInt(first(sp.page), 10);
  return {
    q: first(sp.q).slice(0, 100),
    status: STATUSES.find((s) => s === first(sp.status)),
    category: BUSINESS_CATEGORIES.find((c) => c === first(sp.category)),
    city: first(sp.city).slice(0, 80),
    page: Number.isFinite(page) ? page : 1,
  };
}

export function businessFiltersToQuery(f: Omit<ParsedBusinessFilters, "page">) {
  const next = new URLSearchParams();
  if (f.q) next.set("q", f.q);
  if (f.status) next.set("status", f.status);
  if (f.category) next.set("category", f.category);
  if (f.city) next.set("city", f.city);
  return next;
}
