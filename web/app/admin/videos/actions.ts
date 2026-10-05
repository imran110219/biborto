"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { galleryVideos } from "@/drizzle/schema";
import { requireAdminMemberId } from "@/lib/auth/require-admin";
import { parseYoutubeId, youtubeWatchUrl } from "@/lib/youtube";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Reads and validates the shared create/update fields. The YouTube link
// is required and stored in canonical watch-URL form, so only real video
// IDs ever reach the page. Event/discipline are optional; a bad id is
// rejected rather than silently dropped.
type VideoForm =
  | { error: string }
  | { error?: undefined; values: { title: string; youtubeUrl: string; eventId: string | null; disciplineId: string | null } };

function readVideoForm(formData: FormData): VideoForm {
  const title = String(formData.get("title") ?? "").trim();
  const rawUrl = String(formData.get("youtubeUrl") ?? "").trim();
  const eventId = String(formData.get("eventId") ?? "") || null;
  const disciplineId = String(formData.get("disciplineId") ?? "") || null;

  if (!title) return { error: "Title is required." };
  if (title.length > 160) return { error: "Title must be 160 characters or fewer." };
  const videoId = parseYoutubeId(rawUrl);
  if (!videoId) return { error: "Enter a valid YouTube link (youtube.com or youtu.be)." };
  if ((eventId && !UUID.test(eventId)) || (disciplineId && !UUID.test(disciplineId))) {
    return { error: "Choose a valid event or discipline." };
  }
  return { values: { title, youtubeUrl: youtubeWatchUrl(videoId), eventId, disciplineId } };
}

const revalidateVideoPaths = () => {
  revalidatePath("/admin/videos");
  revalidatePath("/gallery");
  revalidatePath("/");
};

export async function createVideo(_prevState: string | undefined, formData: FormData) {
  const adminId = await requireAdminMemberId();
  const form = readVideoForm(formData);
  if (form.error !== undefined) return form.error;

  await db.insert(galleryVideos).values({ ...form.values, addedBy: adminId });

  revalidateVideoPaths();
  redirect("/admin/videos");
}

export async function updateVideo(id: string, _prevState: string | undefined, formData: FormData) {
  await requireAdminMemberId();
  const form = readVideoForm(formData);
  if (form.error !== undefined) return form.error;

  await db.update(galleryVideos).set(form.values).where(eq(galleryVideos.id, id));

  revalidateVideoPaths();
  revalidatePath(`/admin/videos/${id}/edit`);
  redirect("/admin/videos");
}

export async function deleteVideo(id: string, _formData: FormData) {
  await requireAdminMemberId();
  await db.delete(galleryVideos).where(eq(galleryVideos.id, id));
  revalidateVideoPaths();
}
