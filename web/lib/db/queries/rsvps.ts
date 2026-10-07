import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { eventRsvps, events } from "@/drizzle/schema";
import type { RsvpStatus } from "@/lib/types";

export async function getMemberRsvpStatus(eventId: string, memberId: string): Promise<RsvpStatus | undefined> {
  const [row] = await db
    .select({ status: eventRsvps.status })
    .from(eventRsvps)
    .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.memberId, memberId)))
    .limit(1);
  return row?.status;
}

export async function getGoingCount(eventId: string): Promise<number> {
  const rows = await db
    .select({ id: eventRsvps.id })
    .from(eventRsvps)
    .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.status, "going")));
  return rows.length;
}

// There's no invite list in this schema — RSVP is opt-in, not
// invitation-gated — so "total" here means everyone who has responded
// at all (going + interested), not "everyone invited".
export async function getRsvpSummary(eventId: string): Promise<{ going: number; total: number }> {
  const rows = await db
    .select({ status: eventRsvps.status })
    .from(eventRsvps)
    .where(eq(eventRsvps.eventId, eventId));

  return {
    going: rows.filter((r) => r.status === "going").length,
    total: rows.filter((r) => r.status !== "declined").length,
  };
}

// Going-counts for many events in one query (event list pages).
export async function getGoingCounts(eventIds: string[]): Promise<Map<string, number>> {
  if (eventIds.length === 0) return new Map();
  const rows = await db
    .select({ eventId: eventRsvps.eventId, going: sql<number>`count(*)::int` })
    .from(eventRsvps)
    .where(and(inArray(eventRsvps.eventId, eventIds), eq(eventRsvps.status, "going")))
    .groupBy(eventRsvps.eventId);
  return new Map(rows.map((r) => [r.eventId, r.going]));
}

// The events a member has said they're going to, soonest first (upcoming) —
// backs "My events" on /account. Private events are excluded like everywhere public.
export async function getMemberGoingEvents(memberId: string) {
  const rows = await db
    .select({ id: events.id, slug: events.slug, title: events.title, eventDate: events.eventDate, location: events.location })
    .from(eventRsvps)
    .innerJoin(events, eq(events.id, eventRsvps.eventId))
    .where(and(eq(eventRsvps.memberId, memberId), eq(eventRsvps.status, "going"), eq(events.isPublic, true)))
    .orderBy(desc(events.eventDate));
  return rows;
}
