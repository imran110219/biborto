import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { getDiamondSponsor, getSponsorBusinessOptions } from "@/lib/db/queries/sponsors";
import { SponsorForm } from "../SponsorForm";
import { createSponsor } from "../actions";

export default async function NewSponsorPage() {
  const session = await auth();
  if (session?.user?.platformRole !== "superadmin") redirect("/admin/sponsors");

  const [businesses, diamond] = await Promise.all([getSponsorBusinessOptions(), getDiamondSponsor()]);

  return (
    <AdminLayout>
      <div className="flex max-w-3xl flex-col gap-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-text-secondary">
          <Link href="/admin/sponsors" className="font-semibold text-brand-green">
            Sponsors
          </Link>
          <span aria-hidden>/</span>
          <span>Add sponsor</span>
        </nav>
        <div className="flex flex-col gap-1.5">
          <h1 className="font-serif text-4xl font-medium">Add sponsor</h1>
          <p className="text-text-secondary">Shown on the public site and on event pages. You can add a logo on the next step.</p>
        </div>
        <SponsorForm
          action={createSponsor}
          submitLabel="Add sponsor"
          businesses={businesses}
          activeDiamond={diamond && { id: diamond.id, name: diamond.name }}
        />
      </div>
    </AdminLayout>
  );
}
