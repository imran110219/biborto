"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { events, disciplines, galleryAlbums, galleryPhotos } from "@/drizzle/schema";
import { requireAdminMemberId, requireSuperadmin } from "@/lib/auth/require-admin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

  const base = slugify(name) || "album";
  const slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;

  await db.insert(galleryAlbums).values({ slug, name, eventId, disciplineId, createdBy: superadminId });

  revalidatePath("/gallery");
  revalidatePath("/admin/photos");
  return undefined;
}

export async function updatePhotoCaption(photoId: string, albumSlug: string, _prevState: string | undefined, formData: FormData) {
  await requireAdminMemberId();

  const caption = String(formData.get("caption") ?? "").trim();
  if (caption.length > 250) return "Captions must be 250 characters or fewer.";

  await db.update(galleryPhotos).set({ caption: caption || null }).where(eq(galleryPhotos.id, photoId));

  revalidatePath(`/gallery/${albumSlug}`);
  revalidatePath(`/admin/photos/${albumSlug}`);
  return "Saved.";
}
