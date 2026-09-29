import { PublicLayout } from "@/components/layout/PublicLayout";
import { PageHero } from "@/components/ui/PageHero";
import { FilterBar, SearchField, SelectField } from "@/components/ui/FilterBar";
import { Pagination } from "@/components/ui/Pagination";
import { MemberCard } from "@/components/MemberCard";
import { members } from "@/lib/mock-data";

export default function MembersPage() {
  const disciplines = Array.from(new Set(members.map((m) => m.discipline)));

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Directory"
        title="Batch 11 members"
        description="Every verified batchmate in one place. Search by name, discipline, profession or the city they live in now."
      />

      <section className="flex flex-col gap-7 px-5 pb-24 md:px-20">
        <FilterBar>
          <SearchField id="q" label="Search" placeholder="Name, company or city" />
          <SelectField id="dept" label="Discipline" options={["All disciplines", ...disciplines]} />
          <SelectField id="city" label="Current city" options={["Anywhere", "Dhaka", "Khulna", "Abroad"]} />
          <SelectField id="prof" label="Profession" options={["All professions", "Engineering", "Academia", "Business", "Public service"]} />
          <button
            type="button"
            className="h-12 rounded-xl border border-brand-green bg-brand-green px-5 text-sm font-semibold text-white"
          >
            Apply
          </button>
        </FilterBar>

        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span>Showing {members.length} of [000] members</span>
          <span>Sorted by name, A–Z</span>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
          {members.map((m) => (
            <MemberCard key={m.id} member={m} />
          ))}
        </div>

        <Pagination pages={3} />
      </section>
    </PublicLayout>
  );
}
