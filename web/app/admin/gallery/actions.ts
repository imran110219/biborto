"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { count, eq } from "drizzle-orm";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@/lib/db/client";
import { events, disciplines, galleryAlbums, galleryPhotos } from "@/drizzle/schema";
import { requireAdminMemberId, requireSuperadmin } from "@/lib/auth/require-admin";
import { getR2BucketName, getR2Client } from "@/lib/r2";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function validateAlbumLinks(eventId: string | null, disciplineId: string | null) {
  if (eventId) {
    if (!UUID.test(eventId)) return "Choose a valid event.";
    const [found] = await db.select({ id: events.id }).from(events).where(eq(events.id, eventId)).limit(1);
    if (!found) return "That event does not exist.";
  }
  if (disciplineId) {
    if (!UUID.test(disciplineId)) return "Choose a valid discipline.";
    const [found] = await db.select({ id: disciplines.id }).from(disciplines).where(eq(disciplines.id, disciplineId)).limit(1);
    if (!found) return "That discipline does not exist.";
  }
  return undefined;
}

// Albums are structural (they show up in navigation and carry the
// event/discipline links), so only a superadmin creates them. Admins
// work inside existing albums — see updatePhotoCaption below and the
// upload route.
export async function createAlbum(_prevState: string | undefined, formData: FormData) {
  const superadminId = await requireSuperadmin();

  const name = String(formData.get("name") ?? "").trim();
  const eventId = String(formData.get("eventId") ?? "") || null;
  const disciplineId = String(formData.get("disciplineId") ?? "") || null;

  if (!name) return "Album name is required.";
  if (name.length > 120) return "Album name must be 120 characters or fewer.";

  const linkError = await validateAlbumLinks(eventId, disciplineId);
  if (linkError) return linkError;

  const base = slugify(name) || "album";
  const slug = `${base}-${randomUUID().slice(0, 8)}`;

  await db.insert(galleryAlbums).values({ slug, name, eventId, disciplineId, createdBy: superadminId });

  revalidatePath("/gallery");
  revalidatePath(`/gallery/${slug}`);
  revalidatePath("/admin/gallery");
  revalidatePath(`/admin/gallery/${slug}`);
  return undefined;
}

export async function updateAlbum(albumId: string, slug: string, _prevState: string | undefined, formData: FormData) {
  await requireSuperadmin();
  if (!UUID.test(albumId)) return "Choose a valid album.";

  const name = String(formData.get("name") ?? "").trim();
  const eventId = String(formData.get("eventId") ?? "") || null;
  const disciplineId = String(formData.get("disciplineId") ?? "") || null;
  if (!name) return "Album name is required.";
  if (name.length > 120) return "Album name must be 120 characters or fewer.";
  const linkError = await validateAlbumLinks(eventId, disciplineId);
  if (linkError) return linkError;

  const [updated] = await db.update(galleryAlbums)
    .set({ name, eventId, disciplineId })
    .where(eq(galleryAlbums.id, albumId))
    .returning({ id: galleryAlbums.id });
  if (!updated) return "That album no longer exists.";

  revalidatePath("/gallery");
  revalidatePath(`/gallery/${slug}`);
  revalidatePath("/admin/gallery");
  revalidatePath(`/admin/gallery/${slug}`);
  return "Album saved.";
}

export async function deleteAlbum(albumId: string, slug: string, _prevState: string | undefined, _formData: FormData) {
  await requireSuperadmin();
  if (!UUID.test(albumId)) return "Choose a valid album.";

  const [photoCount] = await db.select({ count: count() }).from(galleryPhotos).where(eq(galleryPhotos.albumId, albumId));
  if ((photoCount?.count ?? 0) > 0) return "Delete the album’s photos before deleting the album.";

  const [deleted] = await db.delete(galleryAlbums).where(eq(galleryAlbums.id, albumId)).returning({ id: galleryAlbums.id });
  if (!deleted) return "That album no longer exists.";

  revalidatePath("/gallery");
  revalidatePath(`/gallery/${slug}`);
  revalidatePath("/admin/gallery");
  revalidatePath(`/admin/gallery/${slug}`);
  redirect("/admin/gallery");
}

export async function updatePhotoCaption(photoId: string, albumSlug: string, _prevState: string | undefined, formData: FormData) {
  await requireAdminMemberId();
  if (!UUID.test(photoId)) return "Choose a valid photo.";

  const caption = String(formData.get("caption") ?? "").trim();
  if (caption.length > 250) return "Captions must be 250 characters or fewer.";

  const [photo] = await db
    .select({ id: galleryPhotos.id, albumSlug: galleryAlbums.slug })
    .from(galleryPhotos)
    .innerJoin(galleryAlbums, eq(galleryAlbums.id, galleryPhotos.albumId))
    .where(eq(galleryPhotos.id, photoId))
    .limit(1);
  if (!photo || photo.albumSlug !== albumSlug) return "That photo is no longer in this album.";

  await db.update(galleryPhotos).set({ caption: caption || null }).where(eq(galleryPhotos.id, photoId));

  revalidatePath(`/gallery/${albumSlug}`);
  revalidatePath(`/admin/gallery/${albumSlug}`);
  return "Saved.";
}

export async function deletePhoto(photoId: string, albumSlug: string, _prevState: string | undefined, _formData: FormData) {
  await requireAdminMemberId();
  if (!UUID.test(photoId)) return "Choose a valid photo.";

  const [photo] = await db
    .select({ id: galleryPhotos.id, r2Key: galleryPhotos.r2Key, albumSlug: galleryAlbums.slug })
    .from(galleryPhotos)
    .innerJoin(galleryAlbums, eq(galleryAlbums.id, galleryPhotos.albumId))
    .where(eq(galleryPhotos.id, photoId))
    .limit(1);
  if (!photo || photo.albumSlug !== albumSlug) return "That photo is no longer in this album.";

  const [deleted] = await db.delete(galleryPhotos).where(eq(galleryPhotos.id, photoId)).returning({ id: galleryPhotos.id });
  if (!deleted) return "That photo no longer exists.";

  let cleanupWarning = "";
  try {
    await getR2Client().send(new DeleteObjectCommand({ Bucket: getR2BucketName(), Key: photo.r2Key }));
  } catch (error) {
    console.error("Deleted gallery photo could not be removed from R2.", error);
    cleanupWarning = " It was removed from the gallery, but its stored image could not be cleaned up.";
  }

  revalidatePath("/gallery");
  revalidatePath(`/gallery/${albumSlug}`);
  revalidatePath("/admin/gallery");
  revalidatePath(`/admin/gallery/${albumSlug}`);
  return `Photo deleted.${cleanupWarning}`;
}
