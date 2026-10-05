import Link from "next/link";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PageHero } from "@/components/ui/PageHero";
import { FilterBar, SearchField, SelectField } from "@/components/ui/FilterBar";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { BusinessCard } from "@/components/BusinessCard";
import { ArrowRightIcon } from "@/components/ui/icons";
import { PUBLIC_BUSINESSES_PAGE_SIZE, getPublicBusinessCities, getPublicBusinessesPage } from "@/lib/db/queries/businesses";
import { businessFiltersToQuery, parseBusinessFilters } from "@/lib/businesses/filters";
import { BUSINESS_CATEGORIES } from "@/lib/types";

export default async function BusinessDirectoryPage({ searchParams }: PageProps<"/business">) {
  const sp = await searchParams;
  const submitted = sp.submitted;
  const { status: _status, ...filters } = parseBusinessFilters(sp);
  const [{ items: businesses, total, page, pageCount }, cities] = await Promise.all([
    getPublicBusinessesPage(filters),
    getPublicBusinessCities(),
  ]);
  const rangeStart = total === 0 ? 0 : (page - 1) * PUBLIC_BUSINESSES_PAGE_SIZE + 1;
  const rangeEnd = (page - 1) * PUBLIC_BUSINESSES_PAGE_SIZE + businesses.length;
  const baseQuery = businessFiltersToQuery({ ...filters, status: undefined });
  const pageHref = (n: number) => {
    const next = new URLSearchParams(baseQuery);
    if (n > 1) next.set("page", String(n));
    const qs = next.toString();
    return qs ? `/business?${qs}` : "/business";
  };
  const filtered = !!(filters.q || filters.category || filters.city);

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Directory"
        title="Business Directory"
        description="Businesses and services run by Batch 11 alumni. Search by category, city or owner, and support a batchmate first."
      />

      <section className="flex flex-col gap-7 px-5 pb-24 md:px-20">
        {submitted === "1" && (
          <p role="status" className="rounded-xl bg-[#F8F3E6] px-4 py-3 text-sm text-text-primary">
            Thanks — your listing was submitted and is waiting on committee review.
          </p>
        )}

        <div className="flex flex-col items-start justify-between gap-6 rounded-[20px] bg-brand-green p-8 text-bg-public sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1.5">
            <h2 className="font-serif text-2xl font-medium">Own a business? List it here.</h2>
            <p className="max-w-[560px] text-sm text-brand-green-tint">
              Free for verified batchmates. Listings are reviewed by the committee before they go live.
            </p>
          </div>
          <Button href="/business/submit" variant="onDark" className="shrink-0">
            List your business <ArrowRightIcon />
          </Button>
        </div>

        <form method="get" action="/business">
          <FilterBar>
            <SearchField id="bq" name="q" defaultValue={filters.q} label="Search" placeholder="Business, owner or city" />
            <SelectField
              id="bcat"
              name="category"
              defaultValue={filters.category ?? ""}
              label="Category"
              options={[{ value: "", label: "All categories" }, ...BUSINESS_CATEGORIES.map((c) => ({ value: c, label: c }))]}
            />
            <SelectField
              id="bcity"
              name="city"
              defaultValue={filters.city}
              label="Current city"
              options={[{ value: "", label: "Anywhere" }, ...cities.map((c) => ({ value: c, label: c }))]}
            />
            <button
              type="submit"
              className="h-12 rounded-xl border border-brand-green bg-brand-green px-5 text-sm font-semibold text-white"
            >
              Apply
            </button>
          </FilterBar>
        </form>

        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span>
            {total === 0 ? "No businesses found" : `Showing ${rangeStart}–${rangeEnd} of ${total} ${total === 1 ? "business" : "businesses"}`}
            {filtered && (
              <>
                {" · "}
                <Link href="/business" className="font-semibold text-brand-green">
                  Clear filters
                </Link>
              </>
            )}
          </span>
          <span>Sorted by name, A–Z</span>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
          {businesses.map((b) => (
            <BusinessCard key={b.slug} business={b} />
          ))}
        </div>

        <Pagination pages={pageCount} current={page} hrefFor={pageHref} />
      </section>
    </PublicLayout>
  );
}
