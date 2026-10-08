// A gentle prompt on the member's own profile: what would make it more useful to batchmates.
// Disappears once everything on the list is filled in.
export function ProfileNudge({ missing }: { missing: string[] }) {
  if (missing.length === 0) return null;
  const total = 4;
  const done = total - missing.length;
  return (
    <section aria-label="Profile completeness" className="flex flex-col gap-3 rounded-2xl border border-border-default bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif text-lg font-medium">Finish your profile</h2>
        <span className="text-sm text-text-secondary">
          {done} of {total}
        </span>
      </div>
      <div className="h-2 rounded-full bg-[#EFEAE0]">
        <div className="h-2 rounded-full bg-brand-green" style={{ width: `${(done / total) * 100}%` }} />
      </div>
      <p className="text-sm text-text-secondary">Batchmates find each other through these. Add {missing.join(", ").replace(/, ([^,]*)$/, " and $1")}.</p>
    </section>
  );
}
