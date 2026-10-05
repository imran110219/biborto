"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { sponsors } from "@/drizzle/schema";
import { parseWebsite } from "@/lib/url";
import { requireAdminMemberId } from "@/lib/auth/require-admin";
import type { SponsorTier } from "@/lib/types";

const revalidateSponsorPaths = () => {
  revalidatePath("/admin/sponsors");
  revalidatePath("/");
  revalidatePath("/events");
};

function readSponsorForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const tier = String(formData.get("tier") ?? "bronze") as SponsorTier;
  const website = String(formData.get("website") ?? "").trim();
  const active = formData.get("active") === "on";
  return { name, tier, website, active };
}

export async function createSponsor(_prevState: string | undefined, formData: FormData) {
  await requireAdminMemberId();
  const { name, tier, website, active } = readSponsorForm(formData);
  if (!name) return "Name is required.";
  const websiteUrl = parseWebsite(website);
  if (websiteUrl === undefined) return "Enter a valid website address (http or https).";

  await db.insert(sponsors).values({ name, tier, website: websiteUrl, active });

  revalidateSponsorPaths();
  redirect("/admin/sponsors");
}

export async function updateSponsor(id: string, _prevState: string | undefined, formData: FormData) {
  await requireAdminMemberId();
  const { name, tier, website, active } = readSponsorForm(formData);
  if (!name) return "Name is required.";
  const websiteUrl = parseWebsite(website);
  if (websiteUrl === undefined) return "Enter a valid website address (http or https).";

  await db.update(sponsors).set({ name, tier, website: websiteUrl, active }).where(eq(sponsors.id, id));

  revalidateSponsorPaths();
  revalidatePath(`/admin/sponsors/${id}/edit`);
  redirect("/admin/sponsors");
}

export async function toggleSponsorActive(id: string, active: boolean, _formData: FormData) {
  await requireAdminMemberId();
  await db.update(sponsors).set({ active: !active }).where(eq(sponsors.id, id));
  revalidateSponsorPaths();
}

export async function deleteSponsor(id: string, _formData: FormData) {
  await requireAdminMemberId();
  await db.delete(sponsors).where(eq(sponsors.id, id));
  revalidateSponsorPaths();
}
