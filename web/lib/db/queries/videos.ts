import { desc, eq } from "drizzle-orm";
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
};

function toVideo(row: {
  id: string;
  title: string;
  youtubeUrl: string | null;
  eventId: string | null;
  eventTitle: string | null;
  disciplineId: string | null;
  disciplineName: string | null;
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
  };
}

function selectVideos() {
  return db
    .select(videoColumns)
    .from(galleryVideos)
    .leftJoin(events, eq(events.id, galleryVideos.eventId))
    .leftJoin(disciplines, eq(disciplines.id, galleryVideos.disciplineId));
}

export async function getVideos(): Promise<Video[]> {
  const rows = await selectVideos().orderBy(desc(galleryVideos.createdAt));
  return rows.map(toVideo);
}

export async function getVideoById(id: string): Promise<Video | undefined> {
  const [row] = await selectVideos().where(eq(galleryVideos.id, id)).limit(1);
  return row ? toVideo(row) : undefined;
}
