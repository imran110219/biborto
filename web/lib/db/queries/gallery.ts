import { and, count, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { disciplines, events, galleryAlbums, galleryPhotos } from "@/drizzle/schema";
import { getR2PublicUrl } from "@/lib/r2";
import { getPublicVideos } from "@/lib/db/queries/videos";
import type { Video } from "@/lib/types";

export interface GalleryAlbum {
  id: string;
  slug: string;
  name: string;
  isPublic: boolean;
  count: string;
  coverImageUrl?: string;
  eventId?: string;
  eventTitle?: string;
  disciplineId?: string;
  disciplineName?: string;
}

// `publicOnly` (the public site) returns only is_public albums and hides the
// linked event's title when that event isn't public; the admin list passes
// false to see everything.
async function listAlbums(publicOnly: boolean): Promise<GalleryAlbum[]> {
  const rows = await db
    .select({
      id: galleryAlbums.id,
      slug: galleryAlbums.slug,
      name: galleryAlbums.name,
      isPublic: galleryAlbums.isPublic,
      eventId: galleryAlbums.eventId,
      eventTitle: publicOnly ? sql<string | null>`case when ${events.isPublic} then ${events.title} end` : events.title,
      disciplineId: galleryAlbums.disciplineId,
      disciplineName: disciplines.name,
      photoCount: count(galleryPhotos.id),
      coverKey: sql<string | null>`(array_agg(${galleryPhotos.r2Key} order by ${galleryPhotos.createdAt}))[1]`,
    })
    .from(galleryAlbums)
    .leftJoin(galleryPhotos, eq(galleryPhotos.albumId, galleryAlbums.id))
    .leftJoin(events, eq(events.id, galleryAlbums.eventId))
    .leftJoin(disciplines, eq(disciplines.id, galleryAlbums.disciplineId))
    .where(publicOnly ? eq(galleryAlbums.isPublic, true) : undefined)
    .groupBy(galleryAlbums.id, galleryAlbums.slug, galleryAlbums.name, galleryAlbums.isPublic, events.title, events.isPublic, disciplines.name)
    .orderBy(galleryAlbums.name);

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    isPublic: row.isPublic,
    count: `${row.photoCount} photo${row.photoCount === 1 ? "" : "s"}`,
    coverImageUrl: row.coverKey ? getR2PublicUrl(row.coverKey) : undefined,
    eventId: row.eventId ?? undefined,
    eventTitle: row.eventTitle ?? undefined,
    disciplineId: row.disciplineId ?? undefined,
    disciplineName: row.disciplineName ?? undefined,
  }));
}

// Public site: is_public albums only.
export const getGalleryAlbums = () => listAlbums(true);

// Admin gallery list: every album, public or not.
export const getAdminGalleryAlbums = () => listAlbums(false);

export interface AlbumPhoto {
  id: string;
  imageUrl: string;
  caption?: string;
}

export interface AlbumDetail {
  id: string;
  slug: string;
  name: string;
  isPublic: boolean;
  eventId?: string;
  eventTitle?: string;
  disciplineId?: string;
  disciplineName?: string;
  photos: AlbumPhoto[];
}

// `includePrivate` is for the admin album page; the public page leaves it
// off, so a non-public album (and its photos) 404s for visitors.
export async function getAlbumBySlug(slug: string, { includePrivate = false } = {}): Promise<AlbumDetail | undefined> {
  const [album] = await db
    .select({
      id: galleryAlbums.id,
      slug: galleryAlbums.slug,
      name: galleryAlbums.name,
      isPublic: galleryAlbums.isPublic,
      eventId: galleryAlbums.eventId,
      eventTitle: includePrivate ? events.title : sql<string | null>`case when ${events.isPublic} then ${events.title} end`,
      disciplineId: galleryAlbums.disciplineId,
      disciplineName: disciplines.name,
    })
    .from(galleryAlbums)
    .leftJoin(events, eq(events.id, galleryAlbums.eventId))
    .leftJoin(disciplines, eq(disciplines.id, galleryAlbums.disciplineId))
    .where(includePrivate ? eq(galleryAlbums.slug, slug) : and(eq(galleryAlbums.slug, slug), eq(galleryAlbums.isPublic, true)))
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
    isPublic: album.isPublic,
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
  return (await getPublicVideos()).filter((v) => v.youtubeId);
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
