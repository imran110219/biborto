import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { getVideoById } from "@/lib/db/queries/videos";
import { getAdminEvents } from "@/lib/db/queries/events";
import { getDisciplineOptions } from "@/lib/db/queries/disciplines";
import { VideoForm } from "../../VideoForm";
import { updateVideo } from "../../actions";

export default async function EditVideoPage({ params }: PageProps<"/admin/videos/[id]/edit">) {
  const { id } = await params;
  const video = await getVideoById(id);
  if (!video) notFound();
  const [events, disciplines] = await Promise.all([getAdminEvents(), getDisciplineOptions()]);

  return (
    <AdminLayout>
      <div className="flex flex-col gap-1.5">
        <h1 className="font-serif text-4xl font-medium">Edit video</h1>
        <p className="text-text-secondary">{video.title}</p>
      </div>

      <div className="max-w-lg rounded-2xl border border-border-default bg-white p-6">
        <VideoForm video={video} action={updateVideo.bind(null, id)} submitLabel="Save changes" events={events.map((e) => ({ id: e.id, title: e.title }))} disciplines={disciplines} />
      </div>
    </AdminLayout>
  );
}
