import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { getAdminBusinessBySlug } from "@/lib/db/queries/businesses";
import { EditBusinessForm } from "./EditBusinessForm";

export default async function EditBusinessPage({ params }: PageProps<"/admin/businesses/[slug]/edit">) {
  const { slug } = await params;
  const business = await getAdminBusinessBySlug(slug);

  if (!business) notFound();

  return (
    <AdminLayout>
      <div className="flex flex-col gap-1.5">
        <h1 className="font-serif text-4xl font-medium">Edit listing</h1>
        <p className="text-text-secondary">{business.name}</p>
      </div>

      <div className="max-w-2xl rounded-2xl border border-border-default bg-white p-6">
        <EditBusinessForm business={business} />
      </div>
    </AdminLayout>
  );
}
