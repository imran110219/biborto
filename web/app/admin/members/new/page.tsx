import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { getDisciplineOptions } from "@/lib/db/queries/disciplines";
import { AddMemberForm } from "./AddMemberForm";

export default async function NewMemberPage({ searchParams }: PageProps<"/admin/members/new">) {
  const session = await auth();
  if (session?.user?.platformRole !== "superadmin") redirect("/admin/members");

  const [disciplines, { added, roll }] = await Promise.all([getDisciplineOptions(), searchParams]);

  return (
    <AdminLayout>
      <div className="flex max-w-3xl flex-col gap-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-text-secondary">
          <Link href="/admin/members" className="font-semibold text-brand-green">
            Members
          </Link>
          <span aria-hidden>/</span>
          <span>Add member</span>
        </nav>

        <div className="flex flex-col gap-1.5">
          <h1 className="font-serif text-4xl font-medium">Add member</h1>
          <p className="max-w-2xl text-text-secondary">
            Enter the member&apos;s email and roll. That&apos;s all you need: they sign in with that email (Google, or the
            verification link at the sign-up page), confirm their name, and fill in the rest of their profile themselves.
            Adding many people? <Link href="/admin/members/import" className="font-semibold text-brand-green">Import a CSV</Link>.
          </p>
        </div>

        {typeof added === "string" && (
          <p role="status" className="rounded-xl bg-brand-green-tint px-4 py-3 text-sm font-medium text-brand-green">
            Added {added}
            {typeof roll === "string" ? ` (roll ${roll})` : ""}. They can sign in now with that email. Add another below.
          </p>
        )}

        <AddMemberForm key={`${added}|${roll}`} disciplines={disciplines} />
      </div>
    </AdminLayout>
  );
}
