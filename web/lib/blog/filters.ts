import { BLOG_CATEGORIES, type BlogCategoryOption } from "@/lib/types";

type Raw = string | string[] | undefined;
const first = (v: Raw) => (Array.isArray(v) ? v[0] : v) ?? "";

export interface ParsedBlogFilters {
  q: string;
  category?: BlogCategoryOption;
  page: number;
}

// Validates the public blog index's URL params (?q=&category=&page=).
export function parseBlogFilters(sp: Record<string, Raw>): ParsedBlogFilters {
  const page = Number.parseInt(first(sp.page), 10);
  return {
    q: first(sp.q).trim().slice(0, 100),
    category: BLOG_CATEGORIES.find((c) => c === first(sp.category)),
    page: Number.isFinite(page) ? page : 1,
  };
}

export function blogFiltersToQuery(f: Omit<ParsedBlogFilters, "page">) {
  const next = new URLSearchParams();
  if (f.q) next.set("q", f.q);
  if (f.category) next.set("category", f.category);
  return next;
}
