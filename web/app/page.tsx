import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { PlaceholderMedia } from "@/components/ui/PlaceholderMedia";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatBar } from "@/components/StatTile";
import { EventCard } from "@/components/EventCard";
import { FeaturedBlogTeaser, BlogTeaserRow } from "@/components/BlogTeaser";
import { MemberCard } from "@/components/MemberCard";
import { AlbumCard, VideoCard } from "@/components/GalleryCards";
import { SponsorStrip } from "@/components/SponsorStrip";
import { DiamondPopup } from "@/components/DiamondPopup";
import { ArrowRightIcon, CalendarIcon } from "@/components/ui/icons";
import { getPublicMembers } from "@/lib/db/queries/members";
import { getActiveSponsors, getDiamondSponsor } from "@/lib/db/queries/sponsors";
import { getUpcomingEvents } from "@/lib/db/queries/events";
import { getPublishedPublicPosts } from "@/lib/db/queries/blog";
import { getGalleryAlbums, getGalleryVideos } from "@/lib/db/queries/gallery";
import { getHomeStats } from "@/lib/db/queries/stats";

export default async function HomePage() {
  const [diamondSponsor, stats, events, blogPosts, members, albums, videos, sponsors] = await Promise.all([
    getDiamondSponsor(),
    getHomeStats(),
    getUpcomingEvents(),
    getPublishedPublicPosts(),
    getPublicMembers(),
    getGalleryAlbums(),
    getGalleryVideos(),
    getActiveSponsors(),
  ]);
  const [featuredPost, ...otherPosts] = blogPosts;

  return (
    <PublicLayout>
      {diamondSponsor && <DiamondPopup sponsor={diamondSponsor} />}

      {/* Hero */}
      <section className="grid grid-cols-1 items-center gap-14 px-5 py-16 md:grid-cols-2 md:px-20 md:py-22">
        <div className="flex flex-col gap-7">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-accent-amber" />
            <span className="text-xs font-bold tracking-[0.1em] text-accent-amber uppercase">
              Khulna University · Batch 11
            </span>
          </div>
          <h1 className="font-serif text-6xl font-medium leading-[0.95] tracking-tight md:text-8xl">
            Different paths.
            <br />
            One batch.
          </h1>
          <p className="max-w-[520px] text-lg leading-relaxed text-text-muted">
            The home of Khulna University Batch 11. Find batchmates, read their stories, join the next
            reunion, and relive campus days in photos and videos.
          </p>
          <div className="flex flex-wrap gap-3.5">
            <Button href="/members">
              Find a batchmate <ArrowRightIcon />
            </Button>
            <Button href="/events" variant="secondary">
              Upcoming events
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 grid-rows-[250px_210px] gap-4">
          <div className="relative row-span-2 overflow-hidden rounded-[20px]">
            <PlaceholderMedia label="[Batch group photo]" className="h-full" rounded="rounded-none" />
            <div className="absolute inset-x-4 bottom-4 flex items-center gap-3.5 rounded-2xl bg-white p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-green text-bg-public">
                <CalendarIcon />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-text-secondary">Next gathering</span>
                <span className="text-sm font-semibold">Grand Reunion · Dec 12</span>
              </div>
            </div>
          </div>
          <PlaceholderMedia label="[Campus photo]" className="h-[250px]" />
          <PlaceholderMedia label="[Reunion photo]" className="h-[210px]" />
        </div>
      </section>

      <StatBar
        stats={[
          { value: String(stats.registeredBatchmates), label: "Registered batchmates" },
          { value: String(stats.disciplinesRepresented), label: "Disciplines represented" },
          { value: String(stats.countriesRepresented), label: "Countries we live in" },
          { value: String(stats.photosInArchive), label: "Photos in the archive" },
        ]}
      />

      {/* Events */}
      <section className="flex flex-col gap-10 px-5 pt-24 md:px-20">
        <SectionHeader eyebrow="Events" title="Coming up next" viewAllHref="/events" viewAllLabel="All events" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {events.slice(0, 3).map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      </section>

      {/* Blog */}
      {featuredPost && (
        <section className="flex flex-col gap-10 px-5 pt-24 md:px-20">
          <SectionHeader eyebrow="From the blog" title="Stories from batchmates" viewAllHref="/blog" viewAllLabel="Read the blog" />
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            <FeaturedBlogTeaser post={featuredPost} />
            <div className="flex flex-col">
              {otherPosts.map((p) => (
                <BlogTeaserRow key={p.slug} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Members */}
      <section className="flex flex-col gap-10 px-5 pt-24 md:px-20">
        <SectionHeader eyebrow="Members" title="Where batchmates are now" viewAllHref="/members" viewAllLabel="Browse the directory" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
          {members.slice(0, 4).map((m) => (
            <MemberCard key={m.id} member={m} />
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section className="flex flex-col gap-10 px-5 pt-24 md:px-20">
        <SectionHeader eyebrow="Gallery" title="Campus days, in pictures" viewAllHref="/gallery" viewAllLabel="Open the gallery" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {albums.map((a) => (
            <AlbumCard key={a.slug} slug={a.slug} name={a.name} count={a.count} coverImageUrl={a.coverImageUrl} />
          ))}
        </div>
      </section>

      {/* Videos */}
      <section className="flex flex-col gap-10 px-5 py-24 md:px-20">
        <SectionHeader eyebrow="Videos" title="Watch on our YouTube channel" viewAllHref="/gallery" viewAllLabel="All videos" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {videos.map((v) => (
            <VideoCard key={v.title} title={v.title} />
          ))}
        </div>
      </section>

      <SponsorStrip sponsors={sponsors.slice(0, 5)} />
    </PublicLayout>
  );
}
