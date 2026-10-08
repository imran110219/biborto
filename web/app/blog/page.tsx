import Link from "next/link";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PageHero } from "@/components/ui/PageHero";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { SearchIcon } from "@/components/ui/icons";
import { BlogCard, FeaturedBlogTeaser } from "@/components/BlogTeaser";
import { getPublicPostsPage } from "@/lib/db/queries/blog";
import { blogFiltersToQuery, parseBlogFilters } from "@/lib/blog/filters";
import { BLOG_CATEGORIES } from "@/lib/types";

export const metadata = {
  title: "Blog",
  description: "Stories, memories and news from the Batch 11 community.",
};

export default async function BlogIndexPage({ searchParams }: PageProps<"/blog">) {
  const filters = parseBlogFilters(await searchParams);
  const { items, total, page, pageCount } = await getPublicPostsPage(filters);
  const filtered = !!(filters.q || filters.category);

  const baseQuery = blogFiltersToQuery(filters);
  const hrefWith = (overrides: { category?: string; page?: number }) => {
    const next = new URLSearchParams(baseQuery);
    if ("category" in overrides) {
      if (overrides.category) next.set("category", overrides.category);
      else next.delete("category");
    }
    if (overrides.page && overrides.page > 1) next.set("page", String(overrides.page));
    const qs = next.toString();
    return qs ? `/blog?${qs}` : "/blog";
  };

  // The lead story is the top result on an unfiltered first page; filtered or later
  // pages are an even grid.
  const lead = !filtered && page === 1 ? items[0] : undefined;
  const cards = lead ? items.slice(1) : items;

  const pill = (active: boolean) =>
    `inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold transition-colors ${
      active ? "bg-brand-green text-white" : "border border-border-default bg-white text-text-primary hover:bg-black/5"
    }`;

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Stories"
        title="Blog"
        description="Reunion plans, campus memories and career stories — written by the batch, for the batch."
      />

      <section className="flex flex-col gap-8 px-5 pb-24 md:px-20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav aria-label="Categories" className="flex flex-wrap gap-2">
            <Link href={hrefWith({ category: "" })} aria-current={!filters.category ? "page" : undefined} className={pill(!filters.category)}>
              All
            </Link>
            {BLOG_CATEGORIES.map((c) => (
              <Link key={c} href={hrefWith({ category: c })} aria-current={filters.category === c ? "page" : undefined} className={pill(filters.category === c)}>
                {c}
              </Link>
            ))}
          </nav>

          <form action="/blog" method="get" role="search" className="relative flex w-full items-center sm:w-80">
            {filters.category && <input type="hidden" name="category" value={filters.category} />}
            <span className="absolute left-3.5 text-text-secondary">
              <SearchIcon size={16} />
            </span>
            <input
              type="search"
              name="q"
              defaultValue={filters.q}
              aria-label="Search the blog"
              placeholder="Search stories, authors, tags"
              className="h-11 w-full rounded-xl border border-border-input bg-white pl-10 pr-3.5 text-sm"
            />
          </form>
        </div>

        <p className="text-sm text-text-secondary">
          {total === 0 ? "No stories found" : `${total} ${total === 1 ? "story" : "stories"}`}
          {filters.q && <> matching “{filters.q}”</>}
          {filters.category && <> in {filters.category}</>}
          {filtered && (
            <>
              {" · "}
              <Link href="/blog" className="font-semibold text-brand-green">
                Clear filters
              </Link>
            </>
          )}
        </p>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border-default py-16 text-center">
            <h2 className="font-serif text-2xl font-medium">{filtered ? "Nothing matches that" : "No stories yet"}</h2>
            <p className="max-w-md text-text-secondary">
              {filtered ? "Try a different word or category." : "Be the first to share a story with the batch."}
            </p>
            <Button href="/blog/submit" size="sm">
              Write for the blog
            </Button>
          </div>
        ) : (
          <>
            {lead && <FeaturedBlogTeaser post={lead} />}
            {cards.length > 0 && (
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {cards.map((p) => (
                  <BlogCard key={p.slug} post={p} />
                ))}
              </div>
            )}
            <Pagination pages={pageCount} current={page} hrefFor={(n) => hrefWith({ page: n })} />
          </>
        )}

        <div className="flex flex-col items-start justify-between gap-6 rounded-[20px] bg-brand-green p-8 text-bg-public sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1.5">
            <h2 className="font-serif text-2xl font-medium">Have a story to share?</h2>
            <p className="max-w-[560px] text-sm text-brand-green-tint">
              Batchmates can write for the blog. The committee reviews every post before it goes live.
            </p>
          </div>
          <Button href="/blog/submit" variant="onDark" className="shrink-0">
            Write for the blog
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
