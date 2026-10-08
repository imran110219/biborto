"use server";

import { consume } from "@/lib/security/rate-limit";
import { LIMITS } from "@/lib/security/limits";
import { revalidatePath } from "next/cache";
import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { eventRsvps, events } from "@/drizzle/schema";
import { requireMemberId } from "@/lib/auth/session-member";

// RSVPs are only for upcoming events the public site shows; a private or past
// event can't be RSVP'd to even by calling the action directly.
async function requirePublicEvent(eventId: string) {
  const [event] = await db.select({ id: events.id }).from(events).where(and(eq(events.id, eventId), eq(events.isPublic, true), gte(events.eventDate, sql`current_date`))).limit(1);
  if (!event) throw new Error("Event not found or already past.");
}

export async function rsvpGoing(eventId: string, slug: string, _formData: FormData) {
  const memberId = await requireMemberId();
  if (!(await consume(`rsvp:member:${memberId}`, LIMITS.rsvp)).allowed) return; // silently ignore a flood
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
  if (!(await consume(`rsvp:member:${memberId}`, LIMITS.rsvp)).allowed) return;

  await db
    .update(eventRsvps)
    .set({ status: "declined", updatedAt: new Date().toISOString() })
    .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.memberId, memberId)));

  revalidatePath(`/events/${slug}`);
}
