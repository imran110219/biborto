import Link from "next/link";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { CategoryTag, VisibilityBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EditIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import { getAdminEvents } from "@/lib/db/queries/events";
import { deleteEvent } from "./actions";

export default async function AdminEventsPage() {
  const events = await getAdminEvents();

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-serif text-4xl font-medium">Events</h1>
          <p className="text-text-secondary">Manage reunions, chapter meetups and online talks.</p>
        </div>
        <Button href="/admin/events/new" size="sm">
          <PlusIcon /> Add event
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-default bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <thead className="bg-[#FAF8F3]">
              <tr>
                {["Event", "Date", "Location", "Category", "Featured", "Visibility"].map((h) => (
                  <th key={h} className="px-4 py-3.5 pl-5 text-left text-xs font-bold uppercase tracking-[0.04em] text-text-secondary">
                    {h}
                  </th>
                ))}
                <th className="w-[104px] px-4 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-t border-[#EFEAE0]">
                  <td className="px-4 py-3.5 pl-5">
                    <div className="flex flex-col">
                      <span className="text-[15px] font-semibold">{e.title}</span>
                      <span className="text-[13px] text-text-secondary">{e.timeLabel}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-text-secondary">{e.dateLabel}</td>
                  <td className="px-4 py-3.5 text-sm text-text-secondary">{e.location}</td>
                  <td className="px-4 py-3.5"><CategoryTag>{e.category}</CategoryTag></td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        e.featured ? "bg-brand-green-tint text-brand-green" : "bg-status-neutral-bg text-status-neutral-text"
                      }`}
                    >
                      {e.featured ? "Featured" : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5"><VisibilityBadge isPublic={e.isPublic} /></td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1.5">
                      <Link
                        href={`/admin/events/${e.id}/edit`}
                        aria-label={`Edit ${e.title}`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-default bg-white"
                      >
                        <EditIcon />
                      </Link>
                      <form action={deleteEvent.bind(null, e.id)}>
                        <button
                          aria-label={`Remove ${e.title}`}
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
