import { AdminLayout } from "@/components/layout/AdminLayout";
import { auth } from "@/auth";
import { getSiteSettings } from "@/lib/settings";
import { SettingsForm } from "./SettingsForm";

export default async function AdminSettingsPage() {
  const [session, settings] = await Promise.all([auth(), getSiteSettings()]);
  const canEdit = session?.user?.platformRole === "superadmin";

  return (
    <AdminLayout>
      <div className="flex flex-col gap-1.5">
        <h1 className="font-serif text-4xl font-medium">Settings</h1>
        <p className="text-text-secondary">Organization details and reunion defaults shown across the site.</p>
      </div>
      <SettingsForm settings={settings} canEdit={canEdit} />
    </AdminLayout>
  );
}
