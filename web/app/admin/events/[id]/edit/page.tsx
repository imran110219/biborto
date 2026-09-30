import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { getAdminEventById } from "@/lib/db/queries/events";
import { EventForm } from "../../EventForm";
import { updateEvent } from "../../actions";

export default async function EditEventPage({ params }: PageProps<"/admin/events/[id]/edit">) {
  const { id } = await params;
  const event = await getAdminEventById(id);
  if (!event) notFound();

  return (
    <AdminLayout>
      <div className="flex flex-col gap-1.5">
        <h1 className="font-serif text-4xl font-medium">Edit event</h1>
        <p className="text-text-secondary">{event.title}</p>
      </div>

      <div className="max-w-2xl rounded-2xl border border-border-default bg-white p-6">
        <EventForm event={event} action={updateEvent.bind(null, id)} submitLabel="Save changes" />
      </div>
    </AdminLayout>
  );
}
