import { PublicLayout } from "@/components/layout/PublicLayout";
import { PageHero } from "@/components/ui/PageHero";
import { AlbumCard } from "@/components/GalleryCards";
import { VideoCard } from "@/components/VideoCard";
import { getGalleryAlbums, getGalleryVideos } from "@/lib/db/queries/gallery";
import { GalleryTabs } from "./GalleryTabs";

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
        <GalleryTabs
          albumCards={albums.map((album) => (
            <AlbumCard
              key={album.slug}
              slug={album.slug}
              name={album.name}
              count={album.count}
              coverImageUrl={album.coverImageUrl}
              context={[album.eventTitle, album.disciplineName].filter(Boolean).join(" · ")}
            />
          ))}
          videoCards={videos.map((video) => <VideoCard key={video.id} video={video} />)}
        />
      </section>
    </PublicLayout>
  );
}
