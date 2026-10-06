// The shared "Public" switch used on every content form that has an
// is_public flag (blog posts, events, gallery albums, videos), so the wording
// and behaviour are identical everywhere. Uncontrolled: the server action reads
// `formData.get("isPublic") === "on"`.
export function PublicField({ defaultChecked = true }: { defaultChecked?: boolean }) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-border-default p-3.5 text-sm has-[:checked]:border-brand-green has-[:checked]:bg-brand-green-tint/40">
      <input type="checkbox" name="isPublic" defaultChecked={defaultChecked} className="mt-0.5 h-4 w-4 accent-brand-green" />
      <span>
        <span className="block font-semibold">Public</span>
        <span className="text-xs text-text-secondary">
          Shown on the public site, including the landing page. Turn off to hide it from everyone but admins.
        </span>
      </span>
    </label>
  );
}
