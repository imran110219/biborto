import Link from "next/link";
import { cancelRsvp } from "@/app/events/[slug]/actions";
import { eventDateLabel } from "@/lib/db/format";

type GoingEvent = { id: string; slug: string; title: string; eventDate: string; location: string | null };

const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" }).format(new Date());

// Events the member has RSVP'd "going" to. Upcoming ones can be cancelled here; past
// ones are kept as a history.
export function MyEvents({ events }: { events: GoingEvent[] }) {
  const now = today();
  const upcoming = events.filter((e) => e.eventDate >= now).sort((a, b) => a.eventDate.localeCompare(b.eventDate));
  const past = events.filter((e) => e.eventDate < now);

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border-default bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-medium">My events</h2>
          <p className="text-sm text-text-secondary">Events you&apos;ve RSVP&apos;d to.</p>
        </div>
        <Link href="/events" className="inline-flex h-10 items-center rounded-[10px] bg-brand-green px-4 text-sm font-semibold text-white">
          Browse events
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-text-secondary">You haven&apos;t RSVP&apos;d to any event yet.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-[#EFEAE0]">
          {[...upcoming, ...past].map((e) => {
            const isPast = e.eventDate < now;
            return (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <Link href={`/events/${e.slug}`} className="truncate text-[15px] font-semibold text-brand-green">
                    {e.title}
                  </Link>
                  <p className="text-xs text-text-secondary">
                    {eventDateLabel(e.eventDate, false)}, {e.eventDate.slice(0, 4)}
                    {e.location ? ` · ${e.location}` : ""}
                    {isPast ? " · attended" : ""}
                  </p>
                </div>
                {!isPast && (
                  <form action={cancelRsvp.bind(null, e.id, e.slug)}>
                    <button type="submit" className="h-9 rounded-[10px] border border-border-input px-3 text-sm font-semibold">
                      Cancel RSVP
                    </button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
