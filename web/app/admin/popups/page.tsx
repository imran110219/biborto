import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/Button";
import { EditIcon, PlusIcon } from "@/components/ui/icons";
import { getAdminPopups } from "@/lib/db/queries/popups";
import { setPopupActive } from "./actions";
import { DeletePopupButton } from "./DeletePopupButton";
import { PopupPreviewButton } from "./PopupPreviewButton";

export default async function AdminPopupsPage() {
  const session = await auth();
  if (session?.user?.platformRole !== "superadmin") redirect("/admin/dashboard");

  const popups = await getAdminPopups();
  const active = popups.find((p) => p.active);

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-serif text-4xl font-medium">Popups</h1>
          <p className="max-w-2xl text-text-secondary">
            The popup shown to visitors every time they open the home page. Create your own with custom HTML or an
            image/animated GIF — only one can be active at a time. With none active, no popup is shown.
          </p>
        </div>
        <Button size="sm" href="/admin/popups/new">
          <PlusIcon /> New popup
        </Button>
      </div>

      <div
        role="status"
        className={`rounded-xl px-4 py-3 text-sm ${active ? "bg-brand-green-tint text-brand-green" : "bg-[#F8F3E6] text-text-primary"}`}
      >
        {active ? (
          <>
            Visitors currently see <strong>{active.title}</strong>.
          </>
        ) : (
          "No popup is active, so visitors see no popup."
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-default bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead className="bg-[#FAF8F3]">
              <tr>
                {["Title", "Type", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-[0.04em] text-text-secondary">
                    {h}
                  </th>
                ))}
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {popups.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-14 text-center text-sm text-text-secondary">
                    No custom popups yet.{" "}
                    <Link href="/admin/popups/new" className="font-semibold text-brand-green">
                      Create one
                    </Link>
                  </td>
                </tr>
              )}
              {popups.map((p) => {
                const needsImage = p.kind === "image" && !p.imageUrl;
                return (
                  <tr key={p.id} className="border-t border-[#EFEAE0]">
                    <td className="px-4 py-3.5 text-[15px] font-semibold">{p.title}</td>
                    <td className="px-4 py-3.5 text-sm">{p.kind === "html" ? "Custom HTML" : "Image / GIF"}</td>
                    <td className="px-4 py-3.5 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          p.active ? "bg-brand-green-tint text-brand-green" : "bg-status-neutral-bg text-status-neutral-text"
                        }`}
                      >
                        {p.active ? "Active" : needsImage ? "Needs image" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex justify-end gap-1.5">
                        <PopupPreviewButton popup={p} />
                        <Link
                          href={`/admin/popups/${p.id}/edit`}
                          aria-label={`Edit ${p.title}`}
                          title="Edit popup"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-default bg-white"
                        >
                          <EditIcon />
                        </Link>
                        {(p.active || !needsImage) && (
                          <form action={setPopupActive.bind(null, p.id, !p.active)}>
                            <button
                              className={`h-9 rounded-lg px-3 text-xs font-semibold ${
                                p.active ? "border border-border-input bg-white" : "bg-brand-green text-white"
                              }`}
                            >
                              {p.active ? "Deactivate" : "Activate"}
                            </button>
                          </form>
                        )}
                        <DeletePopupButton id={p.id} title={p.title} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
