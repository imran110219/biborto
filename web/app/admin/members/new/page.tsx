import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { getDisciplineOptions } from "@/lib/db/queries/disciplines";
import { getCountryOptions } from "@/lib/db/queries/countries";
import type { AdminMemberDetail } from "@/lib/types";
import { AccessCard, EditMemberForm } from "../[id]/edit/EditMemberForm";

const BLANK_MEMBER: AdminMemberDetail = {
  id: "",
  name: "",
  disciplineId: null,
  campusName: "",
  shortBio: "",
  favoriteCampusPlace: "",
  mostMemorableEvent: "",
  profession: "",
  currentEmployer: "",
  city: "",
  countryId: null,
  bio: "",
  linkedinUrl: "",
  facebookUrl: "",
  websiteUrl: "",
  email: "",
  phoneNumber: "",
  studentId: "",
  bloodGroup: null,
  dateOfBirth: "",
  platformRole: "member",
  status: "active",
  isPublic: true,
};

export default async function NewMemberPage() {
  const session = await auth();
  if (session?.user?.platformRole !== "superadmin") redirect("/admin/members");

  const [disciplines, countries] = await Promise.all([getDisciplineOptions(), getCountryOptions()]);

  return (
    <AdminLayout>
      <div className="flex max-w-6xl flex-col gap-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-text-secondary">
          <Link href="/admin/members" className="font-semibold text-brand-green">
            Members
          </Link>
          <span aria-hidden>/</span>
          <span>Add member</span>
        </nav>

        <div className="flex flex-col gap-1.5">
          <h1 className="font-serif text-4xl font-medium">Add member</h1>
          <p className="max-w-2xl text-text-secondary">
            Add a batchmate to the roster. No account is created — they claim it later by signing up with this email.
            You can upload photos after adding.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <EditMemberForm
            mode="create"
            member={BLANK_MEMBER}
            disciplines={disciplines}
            countries={countries}
            returnTo="/admin/members"
          />
          <aside className="lg:sticky lg:top-6">
            <AccessCard member={BLANK_MEMBER} isSelf={false} canEditRole />
          </aside>
        </div>
      </div>
    </AdminLayout>
  );
}
