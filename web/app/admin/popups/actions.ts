"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { popups } from "@/drizzle/schema";
import { requireSuperadmin } from "@/lib/auth/require-admin";
import { parsePopupForm } from "@/lib/popups/form";
import { getR2BucketName, getR2Client } from "@/lib/r2";

// Popups are superadmin-only end to end. At most one popup is active (a
// partial unique index enforces it); activating one deactivates the rest.

const revalidatePopupPaths = () => {
  revalidatePath("/");
  revalidatePath("/admin/popups");
};

const NEEDS_IMAGE = "Upload an image before activating this popup.";

export async function createPopup(_prevState: string | undefined, formData: FormData) {
  const actorId = await requireSuperadmin();
  const parsed = parsePopupForm(formData);
  if ("error" in parsed) return parsed.error;
  const values = parsed.values;

  // An image popup has no image yet, so it can't go live until one is uploaded.
  const active = values.active && values.kind === "html";

  const [created] = await db.transaction(async (tx) => {
    if (active) await tx.update(popups).set({ active: false }).where(eq(popups.active, true));
    return tx.insert(popups).values({ ...values, active, createdBy: actorId }).returning({ id: popups.id });
  });

  revalidatePopupPaths();
  // Image popups continue straight to the upload step.
  redirect(values.kind === "image" ? `/admin/popups/${created.id}/edit` : "/admin/popups");
}

export async function updatePopup(id: string, _prevState: string | undefined, formData: FormData) {
  await requireSuperadmin();
  const parsed = parsePopupForm(formData);
  if ("error" in parsed) return parsed.error;
  const values = parsed.values;

  const [existing] = await db.select({ imageKey: popups.imageKey }).from(popups).where(eq(popups.id, id)).limit(1);
  if (!existing) return "Popup not found.";
  if (values.active && values.kind === "image" && !existing.imageKey) return NEEDS_IMAGE;

  await db.transaction(async (tx) => {
    if (values.active) await tx.update(popups).set({ active: false }).where(and(eq(popups.active, true), ne(popups.id, id)));
    await tx.update(popups).set(values).where(eq(popups.id, id));
  });

  revalidatePopupPaths();
  redirect("/admin/popups");
}

export async function setPopupActive(id: string, active: boolean, _formData: FormData) {
  await requireSuperadmin();

  const [existing] = await db.select({ kind: popups.kind, imageKey: popups.imageKey, html: popups.htmlContent }).from(popups).where(eq(popups.id, id)).limit(1);
  if (!existing) return;
  if (active && existing.kind === "image" && !existing.imageKey) return; // nothing to show yet

  await db.transaction(async (tx) => {
    if (active) await tx.update(popups).set({ active: false }).where(and(eq(popups.active, true), ne(popups.id, id)));
    await tx.update(popups).set({ active }).where(eq(popups.id, id));
  });

  revalidatePopupPaths();
}

export async function deletePopup(id: string, _formData: FormData) {
  await requireSuperadmin();

  const [existing] = await db.select({ imageKey: popups.imageKey }).from(popups).where(eq(popups.id, id)).limit(1);
  if (!existing) return;
  await db.delete(popups).where(eq(popups.id, id));

  if (existing.imageKey) {
    try {
      await getR2Client().send(new DeleteObjectCommand({ Bucket: getR2BucketName(), Key: existing.imageKey }));
    } catch (error) {
      console.error("Popup image cleanup failed.", error); // the row is gone; an orphaned object is harmless
    }
  }

  revalidatePopupPaths();
}
