import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PopupForm } from "../PopupForm";

export default async function NewPopupPage() {
  const session = await auth();
  if (session?.user?.platformRole !== "superadmin") redirect("/admin/dashboard");

  return (
    <AdminLayout>
      <div className="flex max-w-3xl flex-col gap-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-text-secondary">
          <Link href="/admin/popups" className="font-semibold text-brand-green">
            Popups
          </Link>
          <span aria-hidden>/</span>
          <span>New popup</span>
        </nav>
        <h1 className="font-serif text-4xl font-medium">New popup</h1>
        <PopupForm mode="create" />
      </div>
    </AdminLayout>
  );
}
