import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { BriefcaseIcon, PinIcon } from "@/components/ui/icons";
import type { Member } from "@/lib/types";

export function MemberCard({ member }: { member: Member }) {
  return (
    <article className="flex flex-col items-center gap-3.5 rounded-[18px] border border-border-default bg-white px-6 py-7 text-center">
      <Avatar initials={member.initials} size="lg" />
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold">{member.name}</h3>
        <span className="text-sm text-text-secondary">{member.discipline}</span>
      </div>
      <div className="flex flex-col gap-1.5 text-sm">
        <span className="flex items-center justify-center gap-1.5">
          <BriefcaseIcon /> {member.profession}
        </span>
        <span className="flex items-center justify-center gap-1.5">
          <PinIcon /> {member.city}
        </span>
      </div>
      <Button href="#" variant="ghost" size="sm" className="mt-1">
        View profile
      </Button>
    </article>
  );
}
