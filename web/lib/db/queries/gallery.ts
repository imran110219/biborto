import { count, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { galleryAlbums, galleryPhotos, galleryVideos } from "@/drizzle/schema";
import { getR2PublicUrl } from "@/lib/r2";

export interface GalleryAlbum {
  id: string;
  slug: string;
  name: string;
  count: string;
  coverImageUrl?: string;
}

export async function getGalleryAlbums(): Promise<GalleryAlbum[]> {
  const rows = await db
    .select({
      id: galleryAlbums.id,
      slug: galleryAlbums.slug,
      name: galleryAlbums.name,
      photoCount: count(galleryPhotos.id),
      coverKey: sql<string | null>`(array_agg(${galleryPhotos.r2Key} order by ${galleryPhotos.createdAt}))[1]`,
    })
    .from(galleryAlbums)
    .leftJoin(galleryPhotos, eq(galleryPhotos.albumId, galleryAlbums.id))
    .groupBy(galleryAlbums.id, galleryAlbums.slug, galleryAlbums.name)
    .orderBy(galleryAlbums.name);

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    count: `${row.photoCount} photo${row.photoCount === 1 ? "" : "s"}`,
    coverImageUrl: row.coverKey ? getR2PublicUrl(row.coverKey) : undefined,
  }));
}

export interface AlbumPhoto {
  id: string;
  imageUrl: string;
  caption?: string;
}

export interface AlbumDetail {
  id: string;
  slug: string;
  name: string;
  photos: AlbumPhoto[];
}

export async function getAlbumBySlug(slug: string): Promise<AlbumDetail | undefined> {
  const [album] = await db
    .select({ id: galleryAlbums.id, slug: galleryAlbums.slug, name: galleryAlbums.name })
    .from(galleryAlbums)
    .where(eq(galleryAlbums.slug, slug))
    .limit(1);

  if (!album) return undefined;

  const photoRows = await db
    .select({ id: galleryPhotos.id, r2Key: galleryPhotos.r2Key, caption: galleryPhotos.caption })
    .from(galleryPhotos)
    .where(eq(galleryPhotos.albumId, album.id))
    .orderBy(galleryPhotos.createdAt);

  return {
    id: album.id,
    slug: album.slug,
    name: album.name,
    photos: photoRows.map((p) => ({ id: p.id, imageUrl: getR2PublicUrl(p.r2Key), caption: p.caption ?? undefined })),
  };
}

export interface GalleryVideo {
  title: string;
}

export async function getGalleryVideos(): Promise<GalleryVideo[]> {
  const rows = await db.select({ title: galleryVideos.title }).from(galleryVideos).orderBy(galleryVideos.createdAt);
  return rows;
}
