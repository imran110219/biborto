import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { events } from "@/drizzle/schema";
import { eventMonthAbbrev, eventDayPadded, eventDateLabel, eventTimeLabel } from "@/lib/db/format";
import type { AdminEventDetail, EventItem } from "@/lib/types";

// "Today" as the committee sees it (Bangladesh), not the server's timezone.
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" }).format(new Date());

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
    isPublic: row.isPublic,
    past: row.eventDate < today(),
  };
}

// Returns every upcoming event ordered soonest-first — pages that only
// need "the featured one" or "the next 3" do that same .find/.filter/
// .slice the mock data always did, just on real rows now.
// Public site (landing page, /events, event pages): is_public events only.
export async function getUpcomingEvents(): Promise<EventItem[]> {
  const rows = await db
    .select()
    .from(events)
    .where(and(gte(events.eventDate, sql`current_date`), eq(events.isPublic, true)))
    .orderBy(events.eventDate);

  return rows.map(toEventItem);
}

// Admin dashboard: upcoming events whether or not they're public.
export async function getAdminUpcomingEvents(): Promise<EventItem[]> {
  const rows = await db
    .select()
    .from(events)
    .where(gte(events.eventDate, sql`current_date`))
    .orderBy(events.eventDate);

  return rows.map(toEventItem);
}

// Past events stay reachable by their link (RSVP is closed on them) and are
// listed under the "Past events" tab of /events.
export async function getPastEvents(): Promise<EventItem[]> {
  const rows = await db
    .select()
    .from(events)
    .where(and(lt(events.eventDate, sql`current_date`), eq(events.isPublic, true)))
    .orderBy(desc(events.eventDate));

  return rows.map(toEventItem);
}

export async function getEventBySlug(slug: string): Promise<EventItem | undefined> {
  const [row] = await db
    .select()
    .from(events)
    .where(and(eq(events.slug, slug), eq(events.isPublic, true)))
    .limit(1);

  return row ? toEventItem(row) : undefined;
}

// Raw date/time fields for the .ics download (EventItem only has display strings).
export async function getEventCalendarData(slug: string) {
  const [row] = await db
    .select({
      slug: events.slug,
      title: events.title,
      eventDate: events.eventDate,
      startTime: events.startTime,
      endTime: events.endTime,
      location: events.location,
      description: events.description,
      updatedAt: events.updatedAt,
    })
    .from(events)
    .where(and(eq(events.slug, slug), eq(events.isPublic, true)))
    .limit(1);
  return row;
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
    isPublic: row.isPublic,
  };
}
