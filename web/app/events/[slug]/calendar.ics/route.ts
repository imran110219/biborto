import { getEventCalendarData } from "@/lib/db/queries/events";

// RFC 5545 text escaping + line folding (75 octets; we fold by characters, which is
// safe for the mostly-ASCII content here and tolerated by calendar apps otherwise).
const esc = (v: string) => v.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/;/g, "\;").replace(/,/g, "\\,");
const fold = (line: string) => line.replace(/(.{73})(?=.)/g, "$1\r\n ");
const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

// "Add to calendar": a one-event .ics file for a public event. Times are floating
// local times (no timezone), so they show as written wherever the file is opened.
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = await getEventCalendarData(slug);
  if (!e) return new Response("Not found", { status: 404 });

  const day = e.eventDate.replace(/-/g, "");
  const time = (t: string) => t.slice(0, 5).replace(":", "") + "00";
  const when: string[] = [];
  if (e.startTime) {
    when.push(`DTSTART:${day}T${time(e.startTime)}`);
    // No end time → assume one hour so the entry has a sensible length.
    const end = e.endTime ?? `${String((Number(e.startTime.slice(0, 2)) + 1) % 24).padStart(2, "0")}${e.startTime.slice(2, 5)}`;
    when.push(`DTEND:${day}T${time(end)}`);
  } else {
    when.push(`DTSTART;VALUE=DATE:${day}`);
  }

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Batch 11 Khulna University//Events//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${e.slug}@batch11`,
    `DTSTAMP:${stamp(new Date(e.updatedAt))}`,
    ...when,
    `SUMMARY:${esc(e.title)}`,
    ...(e.location ? [`LOCATION:${esc(e.location)}`] : []),
    ...(e.description ? [`DESCRIPTION:${esc(e.description)}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return new Response(lines.map(fold).join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${e.slug}.ics"`,
    },
  });
}
