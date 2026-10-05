"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchIcon } from "@/components/ui/icons";
import type { DisciplineOption } from "@/lib/db/queries/disciplines";

const selectClasses = "h-11 rounded-[10px] border border-border-input bg-white px-3 text-sm";

// Filter state lives in the URL (?q=&status=&discipline=&role=&page=) so the
// list is a plain Server Component render and filtered views are shareable.
export function MemberFilters({ disciplines, total }: { disciplines: DisciplineOption[]; total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Keep the box in sync when the URL changes elsewhere (Clear filters, back/forward).
  const urlQ = params.get("q") ?? "";
  const [seenUrlQ, setSeenUrlQ] = useState(urlQ);
  if (seenUrlQ !== urlQ) {
    setSeenUrlQ(urlQ);
    if (urlQ !== q.trim()) setQ(urlQ);
  }
  useEffect(() => () => clearTimeout(timer.current), []);

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page"); // any filter change returns to page 1
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  function onSearch(value: string) {
    setQ(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => update("q", value.trim()), 300);
  }

  const active = ["q", "status", "discipline", "role"].some((k) => params.get(k));

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-[#EFEAE0] p-4">
      <div className="relative flex w-full items-center sm:w-80">
        <span className="absolute left-3 text-text-secondary">
          <SearchIcon size={16} />
        </span>
        <input
          type="search"
          value={q}
          onChange={(e) => onSearch(e.target.value)}
          aria-label="Search members"
          placeholder="Search name, email, student ID or city"
          className="h-11 w-full rounded-[10px] border border-border-input pl-9 pr-3 text-sm"
        />
      </div>
      <select
        aria-label="Filter by status"
        value={params.get("status") ?? ""}
        onChange={(e) => update("status", e.target.value)}
        className={selectClasses}
      >
        <option value="">All statuses</option>
        <option value="active">Active</option>
        <option value="pending">Pending</option>
        <option value="suspended">Suspended</option>
      </select>
      <select
        aria-label="Filter by discipline"
        value={params.get("discipline") ?? ""}
        onChange={(e) => update("discipline", e.target.value)}
        className={`${selectClasses} max-w-[220px]`}
      >
        <option value="">All disciplines</option>
        {disciplines.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>
      <select
        aria-label="Filter by role"
        value={params.get("role") ?? ""}
        onChange={(e) => update("role", e.target.value)}
        className={selectClasses}
      >
        <option value="">All roles</option>
        <option value="member">Member</option>
        <option value="admin">Admin</option>
        <option value="superadmin">Superadmin</option>
      </select>
      {active && (
        <button
          type="button"
          onClick={() => {
            setQ("");
            router.replace(pathname);
          }}
          className="h-11 px-2 text-sm font-semibold text-brand-green"
        >
          Clear filters
        </button>
      )}
      <span className="ml-auto text-sm text-text-secondary">
        {total} {total === 1 ? "member" : "members"}
      </span>
    </div>
  );
}
