import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { getAdminSponsorById } from "@/lib/db/queries/sponsors";
import { SponsorForm } from "../../SponsorForm";
import { updateSponsor } from "../../actions";

export default async function EditSponsorPage({ params }: PageProps<"/admin/sponsors/[id]/edit">) {
  const { id } = await params;
  const sponsor = await getAdminSponsorById(id);
  if (!sponsor) notFound();

  return (
    <AdminLayout>
      <div className="flex flex-col gap-1.5">
        <h1 className="font-serif text-4xl font-medium">Edit sponsor</h1>
        <p className="text-text-secondary">{sponsor.name}</p>
      </div>

      <div className="max-w-lg rounded-2xl border border-border-default bg-white p-6">
        <SponsorForm sponsor={sponsor} action={updateSponsor.bind(null, id)} submitLabel="Save changes" />
      </div>
    </AdminLayout>
  );
}
