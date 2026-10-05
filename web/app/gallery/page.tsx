import { PublicLayout } from "@/components/layout/PublicLayout";
import { PageHero } from "@/components/ui/PageHero";
import { AlbumCard } from "@/components/GalleryCards";
import { VideoCard } from "@/components/VideoCard";
import { getGalleryAlbums, getGalleryVideos } from "@/lib/db/queries/gallery";

export default async function GalleryPage() {
  const [albums, videos] = await Promise.all([getGalleryAlbums(), getGalleryVideos()]);

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Gallery & videos"
        title="Our shared archive"
        description="Photo albums from campus life and every gathering since, plus videos from the Batch 11 YouTube channel."
      />

      <section className="flex flex-col gap-8 px-5 pb-24 md:px-20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-1 rounded-full bg-black/5 p-1">
            <button className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold shadow-sm">
              Photo albums
            </button>
            <button className="rounded-full px-4 py-2.5 text-sm font-semibold text-text-secondary">Videos</button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {albums.map((a) => (
            <AlbumCard key={a.slug} slug={a.slug} name={a.name} count={a.count} coverImageUrl={a.coverImageUrl} />
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2">
          <span className="text-xs font-bold tracking-[0.1em] text-accent-amber uppercase">Videos</span>
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-3xl font-medium">From our YouTube channel</h2>
            <a href="#" className="text-sm font-semibold text-brand-green">
              Subscribe on YouTube →
            </a>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {videos.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
