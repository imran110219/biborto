import Link from "next/link";
import { auth } from "@/auth";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Avatar } from "@/components/ui/Avatar";
import { TierBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EditIcon, PlusIcon } from "@/components/ui/icons";
import { getAdminSponsors } from "@/lib/db/queries/sponsors";
import { parseSponsorFilters } from "@/lib/sponsors/filters";
import { externalUrl } from "@/lib/url";
import { DeleteSponsorButton } from "./DeleteSponsorButton";
import { SponsorActiveToggle } from "./SponsorActiveToggle";
import { SponsorFilters } from "./SponsorFilters";

export default async function AdminSponsorsPage({ searchParams }: PageProps<"/admin/sponsors">) {
  const filters = parseSponsorFilters(await searchParams);
  const [sponsors, session] = await Promise.all([getAdminSponsors(filters), auth()]);
  const canEdit = session?.user?.platformRole === "superadmin";

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-serif text-4xl font-medium">Sponsors</h1>
          <p className="text-text-secondary">
            {canEdit
              ? "Manage the partners shown on the public site and on event pages. Only one diamond sponsor can be active."
              : "Browse the sponsors. Only a superadmin can add, edit or remove them."}
          </p>
        </div>
        {canEdit && (
          <Button href="/admin/sponsors/new" size="sm">
            <PlusIcon /> Add sponsor
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-default bg-white">
        <SponsorFilters total={sponsors.length} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead className="bg-[#FAF8F3]">
              <tr>
                {["Sponsor", "Tier", "Linked business", "Website", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3.5 pl-5 text-left text-xs font-bold uppercase tracking-[0.04em] text-text-secondary">
                    {h}
                  </th>
                ))}
                {canEdit && <th className="w-[104px] px-4 py-3.5" />}
              </tr>
            </thead>
            <tbody>
              {sponsors.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center text-sm text-text-secondary">
                    No sponsors match these filters.{" "}
                    <Link href="/admin/sponsors" className="font-semibold text-brand-green">
                      Clear filters
                    </Link>
                  </td>
                </tr>
              )}
              {sponsors.map((s) => (
                <tr key={s.id} className="border-t border-[#EFEAE0]">
                  <td className="px-4 py-3.5 pl-5">
                    <div className="flex items-center gap-3">
                      {s.logoUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element -- remote R2 URL */
                        <img src={s.logoUrl} alt="" className="h-10 w-10 shrink-0 rounded-full border border-border-default bg-white object-contain p-1" />
                      ) : (
                        <Avatar initials={s.initials} size="sm" variant={s.tier === "diamond" ? "diamond" : "green"} />
                      )}
                      <span className="text-[15px] font-semibold">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><TierBadge tier={s.tier} /></td>
                  <td className="px-4 py-3.5 text-sm">{s.businessName ?? <span className="text-text-secondary">—</span>}</td>
                  <td className="px-4 py-3.5 text-sm">
                    {s.website ? (
                      <a href={externalUrl(s.website)} target="_blank" rel="noopener noreferrer" className="text-text-secondary underline">
                        {s.website.replace(/^https?:\/\//i, "").replace(/\/$/, "")}
                      </a>
                    ) : (
                      <span className="text-text-secondary">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {canEdit ? (
                      <SponsorActiveToggle id={s.id} name={s.name} active={s.active} />
                    ) : (
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${s.active ? "bg-brand-green-tint text-brand-green" : "bg-status-neutral-bg text-status-neutral-text"}`}>
                        {s.active ? "Active" : "Inactive"}
                      </span>
                    )}
                  </td>
                  {canEdit && (
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1.5">
                        <Link
                          href={`/admin/sponsors/${s.id}/edit`}
                          aria-label={`Edit ${s.name}`}
                          title="Edit sponsor"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-default bg-white"
                        >
                          <EditIcon />
                        </Link>
                        <DeleteSponsorButton id={s.id} name={s.name} />
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
