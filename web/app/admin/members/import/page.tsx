import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { ImportForm } from "./ImportForm";

export const metadata = { title: "Import members" };

export default async function ImportMembersPage() {
  const session = await auth();
  if (session?.user?.platformRole !== "superadmin") redirect("/admin/members");

  return (
    <AdminLayout>
      <div className="flex flex-col gap-1.5">
        <Link href="/admin/members" className="text-sm font-semibold text-brand-green">
          ← Members
        </Link>
        <h1 className="font-serif text-4xl font-medium">Import members</h1>
        <p className="max-w-[720px] text-text-secondary">
          Add or update batchmates from a CSV file. You&apos;ll see exactly what would change before anything is saved.
        </p>
      </div>
      <ImportForm />
    </AdminLayout>
  );
}
