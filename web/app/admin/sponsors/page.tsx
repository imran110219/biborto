import Link from "next/link";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Avatar } from "@/components/ui/Avatar";
import { TierBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EditIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import { getAdminSponsors } from "@/lib/db/queries/sponsors";
import { deleteSponsor, toggleSponsorActive } from "./actions";

export default async function AdminSponsorsPage() {
  const sponsors = await getAdminSponsors();

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-serif text-4xl font-medium">Sponsors</h1>
          <p className="text-text-secondary">Manage the partner logos shown on the public site and on event pages.</p>
        </div>
        <Button href="/admin/sponsors/new" size="sm">
          <PlusIcon /> Add sponsor
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-default bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead className="bg-[#FAF8F3]">
              <tr>
                {["Sponsor", "Tier", "Website", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3.5 pl-5 text-left text-xs font-bold uppercase tracking-[0.04em] text-text-secondary">
                    {h}
                  </th>
                ))}
                <th className="w-[104px] px-4 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {sponsors.map((s) => (
                <tr key={s.id} className="border-t border-[#EFEAE0]">
                  <td className="px-4 py-3.5 pl-5">
                    <div className="flex items-center gap-3">
                      <Avatar initials={s.initials} size="sm" variant={s.tier === "diamond" ? "diamond" : "green"} />
                      <span className="text-[15px] font-semibold">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><TierBadge tier={s.tier} /></td>
                  <td className="px-4 py-3.5 text-sm text-text-secondary">{s.website}</td>
                  <td className="px-4 py-3.5">
                    <form action={toggleSponsorActive.bind(null, s.id, s.active)}>
                      <button
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                          s.active ? "bg-brand-green-tint text-brand-green" : "bg-status-neutral-bg text-status-neutral-text"
                        }`}
                      >
                        {s.active ? "Active" : "Inactive"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1.5">
                      <Link
                        href={`/admin/sponsors/${s.id}/edit`}
                        aria-label={`Edit ${s.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-default bg-white"
                      >
                        <EditIcon />
                      </Link>
                      <form action={deleteSponsor.bind(null, s.id)}>
                        <button
                          aria-label={`Remove ${s.name}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-default bg-white text-[#9C3D10]"
                        >
                          <TrashIcon />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
