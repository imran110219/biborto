"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { sponsors } from "@/drizzle/schema";
import { requireSuperadmin } from "@/lib/auth/require-admin";
import { parseSponsorForm } from "@/lib/sponsors/form";
import { getR2BucketName, getR2Client } from "@/lib/r2";

// Sponsor management is superadmin-only (admins get a read-only list).
// There can be at most one *active* diamond sponsor — a partial unique index
// enforces it, and activating a diamond deactivates the previous one first.

const revalidateSponsorPaths = () => {
  revalidatePath("/admin/sponsors");
  revalidatePath("/");
  revalidatePath("/events");
};

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// Call before writing a row that will be an active diamond.
async function deactivateOtherDiamonds(tx: Tx, exceptId?: string) {
  const others = exceptId
    ? and(eq(sponsors.tier, "diamond"), eq(sponsors.active, true), ne(sponsors.id, exceptId))
    : and(eq(sponsors.tier, "diamond"), eq(sponsors.active, true));
  await tx.update(sponsors).set({ active: false }).where(others);
}

function isForeignKeyError(error: unknown) {
  const e = error as { code?: string; cause?: { code?: string } };
  return (e.code ?? e.cause?.code) === "23503";
}

export async function createSponsor(_prevState: string | undefined, formData: FormData) {
  await requireSuperadmin();
  const parsed = parseSponsorForm(formData);
  if ("error" in parsed) return parsed.error;
  const values = parsed.values;

  let createdId: string;
  try {
    [{ id: createdId }] = await db.transaction(async (tx) => {
      if (values.active && values.tier === "diamond") await deactivateOtherDiamonds(tx);
      return tx.insert(sponsors).values(values).returning({ id: sponsors.id });
    });
  } catch (error) {
    if (isForeignKeyError(error)) return "Choose a valid business.";
    throw error;
  }

  revalidateSponsorPaths();
  redirect(`/admin/sponsors/${createdId}/edit`); // next step: add the logo
}

export async function updateSponsor(id: string, _prevState: string | undefined, formData: FormData) {
  await requireSuperadmin();
  const parsed = parseSponsorForm(formData);
  if ("error" in parsed) return parsed.error;
  const values = parsed.values;

  const [existing] = await db.select({ id: sponsors.id }).from(sponsors).where(eq(sponsors.id, id)).limit(1);
  if (!existing) return "Sponsor not found.";

  try {
    await db.transaction(async (tx) => {
      if (values.active && values.tier === "diamond") await deactivateOtherDiamonds(tx, id);
      await tx.update(sponsors).set(values).where(eq(sponsors.id, id));
    });
  } catch (error) {
    if (isForeignKeyError(error)) return "Choose a valid business.";
    throw error;
  }

  revalidateSponsorPaths();
  revalidatePath(`/admin/sponsors/${id}/edit`);
  redirect("/admin/sponsors");
}

export async function toggleSponsorActive(id: string, active: boolean, _formData: FormData) {
  await requireSuperadmin();
  const [existing] = await db.select({ tier: sponsors.tier }).from(sponsors).where(eq(sponsors.id, id)).limit(1);
  if (!existing) return;

  const next = !active;
  await db.transaction(async (tx) => {
    if (next && existing.tier === "diamond") await deactivateOtherDiamonds(tx, id);
    await tx.update(sponsors).set({ active: next }).where(eq(sponsors.id, id));
  });
  revalidateSponsorPaths();
}

export async function deleteSponsor(id: string, _formData: FormData) {
  await requireSuperadmin();
  const [existing] = await db.select({ logoKey: sponsors.logoKey }).from(sponsors).where(eq(sponsors.id, id)).limit(1);
  if (!existing) return;
  await db.delete(sponsors).where(eq(sponsors.id, id));

  if (existing.logoKey) {
    try {
      await getR2Client().send(new DeleteObjectCommand({ Bucket: getR2BucketName(), Key: existing.logoKey }));
    } catch (error) {
      console.error("Sponsor logo cleanup failed.", error); // row is gone; an orphaned object is harmless
    }
  }
  revalidateSponsorPaths();
}
