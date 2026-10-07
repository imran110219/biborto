import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "@/auth";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { EditIcon } from "@/components/ui/icons";
import { getAdminMemberById } from "@/lib/db/queries/members";
import { getDisciplineOptions } from "@/lib/db/queries/disciplines";
import { getCountryOptions } from "@/lib/db/queries/countries";
import { MemberHeader } from "./MemberHeader";

function Field({ label, children }: { label: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{label}</dt>
      <dd className="whitespace-pre-line break-words text-sm">
        {children || <span className="text-text-secondary">Not provided</span>}
      </dd>
    </div>
  );
}

function UrlField({ label, url }: { label: string; url: string }) {
  return (
    <Field label={label}>
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-green underline">
          {url}
        </a>
      )}
    </Field>
  );
}

function Card({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border-default bg-white p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="font-serif text-xl font-medium">{title}</h2>
        {hint && <p className="mt-0.5 text-sm text-text-secondary">{hint}</p>}
      </div>
      <dl className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">{children}</dl>
    </section>
  );
}

// The member's two public addresses. They only work while the profile is active and public.
function ProfileUrls({ slug, rollSlug, live }: { slug?: string; rollSlug?: string; live: boolean }) {
  if (!slug) return null;
  const rows = [
    { label: "Name URL (canonical)", path: `/members/${slug}` },
    { label: "Roll URL", path: rollSlug ? `/members/${rollSlug}` : undefined },
  ];
  return (
    <section className="rounded-2xl border border-border-default bg-white p-5 sm:p-6">
      <div className="mb-4">
        <h2 className="font-serif text-xl font-medium">Profile URLs</h2>
        <p className="mt-0.5 text-sm text-text-secondary">
          {live ? "Both addresses open the same public profile." : "Not reachable yet: the profile must be active and public."}
        </p>
      </div>
      <dl className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.label} className="flex flex-col gap-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{r.label}</dt>
            <dd className="break-all text-sm">
              {r.path ? (
                live ? (
                  <Link href={r.path} target="_blank" className="font-mono font-semibold text-brand-green underline">
                    {r.path}
                  </Link>
                ) : (
                  <span className="font-mono">{r.path}</span>
                )
              ) : (
                <span className="text-text-secondary">Needs a discipline and a student ID</span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default async function ViewMemberPage({ params, searchParams }: PageProps<"/admin/members/[id]">) {
  const { id } = await params;
  const { from } = await searchParams;
  const [member, disciplines, countries, session] = await Promise.all([
    getAdminMemberById(id),
    getDisciplineOptions(),
    getCountryOptions(),
    auth(),
  ]);
  if (!member) notFound();

  const fromProfile = from === "profile";
  const backHref = fromProfile ? "/admin/dashboard" : "/admin/members";
  const isSelf = session?.user?.memberId === member.id;
  const canEdit = session?.user?.platformRole === "superadmin";
  const discipline = disciplines.find((d) => d.id === member.disciplineId)?.name;
  const country = countries.find((c) => c.id === member.countryId)?.name;

  return (
    <AdminLayout>
      <div className="flex max-w-6xl flex-col gap-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-text-secondary">
          <Link href={backHref} className="font-semibold text-brand-green">
            {fromProfile ? "Dashboard" : "Members"}
          </Link>
          <span aria-hidden>/</span>
          <span className="truncate">{isSelf ? "My profile" : member.name}</span>
        </nav>

        <MemberHeader member={member} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-text-secondary">
            {canEdit ? "Viewing profile." : "You have view-only access. Only a superadmin can edit member profiles."}
          </p>
          {canEdit && (
            <Link
              href={`/admin/members/${member.id}/edit${fromProfile ? "?from=profile" : ""}`}
              className="flex h-11 items-center gap-2 rounded-[10px] bg-brand-green px-5 text-sm font-semibold text-white"
            >
              <EditIcon /> Edit member
            </Link>
          )}
        </div>

        <ProfileUrls slug={member.slug} rollSlug={member.rollSlug} live={member.status === "active" && member.isPublic} />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card title="Profile">
            <Field label="Discipline">{discipline}</Field>
            <Field label="Campus name">{member.campusName}</Field>
            <div className="sm:col-span-2"><Field label="Short bio">{member.shortBio}</Field></div>
            <div className="sm:col-span-2"><Field label="Full bio">{member.bio}</Field></div>
            <Field label="Favorite campus place">{member.favoriteCampusPlace}</Field>
            <Field label="Most memorable event">{member.mostMemorableEvent}</Field>
          </Card>

          <div className="flex flex-col gap-5">
            <Card title="Work & location">
              <Field label="Profession">{member.profession}</Field>
              <Field label="Current employer">{member.currentEmployer}</Field>
              <Field label="City">{member.city}</Field>
              <Field label="Country">{country}</Field>
            </Card>
            <Card title="Links">
              <UrlField label="LinkedIn" url={member.linkedinUrl} />
              <UrlField label="Facebook" url={member.facebookUrl} />
              <div className="sm:col-span-2"><UrlField label="Website" url={member.websiteUrl} /></div>
            </Card>
          </div>

          <Card title="Private details" hint="Visible to admins only — never shown publicly.">
            <Field label="Email">{member.email}</Field>
            <Field label="Phone number">{member.phoneNumber}</Field>
            <Field label="Student ID">{member.studentId}</Field>
            <Field label="Blood group">{member.bloodGroup}</Field>
            <Field label="Date of birth">{member.dateOfBirth}</Field>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
