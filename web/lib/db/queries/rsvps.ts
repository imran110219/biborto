import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { eventRsvps } from "@/drizzle/schema";
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
