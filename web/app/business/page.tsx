import { PublicLayout } from "@/components/layout/PublicLayout";
import { PageHero } from "@/components/ui/PageHero";
import { FilterBar, SearchField, SelectField } from "@/components/ui/FilterBar";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { BusinessCard } from "@/components/BusinessCard";
import { ArrowRightIcon } from "@/components/ui/icons";
import { businesses } from "@/lib/mock-data";

export default function BusinessDirectoryPage() {
  const categories = Array.from(new Set(businesses.map((b) => b.category)));

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Directory"
        title="Business Directory"
        description="Businesses and services run by Batch 11 alumni. Search by category, city or owner, and support a batchmate first."
      />

      <section className="flex flex-col gap-7 px-5 pb-24 md:px-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-[20px] bg-brand-green p-8 text-bg-public sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1.5">
            <h2 className="font-serif text-2xl font-medium">Own a business? List it here.</h2>
            <p className="max-w-[560px] text-sm text-brand-green-tint">
              Free for verified batchmates. Listings are reviewed by the committee before they go live.
            </p>
          </div>
          <Button href="/signin" variant="onDark" className="shrink-0">
            List your business <ArrowRightIcon />
          </Button>
        </div>

        <FilterBar>
          <SearchField id="bq" label="Search" placeholder="Business, owner or city" />
          <SelectField id="bcat" label="Category" options={["All categories", ...categories]} />
          <SelectField id="bcity" label="Current city" options={["Anywhere", "Dhaka", "Khulna", "Abroad"]} />
          <button
            type="button"
            className="h-12 rounded-xl border border-brand-green bg-brand-green px-5 text-sm font-semibold text-white"
          >
            Apply
          </button>
        </FilterBar>

        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span>Showing {businesses.length} of [00] businesses</span>
          <span>Sorted by name, A–Z</span>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
          {businesses.map((b) => (
            <BusinessCard key={b.slug} business={b} />
          ))}
        </div>

        <Pagination pages={2} />
      </section>
    </PublicLayout>
  );
}
