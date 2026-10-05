import Link from "next/link";
import { auth } from "@/auth";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DownloadIcon, EditIcon, EyeIcon, PlusIcon } from "@/components/ui/icons";
import { BUSINESSES_PAGE_SIZE, getAdminBusinessesPage } from "@/lib/db/queries/businesses";
import { businessFiltersToQuery, parseBusinessFilters } from "@/lib/businesses/filters";
import { BusinessFilters } from "./BusinessFilters";
import { approveBusiness, bulkApproveBusinesses, bulkRejectBusinesses, rejectBusiness } from "./actions";

const BULK_FORM_ID = "businesses-bulk-form";

export default async function AdminBusinessesPage({ searchParams }: PageProps<"/admin/businesses">) {
  const filters = parseBusinessFilters(await searchParams);
  const [{ items: businesses, total, page, pageCount }, session] = await Promise.all([
    getAdminBusinessesPage(filters),
    auth(),
  ]);
  const canEdit = session?.user?.platformRole === "superadmin";
  const rangeStart = total === 0 ? 0 : (page - 1) * BUSINESSES_PAGE_SIZE + 1;
  const rangeEnd = (page - 1) * BUSINESSES_PAGE_SIZE + businesses.length;
  const baseQuery = businessFiltersToQuery(filters);
  const exportQuery = baseQuery.toString();
  const pageHref = (n: number) => {
    const next = new URLSearchParams(baseQuery);
    if (n > 1) next.set("page", String(n));
    const qs = next.toString();
    return qs ? `/admin/businesses?${qs}` : "/admin/businesses";
  };

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-serif text-4xl font-medium">Businesses</h1>
          <p className="text-text-secondary">{canEdit ? "Review new listings and keep the business directory accurate." : "Browse the business directory. Only a superadmin can edit or moderate listings."}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2.5">
            <a
              href={`/api/admin/businesses/export${exportQuery ? `?${exportQuery}` : ""}`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border-default bg-white px-5 text-sm font-semibold text-text-primary transition-colors hover:bg-black/5"
            >
              <DownloadIcon /> Export CSV
            </a>
            <Button size="sm" href="/admin/businesses/new">
              <PlusIcon /> Add listing
            </Button>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-default bg-white">
        <BusinessFilters total={total} />

        {canEdit && (
          <form id={BULK_FORM_ID} className="flex flex-wrap items-center gap-2.5 border-b border-[#EFEAE0] bg-[#FAF8F3] px-4 py-2.5 text-sm">
            <span className="mr-1 font-semibold text-text-secondary">Selected:</span>
            <button
              type="submit"
              formAction={bulkApproveBusinesses}
              className="h-9 rounded-lg bg-brand-green px-3.5 font-semibold text-white"
            >
              Approve
            </button>
            <button
              type="submit"
              formAction={bulkRejectBusinesses}
              className="h-9 rounded-lg border border-border-input bg-white px-3.5 font-semibold"
            >
              Reject
            </button>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <thead className="bg-[#FAF8F3]">
              <tr>
                {canEdit && <th className="w-12 py-3.5 pl-5" />}
                {["Business", "Category", "City", "Status", "Submitted"].map((h) => (
                  <th key={h} className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-[0.04em] text-text-secondary">
                    {h}
                  </th>
                ))}
                <th className="w-[176px] px-4 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {businesses.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center text-sm text-text-secondary">
                    No listings match these filters.{" "}
                    <Link href="/admin/businesses" className="font-semibold text-brand-green">
                      Clear filters
                    </Link>
                  </td>
                </tr>
              )}
              {businesses.map((b) => (
                <tr key={b.slug} className="border-t border-[#EFEAE0]">
                  {canEdit && (
                    <td className="py-3.5 pl-5">
                      <input type="checkbox" name="businessSlugs" value={b.slug} form={BULK_FORM_ID} />
                    </td>
                  )}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar initials={b.initials} size="sm" />
                      <div className="flex flex-col">
                        <span className="text-[15px] font-semibold">{b.name}</span>
                        <span className="text-[13px] text-text-secondary">Owner: {b.ownerName}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm">{b.category}</td>
                  <td className="px-4 py-3.5 text-sm">{b.city}</td>
                  <td className="px-4 py-3.5"><StatusBadge status={b.status} /></td>
                  <td className="px-4 py-3.5 text-sm text-text-secondary">{b.submittedAt}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex justify-end gap-1.5">
                      <Link
                        href={`/admin/businesses/${b.slug}`}
                        aria-label={`View ${b.name}`}
                        title="View listing"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-default bg-white"
                      >
                        <EyeIcon size={15} />
                      </Link>
                      {canEdit && (
                        <Link
                          href={`/admin/businesses/${b.slug}/edit`}
                          aria-label={`Edit ${b.name}`}
                          title="Edit listing"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-default bg-white"
                        >
                          <EditIcon />
                        </Link>
                      )}
                      {canEdit && b.status !== "active" && (
                        <form action={approveBusiness.bind(null, b.slug)}>
                          <button className="h-9 rounded-lg bg-brand-green px-3 text-xs font-semibold text-white">
                            Approve
                          </button>
                        </form>
                      )}
                      {canEdit && b.status !== "rejected" && (
                        <form action={rejectBusiness.bind(null, b.slug)}>
                          <button className="h-9 rounded-lg border border-border-input bg-white px-3 text-xs font-semibold text-[#9C3D10]">
                            Reject
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
