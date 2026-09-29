import Link from "next/link";
import { ArrowRightIcon } from "./icons";

export function SectionHeader({
  eyebrow,
  title,
  viewAllHref,
  viewAllLabel = "View all",
}: {
  eyebrow: string;
  title: string;
  viewAllHref?: string;
  viewAllLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-bold tracking-[0.1em] text-accent-amber uppercase">
          {eyebrow}
        </span>
        <h2 className="font-serif text-3xl font-medium leading-tight tracking-tight md:text-[44px]">
          {title}
        </h2>
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="flex items-center gap-2 text-sm font-semibold text-brand-green hover:underline"
        >
          {viewAllLabel}
          <ArrowRightIcon />
        </Link>
      )}
    </div>
  );
}
