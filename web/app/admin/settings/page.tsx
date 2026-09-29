import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/Button";

export default function AdminSettingsPage() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-1.5">
        <h1 className="font-serif text-4xl font-medium">Settings</h1>
        <p className="text-text-secondary">Organization details and reunion defaults shown across the site.</p>
      </div>

      <div className="flex max-w-[640px] flex-col gap-6">
        <section className="flex flex-col gap-4 rounded-2xl border border-border-default bg-white p-6">
          <h2 className="font-semibold">Organization</h2>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Organization name
            <input defaultValue="Batch 11, Khulna University" className="h-11 rounded-lg border border-border-input px-3 font-normal" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Committee contact email
            <input defaultValue="committee@example.com" className="h-11 rounded-lg border border-border-input px-3 font-normal" />
          </label>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-border-default bg-white p-6">
          <h2 className="font-semibold">Grand Reunion defaults</h2>
          <p className="text-sm text-text-secondary">
            Fills the [AMOUNT] / [DEADLINE] placeholders on the reunion blog post and event page.
          </p>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Registration fee
            <input placeholder="e.g. ৳500 per person" className="h-11 rounded-lg border border-border-input px-3 font-normal" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Registration deadline
            <input type="date" className="h-11 rounded-lg border border-border-input px-3 font-normal" />
          </label>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-border-default bg-white p-6">
          <h2 className="font-semibold">Notifications</h2>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" defaultChecked className="accent-brand-green" />
            Email me about new membership requests
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" defaultChecked className="accent-brand-green" />
            Email me about new business submissions
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="accent-brand-green" />
            Email me about new blog post drafts
          </label>
        </section>

        <Button size="sm" className="self-start">
          Save changes
        </Button>
      </div>
    </AdminLayout>
  );
}
