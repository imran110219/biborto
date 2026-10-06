import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { disciplines, events, galleryVideos } from "@/drizzle/schema";
import { parseYoutubeId } from "@/lib/youtube";
import type { Video } from "@/lib/types";

const videoColumns = {
  id: galleryVideos.id,
  title: galleryVideos.title,
  youtubeUrl: galleryVideos.youtubeUrl,
  eventId: galleryVideos.eventId,
  eventTitle: events.title,
  disciplineId: galleryVideos.disciplineId,
  disciplineName: disciplines.name,
  isPublic: galleryVideos.isPublic,
};

function toVideo(row: {
  id: string;
  title: string;
  youtubeUrl: string | null;
  eventId: string | null;
  eventTitle: string | null;
  disciplineId: string | null;
  disciplineName: string | null;
  isPublic: boolean;
}): Video {
  return {
    id: row.id,
    title: row.title,
    youtubeUrl: row.youtubeUrl ?? "",
    youtubeId: row.youtubeUrl ? parseYoutubeId(row.youtubeUrl) : undefined,
    eventId: row.eventId ?? undefined,
    eventTitle: row.eventTitle ?? undefined,
    disciplineId: row.disciplineId ?? undefined,
    disciplineName: row.disciplineName ?? undefined,
    isPublic: row.isPublic,
  };
}

// `publicOnly` also hides the event's title when that event is itself not
// public, so a public video never leaks a private event's name.
function selectVideos(publicOnly = false) {
  return db
    .select(
      publicOnly
        ? { ...videoColumns, eventTitle: sql<string | null>`case when ${events.isPublic} then ${events.title} end` }
        : videoColumns,
    )
    .from(galleryVideos)
    .leftJoin(events, eq(events.id, galleryVideos.eventId))
    .leftJoin(disciplines, eq(disciplines.id, galleryVideos.disciplineId));
}

// Admin-only: every video, public or not.
export async function getVideos(): Promise<Video[]> {
  const rows = await selectVideos().orderBy(desc(galleryVideos.createdAt));
  return rows.map(toVideo);
}

// Public site (landing page + /gallery): is_public videos only.
export async function getPublicVideos(): Promise<Video[]> {
  const rows = await selectVideos(true).where(eq(galleryVideos.isPublic, true)).orderBy(desc(galleryVideos.createdAt));
  return rows.map(toVideo);
}

export async function getVideoById(id: string): Promise<Video | undefined> {
  const [row] = await selectVideos().where(eq(galleryVideos.id, id)).limit(1);
  return row ? toVideo(row) : undefined;
}
