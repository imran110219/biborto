// Shared formatting helpers for turning DB rows into the display strings
// web/lib/types.ts's components already expect (e.g. Member.joinedAt is
// "Jan 2025", not a timestamp) — kept here rather than duplicated across
// every query file in lib/db/queries/.

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function formatMonthYear(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(new Date(date));
}

export function formatMonthDay(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(date));
}

export function eventMonthAbbrev(date: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(date)).toUpperCase();
}

export function eventDayPadded(date: string): string {
  return String(new Date(date).getUTCDate()).padStart(2, "0");
}

export function eventDateLabel(date: string, featured: boolean): string {
  if (featured) {
    return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric" }).format(
      new Date(date)
    );
  }
  return `${new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(date))} ${eventDayPadded(date)}`;
}

// start/end come back from Postgres `time` columns as "HH:MM:SS" strings.
export function eventTimeLabel(start: string | null, end: string | null): string {
  if (!start) return "";
  return end ? `${formatClockTime(start)} – ${formatClockTime(end)}` : formatClockTime(start);
}

function formatClockTime(hhmmss: string): string {
  const [h, m] = hhmmss.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

// Read time isn't stored (see db/schema.sql) — derived here at ~200
// words/min, same convention the mockup's bracketed placeholders implied.
export function estimateReadTime(body: string): string {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min`;
}
