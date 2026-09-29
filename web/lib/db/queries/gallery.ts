import { count, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { galleryAlbums, galleryPhotos, galleryVideos } from "@/drizzle/schema";

export interface GalleryAlbum {
  name: string;
  count: string;
}

export async function getGalleryAlbums(): Promise<GalleryAlbum[]> {
  const rows = await db
    .select({ name: galleryAlbums.name, photoCount: count(galleryPhotos.id) })
    .from(galleryAlbums)
    .leftJoin(galleryPhotos, eq(galleryPhotos.albumId, galleryAlbums.id))
    .groupBy(galleryAlbums.id, galleryAlbums.name)
    .orderBy(galleryAlbums.name);

  return rows.map((row) => ({
    name: row.name,
    count: `${row.photoCount} photo${row.photoCount === 1 ? "" : "s"}`,
  }));
}

export interface GalleryVideo {
  title: string;
}

export async function getGalleryVideos(): Promise<GalleryVideo[]> {
  const rows = await db.select({ title: galleryVideos.title }).from(galleryVideos).orderBy(galleryVideos.createdAt);
  return rows;
}
