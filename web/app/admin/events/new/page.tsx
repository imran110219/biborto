import { AdminLayout } from "@/components/layout/AdminLayout";
import { EventForm } from "../EventForm";
import { createEvent } from "../actions";

export default function NewEventPage() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-1.5">
        <h1 className="font-serif text-4xl font-medium">Add event</h1>
        <p className="text-text-secondary">Reunions, chapter meetups and online talks all live here.</p>
      </div>

      <div className="max-w-2xl rounded-2xl border border-border-default bg-white p-6">
        <EventForm action={createEvent} submitLabel="Create event" />
      </div>
    </AdminLayout>
  );
}
