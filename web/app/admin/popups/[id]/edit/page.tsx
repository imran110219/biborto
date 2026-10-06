import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { getAdminPopupById } from "@/lib/db/queries/popups";
import { PopupForm } from "../../PopupForm";
import { PopupImageUpload } from "../../PopupImageUpload";
import { PopupPreviewButton } from "../../PopupPreviewButton";

export default async function EditPopupPage({ params }: PageProps<"/admin/popups/[id]/edit">) {
  const session = await auth();
  if (session?.user?.platformRole !== "superadmin") redirect("/admin/dashboard");

  const { id } = await params;
  const popup = await getAdminPopupById(id);
  if (!popup) notFound();

  return (
    <AdminLayout>
      <div className="flex max-w-3xl flex-col gap-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-text-secondary">
          <Link href="/admin/popups" className="font-semibold text-brand-green">
            Popups
          </Link>
          <span aria-hidden>/</span>
          <span className="truncate">{popup.title}</span>
        </nav>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-serif text-4xl font-medium">Edit popup</h1>
          <PopupPreviewButton popup={popup} label="Preview saved version" />
        </div>
        <PopupForm mode="edit" popup={popup} />
        {/* Shown for image popups; HTML popups ignore the stored image. */}
        {popup.kind === "image" && <PopupImageUpload popupId={popup.id} imageUrl={popup.imageUrl} />}
      </div>
    </AdminLayout>
  );
}
