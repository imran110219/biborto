import Link from "next/link";
import { CategoryTag } from "@/components/ui/Badge";
import { ArrowRightIcon, ClockIcon, PinIcon } from "@/components/ui/icons";
import type { EventItem } from "@/lib/types";

export function EventCard({ event }: { event: EventItem }) {
  return (
    <article className="flex flex-col gap-5 rounded-[18px] border border-border-default bg-white p-7">
      <div className="flex items-center justify-between">
        <div className="flex h-[76px] w-[72px] flex-col items-center justify-center rounded-2xl bg-brand-green-tint text-brand-green">
          <span className="text-xs font-bold tracking-[0.1em]">{event.month}</span>
          <span className="font-serif text-3xl font-semibold leading-none">{event.day}</span>
        </div>
        <CategoryTag>{event.category}</CategoryTag>
      </div>
      <h3 className="font-serif text-2xl font-medium leading-snug">{event.title}</h3>
      <div className="flex flex-col gap-2 text-sm text-text-secondary">
        <span className="flex items-center gap-2">
          <PinIcon size={16} /> {event.location}
        </span>
        <span className="flex items-center gap-2">
          <ClockIcon size={16} /> {event.timeLabel}
        </span>
      </div>
      <Link href={`/events/${event.slug}`} className="mt-auto flex items-center gap-2 text-sm font-semibold">
        View details <ArrowRightIcon />
      </Link>
    </article>
  );
}
