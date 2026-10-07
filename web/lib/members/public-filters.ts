const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Raw = string | string[] | undefined;
const first = (v: Raw) => (Array.isArray(v) ? v[0] : v) ?? "";

export interface ParsedPublicMemberFilters {
  q: string;
  disciplineId?: string;
  city: string;
  page: number;
}

// Validates the public /members URL params, dropping anything unrecognized.
export function parsePublicMemberFilters(sp: Record<string, Raw>): ParsedPublicMemberFilters {
  const discipline = first(sp.discipline);
  const page = Number.parseInt(first(sp.page), 10);
  return {
    q: first(sp.q).slice(0, 100),
    disciplineId: UUID.test(discipline) ? discipline : undefined,
    city: first(sp.city).slice(0, 80),
    page: Number.isFinite(page) ? page : 1,
  };
}

export function publicMemberFiltersToQuery(f: Omit<ParsedPublicMemberFilters, "page">) {
  const next = new URLSearchParams();
  if (f.q) next.set("q", f.q);
  if (f.disciplineId) next.set("discipline", f.disciplineId);
  if (f.city) next.set("city", f.city);
  return next;
}
