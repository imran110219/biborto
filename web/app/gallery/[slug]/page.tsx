import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PlaceholderMedia } from "@/components/ui/PlaceholderMedia";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AlbumCard } from "@/components/GalleryCards";
import Image from "next/image";
import { getGalleryAlbums, getAlbumBySlug } from "@/lib/db/queries/gallery";

export async function generateStaticParams() {
  const albums = await getGalleryAlbums();
  return albums.map((a) => ({ slug: a.slug }));
}

export default async function AlbumDetailPage({ params }: PageProps<"/gallery/[slug]">) {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);
  if (!album) notFound();

  const others = (await getGalleryAlbums()).filter((a) => a.slug !== album.slug);

  return (
    <PublicLayout>
      <section className="flex flex-col gap-8 px-5 pt-16 md:px-20">
        <div className="flex items-center gap-2.5 text-sm text-text-secondary">
          <Link href="/gallery">Gallery</Link>
          <span>/</span>
          <span>{album.name}</span>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <h1 className="font-serif text-4xl font-medium">{album.name}</h1>
            <p className="text-text-secondary">
              {album.photos.length} photo{album.photos.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {album.photos.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 pb-24 sm:grid-cols-2 md:grid-cols-3">
            {album.photos.map((photo) => (
              <figure key={photo.id} className="flex flex-col gap-2">
                <div className="relative h-[260px] overflow-hidden rounded-2xl bg-placeholder-media">
                  <Image
                    src={photo.imageUrl}
                    alt={photo.caption || `Photo from ${album.name}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                {photo.caption && <figcaption className="text-sm text-text-secondary">{photo.caption}</figcaption>}
              </figure>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border-default py-16 text-center text-text-secondary">
            <span>No photos uploaded to this album yet.</span>
            <span className="text-sm">Gallery photos are shared by the Batch 11 committee.</span>
          </div>
        )}
      </section>

      {others.length > 0 && (
        <section className="mt-8 flex flex-col gap-10 bg-[#EDE8DC] px-5 py-20 md:px-20">
          <SectionHeader eyebrow="Keep browsing" title="More albums" viewAllHref="/gallery" viewAllLabel="All albums" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {others.map((a) => (
            <AlbumCard key={a.slug} slug={a.slug} name={a.name} count={a.count} coverImageUrl={a.coverImageUrl} />
            ))}
          </div>
        </section>
      )}
    </PublicLayout>
  );
}
