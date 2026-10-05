import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";

// With `current` + `hrefFor` it renders real page links; without them it is the
// original static placeholder (still used by pages that aren't wired up yet).
export function Pagination({
  pages = 3,
  current,
  hrefFor,
}: {
  pages?: number;
  current?: number;
  hrefFor?: (page: number) => string;
}) {
  if (current && hrefFor) {
    if (pages <= 1) return null;
    return (
      <nav aria-label="Pagination" className="flex flex-wrap justify-center gap-2 py-10">
        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === current ? "page" : undefined}
            className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-semibold ${
              p === current ? "bg-brand-green text-white" : "border border-border-default bg-white"
            }`}
          >
            {p}
          </Link>
        ))}
        {current < pages && (
          <Link
            href={hrefFor(current + 1)}
            className="flex h-11 items-center gap-2 rounded-xl border border-border-default bg-white px-4 text-sm font-semibold"
          >
            Next <ArrowRightIcon />
          </Link>
        )}
      </nav>
    );
  }

  return (
    <nav aria-label="Pagination" className="flex justify-center gap-2 py-10">
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <a
          key={p}
          href="#"
          className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-semibold ${
            p === 1 ? "bg-brand-green text-white" : "border border-border-default bg-white"
          }`}
        >
          {p}
        </a>
      ))}
      <a
        href="#"
        className="flex h-11 items-center gap-2 rounded-xl border border-border-default bg-white px-4 text-sm font-semibold"
      >
        Next <ArrowRightIcon />
      </a>
    </nav>
  );
}
