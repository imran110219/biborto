import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { getAdminAlbumPhotos, getAlbumBySlug } from "@/lib/db/queries/gallery";
import { CaptionForm } from "./CaptionForm";

export default async function AdminAlbumPhotosPage({ params }: PageProps<"/admin/photos/[slug]">) {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);
  if (!album) notFound();
  const photos = await getAdminAlbumPhotos(album.id);

  return (
    <AdminLayout>
      <Link href="/admin/photos" className="text-sm font-semibold text-brand-green">← All albums</Link>
      <div className="mt-3 flex flex-col gap-1.5">
        <h1 className="font-serif text-4xl font-medium">{album.name}</h1>
        <p className="text-text-secondary">
          {[album.eventTitle && `Event: ${album.eventTitle}`, album.disciplineName && `Discipline: ${album.disciplineName}`]
            .filter(Boolean)
            .join(" · ") || "Not linked to an event or discipline."}
        </p>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo) => (
          <div key={photo.id} className="flex flex-col gap-3 rounded-2xl border border-border-default bg-white p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.imageUrl} alt={photo.caption || ""} className="aspect-[4/3] w-full rounded-xl object-cover" />
            <CaptionForm photoId={photo.id} albumSlug={album.slug} caption={photo.caption} />
          </div>
        ))}
        {photos.length === 0 && <p className="text-sm text-text-secondary">No photos in this album yet.</p>}
      </div>
    </AdminLayout>
  );
}
