import { StatusBadge } from "@/components/ui/Badge";
import { initialsOf } from "@/lib/db/format";
import type { AdminMemberDetail } from "@/lib/types";

const ROLE_LABELS = { member: "Member", admin: "Admin", superadmin: "Superadmin" };

export function MemberHeader({ member }: { member: AdminMemberDetail }) {
  return (
    <header className="overflow-hidden rounded-2xl border border-border-default bg-white">
      <div
        className="h-28 bg-brand-green-dark bg-cover bg-center sm:h-36"
        style={member.coverPhotoUrl ? { backgroundImage: `url("${member.coverPhotoUrl}")` } : undefined}
      />
      <div className="flex flex-wrap items-end gap-4 px-5 pb-5 sm:px-6">
        <div
          className="-mt-10 flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-white bg-accent-amber-tint bg-cover bg-center text-xl font-bold text-accent-amber-text sm:-mt-12 sm:h-24 sm:w-24"
          style={member.avatarUrl ? { backgroundImage: `url("${member.avatarUrl}")` } : undefined}
        >
          {!member.avatarUrl && initialsOf(member.name)}
        </div>
        <div className="min-w-0 flex-1 pt-3">
          <h1 className="truncate font-serif text-3xl font-medium">{member.name}</h1>
          <p className="truncate text-sm text-text-secondary">{member.email}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={member.status} />
          <span className="inline-flex items-center rounded-full bg-bg-admin px-2.5 py-1 text-xs font-semibold">
            {ROLE_LABELS[member.platformRole]}
          </span>
          <span className="inline-flex items-center rounded-full bg-bg-admin px-2.5 py-1 text-xs font-semibold">
            {member.isPublic ? "Public profile" : "Private profile"}
          </span>
        </div>
      </div>
    </header>
  );
}
