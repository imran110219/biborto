"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { galleryVideos } from "@/drizzle/schema";
import { requireAdminMemberId } from "@/lib/auth/require-admin";

const revalidateVideoPaths = () => {
  revalidatePath("/admin/videos");
  revalidatePath("/gallery");
};

export async function createVideo(_prevState: string | undefined, formData: FormData) {
  const adminId = await requireAdminMemberId();
  const title = String(formData.get("title") ?? "").trim();
  const youtubeUrl = String(formData.get("youtubeUrl") ?? "").trim();
  if (!title) return "Title is required.";

  await db.insert(galleryVideos).values({ title, youtubeUrl: youtubeUrl || null, addedBy: adminId });

  revalidateVideoPaths();
  redirect("/admin/videos");
}

export async function updateVideo(id: string, _prevState: string | undefined, formData: FormData) {
  await requireAdminMemberId();
  const title = String(formData.get("title") ?? "").trim();
  const youtubeUrl = String(formData.get("youtubeUrl") ?? "").trim();
  if (!title) return "Title is required.";

  await db.update(galleryVideos).set({ title, youtubeUrl: youtubeUrl || null }).where(eq(galleryVideos.id, id));

  revalidateVideoPaths();
  revalidatePath(`/admin/videos/${id}/edit`);
  redirect("/admin/videos");
}

export async function deleteVideo(id: string, _formData: FormData) {
  await requireAdminMemberId();
  await db.delete(galleryVideos).where(eq(galleryVideos.id, id));
  revalidateVideoPaths();
}
