import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { getAdminMemberById } from "@/lib/db/queries/members";
import { getDisciplineOptions } from "@/lib/db/queries/disciplines";
import { EditMemberForm } from "./EditMemberForm";

export default async function EditMemberPage({ params }: PageProps<"/admin/members/[id]/edit">) {
  const { id } = await params;
  const [member, disciplines] = await Promise.all([getAdminMemberById(id), getDisciplineOptions()]);

  if (!member) notFound();

  return (
    <AdminLayout>
      <div className="flex flex-col gap-1.5">
        <h1 className="font-serif text-4xl font-medium">Edit member</h1>
        <p className="text-text-secondary">{member.email}</p>
      </div>

      <div className="max-w-2xl rounded-2xl border border-border-default bg-white p-6">
        <EditMemberForm member={member} disciplines={disciplines} />
      </div>
    </AdminLayout>
  );
}
