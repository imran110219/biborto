import Link from "next/link";
import { auth } from "@/auth";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DownloadIcon, EditIcon, EyeIcon, PlusIcon } from "@/components/ui/icons";
import { ADMIN_MEMBERS_PAGE_SIZE, getAdminMembersPage } from "@/lib/db/queries/members";
import { getDisciplineOptions } from "@/lib/db/queries/disciplines";
import { memberFiltersToQuery, parseMemberFilters } from "@/lib/members/filters";
import { MemberFilters } from "./MemberFilters";
import { approveMember, bulkActivateMembers, bulkSuspendMembers, reactivateMember, suspendMember } from "./actions";

const BULK_FORM_ID = "members-bulk-form";

export default async function AdminMembersPage({ searchParams }: PageProps<"/admin/members">) {
  const sp = await searchParams;
  const filters = parseMemberFilters(sp);
  const { q, status, role, disciplineId } = filters;

  const [{ items: members, total, page, pageCount }, disciplines, session] = await Promise.all([
    getAdminMembersPage(filters),
    getDisciplineOptions(),
    auth(),
  ]);
  const rangeStart = total === 0 ? 0 : (page - 1) * ADMIN_MEMBERS_PAGE_SIZE + 1;
  const rangeEnd = (page - 1) * ADMIN_MEMBERS_PAGE_SIZE + members.length;
  const baseQuery = memberFiltersToQuery(filters);
  const pageHref = (n: number) => {
    const next = new URLSearchParams(baseQuery);
    if (n > 1) next.set("page", String(n));
    const qs = next.toString();
    return qs ? `/admin/members?${qs}` : "/admin/members";
  };
  const exportQuery = baseQuery.toString();

  const canEdit = session?.user?.platformRole === "superadmin";

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-serif text-4xl font-medium">Members</h1>
          <p className="text-text-secondary">{canEdit ? "Approve new batchmates, assign roles and keep the directory accurate." : "Browse the member directory. Only a superadmin can edit or moderate members."}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2.5">
            <a
              href={`/api/admin/members/export${exportQuery ? `?${exportQuery}` : ""}`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border-default bg-white px-5 text-sm font-semibold text-text-primary transition-colors hover:bg-black/5"
            >
              <DownloadIcon /> Export CSV
            </a>
            <Link
              href="/admin/members/import"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border-default bg-white px-5 text-sm font-semibold text-text-primary transition-colors hover:bg-black/5"
            >
              Import CSV
            </Link>
            <Button size="sm" href="/admin/members/new">
              <PlusIcon /> Add member
            </Button>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-default bg-white">
        <MemberFilters disciplines={disciplines} total={total} />

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
              {members.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center text-sm text-text-secondary">
                    No members match these filters.{" "}
                    <Link href="/admin/members" className="font-semibold text-brand-green">
                      Clear filters
                    </Link>
                  </td>
                </tr>
              )}
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
                        <span className="text-[15px] font-semibold">
                          {m.name}
                          {m.onboarded === false && (
                            <span title="Added by the committee; hasn't signed in and confirmed their details yet" className="ml-2 rounded-full bg-accent-amber-tint px-2 py-0.5 align-middle text-[11px] font-semibold text-accent-amber-text">
                              Not signed in yet
                            </span>
                          )}
                        </span>
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
          <span>
            Rows {rangeStart}–{rangeEnd} of {total}
          </span>
          <div className="flex items-center gap-2">
            <span className="mr-1">
              Page {page} of {pageCount}
            </span>
            {page > 1 ? (
              <Link href={pageHref(page - 1)} className="flex h-11 items-center rounded-[10px] border border-border-input px-4 text-sm font-semibold text-text-primary">
                Previous
              </Link>
            ) : (
              <span aria-disabled className="flex h-11 items-center rounded-[10px] border border-border-input px-4 text-sm font-semibold opacity-40">Previous</span>
            )}
            {page < pageCount ? (
              <Link href={pageHref(page + 1)} className="flex h-11 items-center rounded-[10px] border border-border-input px-4 text-sm font-semibold text-text-primary">
                Next
              </Link>
            ) : (
              <span aria-disabled className="flex h-11 items-center rounded-[10px] border border-border-input px-4 text-sm font-semibold opacity-40">Next</span>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
