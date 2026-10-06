"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchIcon } from "@/components/ui/icons";

const selectClasses = "h-11 rounded-[10px] border border-border-input bg-white px-3 text-sm";

// Filter state lives in the URL (?q=&tier=&status=) so the list stays a plain
// Server Component render and filtered views are shareable.
export function SponsorFilters({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  function onSearch(value: string) {
    setQ(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => update("q", value.trim()), 300);
  }

  const active = ["q", "tier", "status"].some((k) => params.get(k));

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
          aria-label="Search sponsors"
          placeholder="Search name, website or business"
          className="h-11 w-full rounded-[10px] border border-border-input pl-9 pr-3 text-sm"
        />
      </div>
      <select aria-label="Filter by tier" value={params.get("tier") ?? ""} onChange={(e) => update("tier", e.target.value)} className={selectClasses}>
        <option value="">All tiers</option>
        <option value="diamond">Diamond</option>
        <option value="gold">Gold</option>
        <option value="silver">Silver</option>
        <option value="bronze">Bronze</option>
      </select>
      <select aria-label="Filter by status" value={params.get("status") ?? ""} onChange={(e) => update("status", e.target.value)} className={selectClasses}>
        <option value="">All statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
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
        {total} {total === 1 ? "sponsor" : "sponsors"}
      </span>
    </div>
  );
}
