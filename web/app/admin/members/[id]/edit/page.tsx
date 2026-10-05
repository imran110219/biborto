import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { getAdminMemberById } from "@/lib/db/queries/members";
import { getDisciplineOptions } from "@/lib/db/queries/disciplines";
import { getCountryOptions } from "@/lib/db/queries/countries";
import { AccessCard, EditMemberForm } from "./EditMemberForm";
import { MemberHeader } from "../MemberHeader";
import { MemberPhotoControls } from "./MemberPhotoControls";

export default async function EditMemberPage({ params, searchParams }: PageProps<"/admin/members/[id]/edit">) {
  const { id } = await params;
  const { from } = await searchParams;
  const [member, disciplines, countries, session] = await Promise.all([
    getAdminMemberById(id),
    getDisciplineOptions(),
    getCountryOptions(),
    auth(),
  ]);

  if (!member) notFound();
  if (session?.user?.platformRole !== "superadmin") redirect(`/admin/members/${id}`);

  const fromProfile = from === "profile";
  const returnTo = fromProfile ? "/admin/dashboard" : "/admin/members";
  const isSelf = session?.user?.memberId === member.id;
  const canEditRole = true; // only superadmins reach this page

  return (
    <AdminLayout>
      <div className="flex max-w-6xl flex-col gap-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-text-secondary">
          <Link href={returnTo} className="font-semibold text-brand-green">
            {fromProfile ? "Dashboard" : "Members"}
          </Link>
          <span aria-hidden>/</span>
          <span className="truncate">{isSelf ? "My profile" : member.name}</span>
        </nav>

        <MemberHeader member={member} />

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <EditMemberForm member={member} disciplines={disciplines} countries={countries} returnTo={returnTo} />
          <aside className="flex flex-col gap-5 lg:sticky lg:top-6">
            <AccessCard member={member} isSelf={isSelf} canEditRole={canEditRole} />
            <MemberPhotoControls memberId={member.id} avatarUrl={member.avatarUrl} coverPhotoUrl={member.coverPhotoUrl} />
          </aside>
        </div>
      </div>
    </AdminLayout>
  );
}
