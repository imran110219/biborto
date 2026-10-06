import { SectionHeader } from "@/components/ui/SectionHeader";
import { externalUrl } from "@/lib/url";
import type { Sponsor } from "@/lib/types";

const cardClasses =
  "flex h-[100px] items-center justify-center rounded-2xl border border-border-default bg-white px-5 text-center text-sm font-semibold transition-colors";

function SponsorLogo({ sponsor }: { sponsor: Sponsor }) {
  if (sponsor.logoUrl) {
    /* eslint-disable-next-line @next/next/no-img-element -- remote R2 URL (logos may be GIF/WebP) */
    return <img src={sponsor.logoUrl} alt={sponsor.name} className="max-h-[64px] max-w-full object-contain" />;
  }
  // No logo uploaded yet: initials + name.
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-green-tint font-serif text-sm text-brand-green">
        {sponsor.initials}
      </span>
      <span className="text-left leading-tight">{sponsor.name}</span>
    </span>
  );
}

// Every active sponsor, ordered by tier (diamond first). Each card links to
// the sponsor's website when it has one.
export function SponsorStrip({ sponsors }: { sponsors: Sponsor[] }) {
  if (sponsors.length === 0) return null;

  return (
    <section className="flex flex-col gap-8 px-5 pb-20 md:px-20">
      <SectionHeader eyebrow="Partners" title="Supported by our sponsors" />
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-5">
        {sponsors.map((s) =>
          s.website ? (
            <a
              key={s.id}
              href={externalUrl(s.website)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${s.name} (opens their website)`}
              className={`${cardClasses} hover:border-brand-green`}
            >
              <SponsorLogo sponsor={s} />
            </a>
          ) : (
            <div key={s.id} className={cardClasses}>
              <SponsorLogo sponsor={s} />
            </div>
          ),
        )}
      </div>
    </section>
  );
}
