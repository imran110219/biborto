import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { getAdminSponsorById, getDiamondSponsor, getSponsorBusinessOptions } from "@/lib/db/queries/sponsors";
import { SponsorForm } from "../../SponsorForm";
import { SponsorLogoUpload } from "../../SponsorLogoUpload";
import { updateSponsor } from "../../actions";

export default async function EditSponsorPage({ params }: PageProps<"/admin/sponsors/[id]/edit">) {
  const session = await auth();
  // Admins can browse sponsors; only a superadmin may edit them.
  if (session?.user?.platformRole !== "superadmin") redirect("/admin/sponsors");

  const { id } = await params;
  const [sponsor, businesses, diamond] = await Promise.all([getAdminSponsorById(id), getSponsorBusinessOptions(), getDiamondSponsor()]);
  if (!sponsor) notFound();

  return (
    <AdminLayout>
      <div className="flex max-w-3xl flex-col gap-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-text-secondary">
          <Link href="/admin/sponsors" className="font-semibold text-brand-green">
            Sponsors
          </Link>
          <span aria-hidden>/</span>
          <span className="truncate">{sponsor.name}</span>
        </nav>
        <h1 className="font-serif text-4xl font-medium">Edit sponsor</h1>
        <SponsorLogoUpload sponsorId={sponsor.id} logoUrl={sponsor.logoUrl} />
        <SponsorForm
          sponsor={sponsor}
          action={updateSponsor.bind(null, id)}
          submitLabel="Save changes"
          businesses={businesses}
          activeDiamond={diamond && { id: diamond.id, name: diamond.name }}
        />
      </div>
    </AdminLayout>
  );
}
