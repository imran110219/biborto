import Link from "next/link";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PageHero } from "@/components/ui/PageHero";
import { FilterBar, SearchField, SelectField } from "@/components/ui/FilterBar";
import { Pagination } from "@/components/ui/Pagination";
import { MemberCard } from "@/components/MemberCard";
import { PUBLIC_MEMBERS_PAGE_SIZE, getPublicMemberFilterOptions, getPublicMembersPage } from "@/lib/db/queries/members";
import { parsePublicMemberFilters, publicMemberFiltersToQuery } from "@/lib/members/public-filters";

export const metadata = { title: "Members" };

export default async function MembersPage({ searchParams }: PageProps<"/members">) {
  const filters = parsePublicMemberFilters(await searchParams);
  const [{ items: members, total, page, pageCount }, options] = await Promise.all([
    getPublicMembersPage(filters),
    getPublicMemberFilterOptions(),
  ]);

  const rangeStart = total === 0 ? 0 : (page - 1) * PUBLIC_MEMBERS_PAGE_SIZE + 1;
  const rangeEnd = (page - 1) * PUBLIC_MEMBERS_PAGE_SIZE + members.length;
  const baseQuery = publicMemberFiltersToQuery(filters);
  const pageHref = (n: number) => {
    const next = new URLSearchParams(baseQuery);
    if (n > 1) next.set("page", String(n));
    const qs = next.toString();
    return qs ? `/members?${qs}` : "/members";
  };
  const filtered = !!(filters.q || filters.disciplineId || filters.city);

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Directory"
        title="Batch 11 members"
        description="Every verified batchmate in one place. Search by name, discipline, profession or the city they live in now."
      />

      <section className="flex flex-col gap-7 px-5 pb-24 md:px-20">
        <form method="get" action="/members">
          <FilterBar>
            <SearchField id="q" name="q" defaultValue={filters.q} label="Search" placeholder="Name, profession, company or city" />
            <SelectField
              id="dept"
              name="discipline"
              defaultValue={filters.disciplineId ?? ""}
              label="Discipline"
              options={[{ value: "", label: "All disciplines" }, ...options.disciplines.map((d) => ({ value: d.id, label: d.name }))]}
            />
            <SelectField
              id="city"
              name="city"
              defaultValue={filters.city}
              label="Current city"
              options={[{ value: "", label: "Anywhere" }, ...options.cities.map((c) => ({ value: c, label: c }))]}
            />
            <button type="submit" className="h-12 rounded-xl border border-brand-green bg-brand-green px-5 text-sm font-semibold text-white">
              Apply
            </button>
          </FilterBar>
        </form>

        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span>
            {total === 0 ? "No members found" : `Showing ${rangeStart}–${rangeEnd} of ${total} ${total === 1 ? "member" : "members"}`}
            {filtered && (
              <>
                {" · "}
                <Link href="/members" className="font-semibold text-brand-green">
                  Clear filters
                </Link>
              </>
            )}
          </span>
          <span>Sorted by name, A–Z</span>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
          {members.map((m) => (
            <MemberCard key={m.id} member={m} />
          ))}
        </div>

        <Pagination pages={pageCount} current={page} hrefFor={pageHref} />
      </section>
    </PublicLayout>
  );
}
