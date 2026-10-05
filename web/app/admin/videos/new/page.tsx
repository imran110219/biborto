import { AdminLayout } from "@/components/layout/AdminLayout";
import { getAdminEvents } from "@/lib/db/queries/events";
import { getDisciplineOptions } from "@/lib/db/queries/disciplines";
import { VideoForm } from "../VideoForm";
import { createVideo } from "../actions";

export default async function NewVideoPage() {
  const [events, disciplines] = await Promise.all([getAdminEvents(), getDisciplineOptions()]);
  return (
    <AdminLayout>
      <div className="flex flex-col gap-1.5">
        <h1 className="font-serif text-4xl font-medium">Add video</h1>
        <p className="text-text-secondary">Linked from the Batch 11 YouTube channel, not uploaded here.</p>
      </div>

      <div className="max-w-lg rounded-2xl border border-border-default bg-white p-6">
        <VideoForm action={createVideo} submitLabel="Add video" events={events.map((e) => ({ id: e.id, title: e.title }))} disciplines={disciplines} />
      </div>
    </AdminLayout>
  );
}
