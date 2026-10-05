import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "@/auth";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/Badge";
import { EditIcon, ExternalLinkIcon } from "@/components/ui/icons";
import { getAdminBusinessBySlug } from "@/lib/db/queries/businesses";
import { initialsOf } from "@/lib/db/format";
import { externalUrl } from "@/lib/url";

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
        <a href={externalUrl(url)} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-green underline">
          {url}
        </a>
      )}
    </Field>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border-default bg-white p-5 sm:p-6">
      <h2 className="mb-5 font-serif text-xl font-medium">{title}</h2>
      <dl className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">{children}</dl>
    </section>
  );
}

export default async function ViewBusinessPage({ params }: PageProps<"/admin/businesses/[slug]">) {
  const { slug } = await params;
  const [business, session] = await Promise.all([getAdminBusinessBySlug(slug), auth()]);
  if (!business) notFound();

  const canEdit = session?.user?.platformRole === "superadmin";

  return (
    <AdminLayout>
      <div className="flex max-w-5xl flex-col gap-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-text-secondary">
          <Link href="/admin/businesses" className="font-semibold text-brand-green">
            Businesses
          </Link>
          <span aria-hidden>/</span>
          <span className="truncate">{business.name}</span>
        </nav>

        <header className="flex flex-wrap items-center gap-4 rounded-2xl border border-border-default bg-white p-5 sm:p-6">
          <Avatar initials={initialsOf(business.name)} size="md" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-serif text-3xl font-medium">{business.name}</h1>
            <p className="text-sm text-text-secondary">
              {business.category}
              {business.city && ` · ${business.city}`} · Submitted {business.submittedAt}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={business.status} />
            {business.status === "active" && (
              <Link
                href={`/business/${business.slug}`}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border-default px-3.5 text-xs font-semibold"
              >
                Public page <ExternalLinkIcon size={13} />
              </Link>
            )}
          </div>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-text-secondary">
            {canEdit ? "Viewing listing." : "You have view-only access. Only a superadmin can edit or moderate listings."}
          </p>
          {canEdit && (
            <Link
              href={`/admin/businesses/${business.slug}/edit`}
              className="flex h-11 items-center gap-2 rounded-[10px] bg-brand-green px-5 text-sm font-semibold text-white"
            >
              <EditIcon /> Edit listing
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card title="Listing">
            <div className="sm:col-span-2"><Field label="Tagline">{business.tagline}</Field></div>
            <div className="sm:col-span-2"><Field label="Description">{business.description}</Field></div>
            <div className="sm:col-span-2">
              <Field label="Offerings">
                {business.offerings.length > 0 && (
                  <span className="flex flex-wrap gap-2">
                    {business.offerings.map((o) => (
                      <span key={o} className="rounded-full bg-brand-green-tint px-3 py-1 text-xs font-semibold text-brand-green">
                        {o}
                      </span>
                    ))}
                  </span>
                )}
              </Field>
            </div>
            <div className="sm:col-span-2"><Field label="Testimonial">{business.testimonial}</Field></div>
          </Card>

          <div className="flex flex-col gap-5">
            <Card title="Owner">
              <div className="sm:col-span-2">
                <Field label="Member">
                  {business.ownerMemberId && (
                    <Link href={`/admin/members/${business.ownerMemberId}`} className="font-semibold text-brand-green underline">
                      {business.ownerName}
                    </Link>
                  )}
                </Field>
              </div>
            </Card>
            <Card title="Contact & links">
              <Field label="Phone">{business.phone}</Field>
              <Field label="Email">{business.email}</Field>
              <div className="sm:col-span-2"><UrlField label="Website" url={business.website} /></div>
              <UrlField label="LinkedIn" url={business.linkedinUrl} />
              <UrlField label="Facebook" url={business.facebookUrl} />
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
