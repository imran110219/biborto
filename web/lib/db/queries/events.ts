import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { events } from "@/drizzle/schema";
import { eventMonthAbbrev, eventDayPadded, eventDateLabel, eventTimeLabel } from "@/lib/db/format";
import type { AdminEventDetail, EventItem } from "@/lib/types";

function toEventItem(row: typeof events.$inferSelect): EventItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    month: eventMonthAbbrev(row.eventDate),
    day: eventDayPadded(row.eventDate),
    dateLabel: eventDateLabel(row.eventDate, row.featured),
    timeLabel: eventTimeLabel(row.startTime, row.endTime),
    location: row.location ?? "",
    category: row.category ?? "",
    description: row.description ?? "",
    featured: row.featured,
  };
}

// Returns every upcoming event ordered soonest-first — pages that only
// need "the featured one" or "the next 3" do that same .find/.filter/
// .slice the mock data always did, just on real rows now.
export async function getUpcomingEvents(): Promise<EventItem[]> {
  const rows = await db
    .select()
    .from(events)
    .where(gte(events.eventDate, sql`current_date`))
    .orderBy(events.eventDate);

  return rows.map(toEventItem);
}

// Scoped to upcoming events only, same as getUpcomingEvents() — there's
// no "past events" page anywhere on the public site yet (the /events
// "Past events" tab is a decorative placeholder), so a past event's
// detail page correctly 404s for now rather than existing with nothing
// linking to it.
export async function getEventBySlug(slug: string): Promise<EventItem | undefined> {
  const [row] = await db
    .select()
    .from(events)
    .where(and(eq(events.slug, slug), gte(events.eventDate, sql`current_date`)))
    .limit(1);

  return row ? toEventItem(row) : undefined;
}

// Admin-only: every event regardless of date, newest first — unlike the
// two queries above, this backs a management list, not "what's upcoming
// to show a visitor".
export async function getAdminEvents(): Promise<EventItem[]> {
  const rows = await db.select().from(events).orderBy(desc(events.eventDate));
  return rows.map(toEventItem);
}

export async function getAdminEventById(id: string): Promise<AdminEventDetail | undefined> {
  const [row] = await db.select().from(events).where(eq(events.id, id)).limit(1);
  if (!row) return undefined;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    eventDate: row.eventDate,
    startTime: row.startTime?.slice(0, 5) ?? "",
    endTime: row.endTime?.slice(0, 5) ?? "",
    location: row.location ?? "",
    category: row.category ?? "",
    description: row.description ?? "",
    featured: row.featured,
  };
}
