import { toggleSponsorActive } from "@/app/admin/sponsors/actions";

// An explicit on/off switch (a form button with role="switch") rather than a
// badge that secretly doubles as a button.
export function SponsorActiveToggle({ id, name, active }: { id: string; name: string; active: boolean }) {
  return (
    <form action={toggleSponsorActive.bind(null, id, active)} className="flex items-center gap-2.5">
      <button
        role="switch"
        aria-checked={active}
        aria-label={`${active ? "Deactivate" : "Activate"} ${name}`}
        title={active ? "Click to deactivate" : "Click to activate"}
        className={`relative h-6 w-11 rounded-full transition-colors ${active ? "bg-brand-green" : "bg-border-input"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${active ? "left-[22px]" : "left-0.5"}`} />
      </button>
      <span className={`text-xs font-semibold ${active ? "text-brand-green" : "text-text-secondary"}`}>{active ? "Active" : "Inactive"}</span>
    </form>
  );
}
