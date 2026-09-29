import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PlaceholderMedia } from "@/components/ui/PlaceholderMedia";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CategoryTag } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EventCard } from "@/components/EventCard";
import { ArrowRightIcon, CalendarIcon, ClockIcon, MembersIcon, PinIcon } from "@/components/ui/icons";
import { getUpcomingEvents, getEventBySlug } from "@/lib/db/queries/events";
import { getDiamondSponsor } from "@/lib/db/queries/sponsors";

export async function generateStaticParams() {
  const events = await getUpcomingEvents();
  return events.map((e) => ({ slug: e.slug }));
}

export default async function EventDetailPage({ params }: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const others = (await getUpcomingEvents()).filter((e) => e.slug !== event.slug).slice(0, 3);
  const sponsor = event.featured ? await getDiamondSponsor() : undefined;

  return (
    <PublicLayout>
      <article className="flex flex-col items-center gap-10 px-5 pt-16 md:px-20">
        <div className="flex w-full max-w-[820px] flex-col gap-5">
          <div className="flex items-center gap-2.5 text-sm text-text-secondary">
            <Link href="/events">Events</Link>
            <span>/</span>
            <span>{event.category}</span>
          </div>
          {event.featured && <CategoryTag>Featured · {event.category}</CategoryTag>}
          <h1 className="font-serif text-4xl font-medium leading-tight tracking-tight md:text-[58px]">
            {event.title}
          </h1>
          <div className="grid grid-cols-1 gap-3.5 text-[15px] sm:grid-cols-2">
            <span className="flex items-center gap-2.5">
              <CalendarIcon className="text-brand-green" /> {event.dateLabel}
            </span>
            <span className="flex items-center gap-2.5">
              <ClockIcon className="text-brand-green" /> {event.timeLabel}
            </span>
            <span className="flex items-center gap-2.5">
              <PinIcon className="text-brand-green" size={18} /> {event.location}
            </span>
            <span className="flex items-center gap-2.5">
              <MembersIcon className="text-brand-green" /> [00] batchmates going
            </span>
          </div>
        </div>

        <PlaceholderMedia label={`[Event banner: ${event.title}]`} className="h-[300px] w-full max-w-[1120px] md:h-[480px]" rounded="rounded-3xl" />

        <div className="flex w-full max-w-[720px] flex-col gap-6">
          {event.description && <p className="text-lg leading-relaxed text-text-article">{event.description}</p>}

          {sponsor && (
            <div className="flex items-center gap-2.5 text-sm text-text-secondary">
              <span>Sponsored by</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-green-tint font-serif text-xs font-semibold text-brand-green">
                {sponsor.initials}
              </span>
              <span className="font-semibold text-text-primary">{sponsor.name}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button href="/signin">
              RSVP, I&apos;m going <ArrowRightIcon />
            </Button>
            <Button href="#" variant="secondary">
              Add to calendar
            </Button>
          </div>
        </div>
      </article>

      {others.length > 0 && (
        <section className="mt-24 flex flex-col gap-10 bg-[#EDE8DC] px-5 py-20 md:px-20">
          <SectionHeader eyebrow="Keep browsing" title="More upcoming events" viewAllHref="/events" viewAllLabel="All events" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {others.map((e) => (
              <EventCard key={e.slug} event={e} />
            ))}
          </div>
        </section>
      )}
    </PublicLayout>
  );
}
