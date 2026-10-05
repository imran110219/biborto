import { count, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { disciplines, events, galleryAlbums, galleryPhotos } from "@/drizzle/schema";
import { getR2PublicUrl } from "@/lib/r2";
import { getVideos } from "@/lib/db/queries/videos";
import type { Video } from "@/lib/types";

export interface GalleryAlbum {
  id: string;
  slug: string;
  name: string;
  count: string;
  coverImageUrl?: string;
  eventId?: string;
  eventTitle?: string;
  disciplineId?: string;
  disciplineName?: string;
}

export async function getGalleryAlbums(): Promise<GalleryAlbum[]> {
  const rows = await db
    .select({
      id: galleryAlbums.id,
      slug: galleryAlbums.slug,
      name: galleryAlbums.name,
      eventId: galleryAlbums.eventId,
      eventTitle: events.title,
      disciplineId: galleryAlbums.disciplineId,
      disciplineName: disciplines.name,
      photoCount: count(galleryPhotos.id),
      coverKey: sql<string | null>`(array_agg(${galleryPhotos.r2Key} order by ${galleryPhotos.createdAt}))[1]`,
    })
    .from(galleryAlbums)
    .leftJoin(galleryPhotos, eq(galleryPhotos.albumId, galleryAlbums.id))
    .leftJoin(events, eq(events.id, galleryAlbums.eventId))
    .leftJoin(disciplines, eq(disciplines.id, galleryAlbums.disciplineId))
    .groupBy(galleryAlbums.id, galleryAlbums.slug, galleryAlbums.name, events.title, disciplines.name)
    .orderBy(galleryAlbums.name);

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    count: `${row.photoCount} photo${row.photoCount === 1 ? "" : "s"}`,
    coverImageUrl: row.coverKey ? getR2PublicUrl(row.coverKey) : undefined,
    eventId: row.eventId ?? undefined,
    eventTitle: row.eventTitle ?? undefined,
    disciplineId: row.disciplineId ?? undefined,
    disciplineName: row.disciplineName ?? undefined,
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
  eventId?: string;
  eventTitle?: string;
  disciplineId?: string;
  disciplineName?: string;
  photos: AlbumPhoto[];
}

export async function getAlbumBySlug(slug: string): Promise<AlbumDetail | undefined> {
  const [album] = await db
    .select({
      id: galleryAlbums.id,
      slug: galleryAlbums.slug,
      name: galleryAlbums.name,
      eventId: galleryAlbums.eventId,
      eventTitle: events.title,
      disciplineId: galleryAlbums.disciplineId,
      disciplineName: disciplines.name,
    })
    .from(galleryAlbums)
    .leftJoin(events, eq(events.id, galleryAlbums.eventId))
    .leftJoin(disciplines, eq(disciplines.id, galleryAlbums.disciplineId))
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
    eventId: album.eventId ?? undefined,
    eventTitle: album.eventTitle ?? undefined,
    disciplineId: album.disciplineId ?? undefined,
    disciplineName: album.disciplineName ?? undefined,
    photos: photoRows.map((p) => ({ id: p.id, imageUrl: getR2PublicUrl(p.r2Key), caption: p.caption ?? undefined })),
  };
}

// Public gallery shows only videos with a valid YouTube link — a seeded
// row whose link hasn't been filled in yet has nothing to play.
export async function getGalleryVideos(): Promise<Video[]> {
  return (await getVideos()).filter((v) => v.youtubeId);
}

export interface AdminPhoto {
  id: string;
  imageUrl: string;
  caption: string;
}

export async function getAdminAlbumPhotos(albumId: string): Promise<AdminPhoto[]> {
  const rows = await db
    .select({ id: galleryPhotos.id, r2Key: galleryPhotos.r2Key, caption: galleryPhotos.caption })
    .from(galleryPhotos)
    .where(eq(galleryPhotos.albumId, albumId))
    .orderBy(galleryPhotos.createdAt);
  return rows.map((p) => ({ id: p.id, imageUrl: getR2PublicUrl(p.r2Key), caption: p.caption ?? "" }));
}
