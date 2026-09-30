import { AdminLayout } from "@/components/layout/AdminLayout";
import { SponsorForm } from "../SponsorForm";
import { createSponsor } from "../actions";

export default function NewSponsorPage() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-1.5">
        <h1 className="font-serif text-4xl font-medium">Add sponsor</h1>
        <p className="text-text-secondary">Shown on the public site and on event pages.</p>
      </div>

      <div className="max-w-lg rounded-2xl border border-border-default bg-white p-6">
        <SponsorForm action={createSponsor} submitLabel="Add sponsor" />
      </div>
    </AdminLayout>
  );
}
