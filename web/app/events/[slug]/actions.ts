"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { eventRsvps } from "@/drizzle/schema";
import { requireMemberId } from "@/lib/auth/session-member";

export async function rsvpGoing(eventId: string, slug: string, _formData: FormData) {
  const memberId = await requireMemberId();

  await db
    .insert(eventRsvps)
    .values({ eventId, memberId, status: "going" })
    .onConflictDoUpdate({
      target: [eventRsvps.eventId, eventRsvps.memberId],
      set: { status: "going", updatedAt: new Date().toISOString() },
    });

  revalidatePath(`/events/${slug}`);
}

export async function cancelRsvp(eventId: string, slug: string, _formData: FormData) {
  const memberId = await requireMemberId();

  await db
    .update(eventRsvps)
    .set({ status: "declined", updatedAt: new Date().toISOString() })
    .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.memberId, memberId)));

  revalidatePath(`/events/${slug}`);
}
