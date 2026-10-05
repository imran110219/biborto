import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { getBusinessOwnerOptions } from "@/lib/db/queries/businesses";
import type { AdminBusinessDetail } from "@/lib/types";
import { EditBusinessForm } from "../[slug]/edit/EditBusinessForm";

const BLANK_BUSINESS: AdminBusinessDetail = {
  slug: "",
  name: "",
  category: "",
  city: "",
  status: "active",
  tagline: "",
  description: "",
  offerings: [],
  testimonial: "",
  phone: "",
  email: "",
  website: "",
  linkedinUrl: "",
  facebookUrl: "",
  ownerMemberId: null,
  ownerName: "",
  submittedAt: "",
};

export default async function NewBusinessPage() {
  const session = await auth();
  if (session?.user?.platformRole !== "superadmin") redirect("/admin/businesses");

  const owners = await getBusinessOwnerOptions();

  return (
    <AdminLayout>
      <div className="flex max-w-3xl flex-col gap-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-text-secondary">
          <Link href="/admin/businesses" className="font-semibold text-brand-green">
            Businesses
          </Link>
          <span aria-hidden>/</span>
          <span>Add listing</span>
        </nav>
        <div className="flex flex-col gap-1.5">
          <h1 className="font-serif text-4xl font-medium">Add listing</h1>
          <p className="text-text-secondary">
            Committee-entered listings start as Active. Member self-submissions arrive as Pending.
          </p>
        </div>
        <EditBusinessForm mode="create" business={BLANK_BUSINESS} owners={owners} />
      </div>
    </AdminLayout>
  );
}
