"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { eventRsvps, events } from "@/drizzle/schema";
import { requireMemberId } from "@/lib/auth/session-member";

// RSVPs are only for events the public site shows; a private event can't be
// RSVP'd to even by calling the action directly.
async function requirePublicEvent(eventId: string) {
  const [event] = await db.select({ id: events.id }).from(events).where(and(eq(events.id, eventId), eq(events.isPublic, true))).limit(1);
  if (!event) throw new Error("Event not found.");
}

export async function rsvpGoing(eventId: string, slug: string, _formData: FormData) {
  const memberId = await requireMemberId();
  await requirePublicEvent(eventId);

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
