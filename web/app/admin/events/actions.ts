"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { events } from "@/drizzle/schema";
import { requireAdminMemberId } from "@/lib/auth/require-admin";
import { EVENT_CATEGORIES, type EventCategory } from "@/lib/types";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function readEventForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const eventDate = String(formData.get("eventDate") ?? "");
  const startTime = String(formData.get("startTime") ?? "").trim();
  const endTime = String(formData.get("endTime") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const category = String(formData.get("category") ?? "") as EventCategory | "";
  const description = String(formData.get("description") ?? "").trim();
  const featured = formData.get("featured") === "on";
  const isPublic = formData.get("isPublic") === "on";

  return { title, eventDate, startTime, endTime, location, category, description, featured, isPublic };
}

export async function createEvent(_prevState: string | undefined, formData: FormData) {
  const adminId = await requireAdminMemberId();
  const { title, eventDate, startTime, endTime, location, category, description, featured, isPublic } = readEventForm(formData);

  if (!title) return "Title is required.";
  if (!eventDate) return "Date is required.";
  if (category && !EVENT_CATEGORIES.includes(category)) return "Choose a valid category.";

  const slug = `${slugify(title)}-${Math.random().toString(36).slice(2, 7)}`;

  await db.insert(events).values({
    slug,
    title,
    eventDate,
    startTime: startTime || null,
    endTime: endTime || null,
    location: location || null,
    category: category || null,
    description: description || null,
    featured,
    isPublic,
    createdBy: adminId,
  });

  revalidatePath("/admin/events");
  revalidatePath("/admin/dashboard");
  revalidatePath("/events");
  revalidatePath("/"); // the landing page lists upcoming events
  redirect("/admin/events");
}

export async function updateEvent(id: string, _prevState: string | undefined, formData: FormData) {
  await requireAdminMemberId();
  const { title, eventDate, startTime, endTime, location, category, description, featured, isPublic } = readEventForm(formData);

  if (!title) return "Title is required.";
  if (!eventDate) return "Date is required.";
  if (category && !EVENT_CATEGORIES.includes(category)) return "Choose a valid category.";

  await db
    .update(events)
    .set({
      title,
      eventDate,
      startTime: startTime || null,
      endTime: endTime || null,
      location: location || null,
      category: category || null,
      description: description || null,
      featured,
      isPublic,
    })
    .where(eq(events.id, id));

  revalidatePath("/admin/events");
  revalidatePath("/admin/dashboard");
  revalidatePath("/events");
  revalidatePath("/"); // the landing page lists upcoming events
  revalidatePath(`/admin/events/${id}/edit`);
  redirect("/admin/events");
}

export async function deleteEvent(id: string, _formData: FormData) {
  await requireAdminMemberId();
  await db.delete(events).where(eq(events.id, id));

  revalidatePath("/admin/events");
  revalidatePath("/admin/dashboard");
  revalidatePath("/events");
  revalidatePath("/"); // the landing page lists upcoming events
}
