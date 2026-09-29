import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Sponsor } from "@/lib/types";

export function SponsorStrip({ sponsors }: { sponsors: Sponsor[] }) {
  return (
    <section className="flex flex-col gap-8 px-5 pb-20 md:px-20">
      <SectionHeader eyebrow="Partners" title="Supported by our sponsors" />
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-5">
        {sponsors.map((s) => (
          <div
            key={s.id}
            className="flex h-[100px] items-center justify-center rounded-2xl bg-placeholder-media px-4 text-center text-sm font-semibold text-placeholder-media-text"
          >
            [{s.name} logo]
          </div>
        ))}
      </div>
    </section>
  );
}
