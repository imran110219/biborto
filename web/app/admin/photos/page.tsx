import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/Button";
import { EditIcon, PlusIcon, TrashIcon, UploadIcon } from "@/components/ui/icons";
import { albums } from "@/lib/mock-data";

export default function AdminPhotosPage() {
  return (
    <AdminLayout>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-serif text-4xl font-medium">Photos</h1>
          <p className="text-text-secondary">Manage the gallery&apos;s photo albums.</p>
        </div>
        <div className="flex gap-2.5">
          <Button variant="ghost" size="sm">
            <PlusIcon /> Add album
          </Button>
          <Button size="sm">
            <UploadIcon /> Upload photos
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-default bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse">
            <thead className="bg-[#FAF8F3]">
              <tr>
                {["Album", "Photos"].map((h) => (
                  <th key={h} className="px-4 py-3.5 pl-5 text-left text-xs font-bold uppercase tracking-[0.04em] text-text-secondary">
                    {h}
                  </th>
                ))}
                <th className="w-[104px] px-4 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {albums.map((a) => (
                <tr key={a.name} className="border-t border-[#EFEAE0]">
                  <td className="px-4 py-3.5 pl-5 text-[15px] font-semibold">{a.name}</td>
                  <td className="px-4 py-3.5 text-sm text-text-secondary">{a.count}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1.5">
                      <button aria-label={`Edit ${a.name}`} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-default bg-white">
                        <EditIcon />
                      </button>
                      <button aria-label={`Remove ${a.name}`} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-default bg-white text-[#9C3D10]">
                        <TrashIcon />
                      </button>
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
