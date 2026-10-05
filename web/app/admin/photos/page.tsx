import Link from "next/link";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { GalleryPhotoUploader } from "@/app/admin/photos/GalleryPhotoUploader";
import { getGalleryAlbums } from "@/lib/db/queries/gallery";

export default async function AdminPhotosPage() {
  const albums = await getGalleryAlbums();

  return (
    <AdminLayout>
      <div className="flex flex-col gap-1.5">
        <h1 className="font-serif text-4xl font-medium">Photos</h1>
        <p className="text-text-secondary">Upload and manage photos in the public gallery.</p>
      </div>

      <section className="mt-8 flex flex-col gap-5 rounded-2xl border border-border-default bg-white p-6">
        <div>
          <h2 className="text-lg font-semibold">Upload images</h2>
          <p className="mt-1 text-sm text-text-secondary">Only admins and superadmins can upload gallery images.</p>
        </div>
        <GalleryPhotoUploader albums={albums} />
      </section>

      <section className="mt-8 overflow-hidden rounded-2xl border border-border-default bg-white">
        <div className="border-b border-[#EFEAE0] px-5 py-4">
          <h2 className="font-semibold">Albums</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse">
            <thead className="bg-[#FAF8F3]">
              <tr>
                {["Album", "Photos", "Public page"].map((heading) => (
                  <th key={heading} className="px-4 py-3.5 pl-5 text-left text-xs font-bold uppercase tracking-[0.04em] text-text-secondary">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {albums.map((album) => (
                <tr key={album.id} className="border-t border-[#EFEAE0]">
                  <td className="px-4 py-3.5 pl-5 text-[15px] font-semibold">{album.name}</td>
                  <td className="px-4 py-3.5 text-sm text-text-secondary">{album.count}</td>
                  <td className="px-4 py-3.5 text-sm">
                    <Link href={`/gallery/${album.slug}`} className="font-semibold text-brand-green">View album</Link>
                  </td>
                </tr>
              ))}
              {albums.length === 0 && (
                <tr><td colSpan={3} className="px-5 py-8 text-sm text-text-secondary">No albums yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  );
}
