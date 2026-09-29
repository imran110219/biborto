import Link from "next/link";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PageHero } from "@/components/ui/PageHero";
import { PlaceholderMedia } from "@/components/ui/PlaceholderMedia";
import { CategoryTag } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon, CalendarIcon, ClockIcon, MembersIcon, PinIcon } from "@/components/ui/icons";
import { getUpcomingEvents } from "@/lib/db/queries/events";
import { getDiamondSponsor } from "@/lib/db/queries/sponsors";

export default async function EventsPage() {
  const events = await getUpcomingEvents();
  const featured = events.find((e) => e.featured);
  const rest = events.filter((e) => !e.featured);
  const sponsor = await getDiamondSponsor();

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Events"
        title="Meet up, in person or online"
        description="Reunions, chapter get-togethers and online talks. Members can RSVP after signing in."
      />

      <section className="flex flex-col gap-8 px-5 pb-24 md:px-20">
        <div className="flex gap-2">
          <button className="h-11 rounded-full bg-text-primary px-5 text-sm font-semibold text-bg-public">
            Upcoming
          </button>
          <button className="h-11 rounded-full border border-border-input bg-white px-5 text-sm font-semibold">
            Past events
          </button>
        </div>

        {featured && (
          <article className="grid grid-cols-1 overflow-hidden rounded-3xl border border-border-default bg-white md:grid-cols-2">
            <PlaceholderMedia label="[Event banner]" className="min-h-[300px] md:min-h-[440px]" rounded="rounded-none" />
            <div className="flex flex-col gap-5 p-8 md:p-12">
              <CategoryTag>Featured · {featured.category}</CategoryTag>
              <h2 className="font-serif text-3xl font-medium leading-tight md:text-[44px]">{featured.title}</h2>
              <div className="grid grid-cols-1 gap-3.5 text-[15px] sm:grid-cols-2">
                <span className="flex items-center gap-2.5">
                  <CalendarIcon className="text-brand-green" /> {featured.dateLabel}
                </span>
                <span className="flex items-center gap-2.5">
                  <ClockIcon className="text-brand-green" /> {featured.timeLabel}
                </span>
                <span className="flex items-center gap-2.5">
                  <PinIcon className="text-brand-green" size={18} /> {featured.location}
                </span>
                <span className="flex items-center gap-2.5">
                  <MembersIcon className="text-brand-green" /> [00] batchmates going
                </span>
              </div>
              <p className="leading-relaxed text-text-muted">{featured.description}</p>
              {sponsor && (
                <div className="flex items-center gap-2.5 text-sm text-text-secondary">
                  <span>Sponsored by</span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-green-tint font-serif text-xs font-semibold text-brand-green">
                    {sponsor.initials}
                  </span>
                  <span className="font-semibold text-text-primary">{sponsor.name}</span>
                </div>
              )}
              <div className="mt-auto flex flex-wrap gap-3">
                <Button href="/signin">
                  RSVP, I&apos;m going <ArrowRightIcon />
                </Button>
                <Button href="#" variant="secondary">
                  Add to calendar
                </Button>
              </div>
            </div>
          </article>
        )}

        <h2 className="mt-6 font-serif text-2xl font-medium">More upcoming events</h2>
        <div className="flex flex-col rounded-[20px] border border-border-default bg-white">
          {rest.map((e) => (
            <div
              key={e.id}
              className="grid grid-cols-1 items-center gap-4 border-b border-border-default p-6 last:border-0 sm:grid-cols-[72px_1fr_auto_auto] sm:gap-7"
            >
              <div className="flex h-[76px] w-[72px] flex-col items-center justify-center rounded-2xl bg-brand-green-tint text-brand-green">
                <span className="text-xs font-bold tracking-[0.1em]">{e.month}</span>
                <span className="font-serif text-3xl font-semibold leading-none">{e.day}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-lg font-semibold">{e.title}</h3>
                <span className="flex items-center gap-2 text-[15px] text-text-secondary">
                  <PinIcon size={15} /> {e.location} · {e.timeLabel}
                </span>
              </div>
              <CategoryTag>{e.category}</CategoryTag>
              <Link href={`/events/${e.slug}`} className="inline-flex h-11 items-center rounded-full border border-border-input px-4 text-sm font-semibold">
                Details
              </Link>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
