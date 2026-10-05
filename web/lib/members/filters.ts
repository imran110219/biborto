import type { MemberStatus, PlatformRole } from "@/lib/types";

const STATUSES: MemberStatus[] = ["active", "pending", "suspended"];
const ROLES: PlatformRole[] = ["member", "admin", "superadmin"];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Raw = string | string[] | undefined;
const first = (v: Raw) => (Array.isArray(v) ? v[0] : v) ?? "";

export interface ParsedMemberFilters {
  q: string;
  status?: MemberStatus;
  role?: PlatformRole;
  disciplineId?: string;
  page: number;
}

// Validates the admin members list's URL params (page and the CSV export
// both read them), dropping anything unrecognized.
export function parseMemberFilters(sp: Record<string, Raw>): ParsedMemberFilters {
  const discipline = first(sp.discipline);
  const page = Number.parseInt(first(sp.page), 10);
  return {
    q: first(sp.q).slice(0, 100),
    status: STATUSES.find((s) => s === first(sp.status)),
    role: ROLES.find((r) => r === first(sp.role)),
    disciplineId: UUID.test(discipline) ? discipline : undefined,
    page: Number.isFinite(page) ? page : 1,
  };
}

export function memberFiltersToQuery(f: Omit<ParsedMemberFilters, "page">) {
  const next = new URLSearchParams();
  if (f.q) next.set("q", f.q);
  if (f.status) next.set("status", f.status);
  if (f.disciplineId) next.set("discipline", f.disciplineId);
  if (f.role) next.set("role", f.role);
  return next;
}
