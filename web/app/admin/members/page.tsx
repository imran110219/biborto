import Link from "next/link";
import { auth } from "@/auth";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DownloadIcon, EditIcon, EyeIcon, PlusIcon, SearchIcon } from "@/components/ui/icons";
import { getAdminMembers } from "@/lib/db/queries/members";
import { approveMember, bulkActivateMembers, bulkSuspendMembers, reactivateMember, suspendMember } from "./actions";

const BULK_FORM_ID = "members-bulk-form";

export default async function AdminMembersPage() {
  const [members, session] = await Promise.all([getAdminMembers(), auth()]);
  const canEdit = session?.user?.platformRole === "superadmin";

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-serif text-4xl font-medium">Members</h1>
          <p className="text-text-secondary">{canEdit ? "Approve new batchmates, assign roles and keep the directory accurate." : "Browse the member directory. Only a superadmin can edit or moderate members."}</p>
        </div>
        <div className="flex gap-2.5">
          <Button variant="ghost" size="sm">
            <DownloadIcon /> Export CSV
          </Button>
          <Button size="sm">
            <PlusIcon /> Add member
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-default bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-[#EFEAE0] p-4">
          <div className="relative flex w-full items-center sm:w-80">
            <span className="absolute left-3 text-text-secondary">
              <SearchIcon size={16} />
            </span>
            <input placeholder="Search by name or email" className="h-11 w-full rounded-[10px] border border-border-input pl-9 pr-3 text-sm" />
          </div>
          <select className="h-11 rounded-[10px] border border-border-input px-3 text-sm">
            <option>All statuses</option>
            <option>Active</option>
            <option>Pending</option>
            <option>Suspended</option>
          </select>
          <select className="h-11 rounded-[10px] border border-border-input px-3 text-sm">
            <option>All disciplines</option>
          </select>
          <select className="h-11 rounded-[10px] border border-border-input px-3 text-sm">
            <option>All roles</option>
            <option>Member</option>
            <option>Editor</option>
            <option>Admin</option>
          </select>
          <span className="ml-auto text-sm text-text-secondary">{members.length} members</span>
        </div>

        {canEdit && (
          <form id={BULK_FORM_ID} className="flex flex-wrap items-center gap-2.5 border-b border-[#EFEAE0] bg-[#FAF8F3] px-4 py-2.5 text-sm">
            <span className="mr-1 font-semibold text-text-secondary">Selected:</span>
            <button
              type="submit"
              formAction={bulkActivateMembers}
              className="h-9 rounded-lg bg-brand-green px-3.5 font-semibold text-white"
            >
              Activate
            </button>
            <button
              type="submit"
              formAction={bulkSuspendMembers}
              className="h-9 rounded-lg border border-border-input bg-white px-3.5 font-semibold"
            >
              Suspend
            </button>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <thead className="bg-[#FAF8F3]">
              <tr>
                {canEdit && <th className="w-12 py-3.5 pl-5" />}
                {["Member", "Discipline", "City", "Role", "Status", "Joined"].map((h) => (
                  <th key={h} className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-[0.04em] text-text-secondary">
                    {h}
                  </th>
                ))}
                <th className="w-[176px] px-4 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-t border-[#EFEAE0]">
                  {canEdit && (
                    <td className="py-3.5 pl-5">
                      <input type="checkbox" name="memberIds" value={m.id} form={BULK_FORM_ID} />
                    </td>
                  )}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar initials={m.initials} size="sm" />
                      <div className="flex flex-col">
                        <span className="text-[15px] font-semibold">{m.name}</span>
                        <span className="text-[13px] text-text-secondary">{m.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm">{m.discipline}</td>
                  <td className="px-4 py-3.5 text-sm">{m.city}</td>
                  <td className="px-4 py-3.5 text-sm capitalize">{m.platformRole}</td>
                  <td className="px-4 py-3.5"><StatusBadge status={m.status} /></td>
                  <td className="px-4 py-3.5 text-sm text-text-secondary">{m.joinedAt}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex justify-end gap-1.5">
                      <Link
                        href={`/admin/members/${m.id}`}
                        aria-label={`View ${m.name}`}
                        title="View profile"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-default bg-white"
                      >
                        <EyeIcon size={15} />
                      </Link>
                      {canEdit && (
                        <Link
                          href={`/admin/members/${m.id}/edit`}
                          aria-label={`Edit ${m.name}`}
                          title="Edit member"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-default bg-white"
                        >
                          <EditIcon />
                        </Link>
                      )}
                      {canEdit && m.status === "pending" && (
                        <>
                          <form action={approveMember.bind(null, m.id)}>
                            <button className="h-9 rounded-lg bg-brand-green px-3 text-xs font-semibold text-white">
                              Approve
                            </button>
                          </form>
                          <form action={suspendMember.bind(null, m.id)}>
                            <button className="h-9 rounded-lg border border-border-input bg-white px-3 text-xs font-semibold text-[#9C3D10]">
                              Reject
                            </button>
                          </form>
                        </>
                      )}
                      {canEdit && m.status === "active" && (
                        <form action={suspendMember.bind(null, m.id)}>
                          <button className="h-9 rounded-lg border border-border-input bg-white px-3 text-xs font-semibold text-[#9C3D10]">
                            Suspend
                          </button>
                        </form>
                      )}
                      {canEdit && m.status === "suspended" && (
                        <form action={reactivateMember.bind(null, m.id)}>
                          <button className="h-9 rounded-lg bg-brand-green px-3 text-xs font-semibold text-white">
                            Reactivate
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-[#EFEAE0] px-5 py-3.5 text-sm text-text-secondary">
          <span>Rows 1–{members.length} of {members.length}</span>
          <div className="flex gap-2">
            <button className="h-11 rounded-[10px] border border-border-input px-4 text-sm font-semibold">Previous</button>
            <button className="h-11 rounded-[10px] border border-border-input px-4 text-sm font-semibold">Next</button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
