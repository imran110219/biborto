import { AdminLayout } from "@/components/layout/AdminLayout";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DownloadIcon, EditIcon, PlusIcon, SearchIcon, TrashIcon } from "@/components/ui/icons";
import { getAdminMembers } from "@/lib/db/queries/members";

export default async function AdminMembersPage() {
  const members = await getAdminMembers();

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-serif text-4xl font-medium">Members</h1>
          <p className="text-text-secondary">Approve new batchmates, assign roles and keep the directory accurate.</p>
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

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <thead className="bg-[#FAF8F3]">
              <tr>
                <th className="w-12 py-3.5 pl-5"><input type="checkbox" /></th>
                {["Member", "Discipline", "City", "Role", "Status", "Joined"].map((h) => (
                  <th key={h} className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-[0.04em] text-text-secondary">
                    {h}
                  </th>
                ))}
                <th className="w-[104px] px-4 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-t border-[#EFEAE0]">
                  <td className="py-3.5 pl-5"><input type="checkbox" /></td>
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
                    <div className="flex gap-1.5">
                      <button aria-label={`Edit ${m.name}`} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-default bg-white">
                        <EditIcon />
                      </button>
                      <button aria-label={`Remove ${m.name}`} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-default bg-white text-[#9C3D10]">
                        <TrashIcon />
                      </button>
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
