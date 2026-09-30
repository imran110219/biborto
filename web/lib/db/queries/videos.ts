import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { galleryVideos } from "@/drizzle/schema";
import type { Video } from "@/lib/types";

function toVideo(row: typeof galleryVideos.$inferSelect): Video {
  return { id: row.id, title: row.title, youtubeUrl: row.youtubeUrl ?? "" };
}

export async function getVideos(): Promise<Video[]> {
  const rows = await db.select().from(galleryVideos).orderBy(desc(galleryVideos.createdAt));
  return rows.map(toVideo);
}

export async function getVideoById(id: string): Promise<Video | undefined> {
  const [row] = await db.select().from(galleryVideos).where(eq(galleryVideos.id, id)).limit(1);
  return row ? toVideo(row) : undefined;
}
