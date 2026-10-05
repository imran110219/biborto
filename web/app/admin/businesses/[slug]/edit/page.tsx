import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { getAdminBusinessBySlug, getBusinessOwnerOptions } from "@/lib/db/queries/businesses";
import { EditBusinessForm } from "./EditBusinessForm";

export default async function EditBusinessPage({ params }: PageProps<"/admin/businesses/[slug]/edit">) {
  const { slug } = await params;
  const [business, owners, session] = await Promise.all([getAdminBusinessBySlug(slug), getBusinessOwnerOptions(), auth()]);

  if (!business) notFound();
  // Admins can view listings; only a superadmin may edit them.
  if (session?.user?.platformRole !== "superadmin") redirect(`/admin/businesses/${slug}`);

  return (
    <AdminLayout>
      <div className="flex max-w-3xl flex-col gap-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-text-secondary">
          <Link href="/admin/businesses" className="font-semibold text-brand-green">
            Businesses
          </Link>
          <span aria-hidden>/</span>
          <Link href={`/admin/businesses/${slug}`} className="font-semibold text-brand-green">
            {business.name}
          </Link>
          <span aria-hidden>/</span>
          <span>Edit</span>
        </nav>
        <h1 className="font-serif text-4xl font-medium">Edit listing</h1>
        <EditBusinessForm business={business} owners={owners} />
      </div>
    </AdminLayout>
  );
}
