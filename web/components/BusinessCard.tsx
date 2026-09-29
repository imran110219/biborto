import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { CategoryTag } from "@/components/ui/Badge";
import { BriefcaseIcon, PinIcon } from "@/components/ui/icons";
import type { Business } from "@/lib/types";

export function BusinessCard({ business }: { business: Business }) {
  return (
    <article className="flex flex-col items-center gap-3.5 rounded-[18px] border border-border-default bg-white px-6 py-7 text-center">
      <Avatar initials={business.initials} size="lg" />
      <div className="flex flex-col items-center gap-1.5">
        <h3 className="text-lg font-semibold">{business.name}</h3>
        <CategoryTag>{business.category}</CategoryTag>
      </div>
      <div className="flex flex-col gap-1.5 text-sm">
        <span className="flex items-center justify-center gap-1.5">
          <BriefcaseIcon /> Owner: {business.ownerName}
        </span>
        <span className="flex items-center justify-center gap-1.5">
          <PinIcon /> {business.city}
        </span>
      </div>
      <Button href={`/business/${business.slug}`} variant="ghost" size="sm" className="mt-1">
        View details
      </Button>
    </article>
  );
}
