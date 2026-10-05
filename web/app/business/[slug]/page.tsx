import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PlaceholderMedia } from "@/components/ui/PlaceholderMedia";
import { Quote } from "@/components/ui/Quote";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { BusinessCard } from "@/components/BusinessCard";
import { Button } from "@/components/ui/Button";
import { ExternalLinkIcon, MailIcon, PhoneIcon, PinIcon } from "@/components/ui/icons";
import { getPublicBusinesses, getPublicBusinessBySlug } from "@/lib/db/queries/businesses";
import { externalUrl } from "@/lib/url";

export async function generateStaticParams() {
  const businesses = await getPublicBusinesses();
  return businesses.map((b) => ({ slug: b.slug }));
}

export default async function BusinessDetailPage({ params }: PageProps<"/business/[slug]">) {
  const { slug } = await params;
  const business = await getPublicBusinessBySlug(slug);
  if (!business) notFound();

  const others = (await getPublicBusinesses()).filter((b) => b.slug !== business.slug).slice(0, 4);

  return (
    <PublicLayout>
      <article className="flex flex-col items-center gap-10 px-5 pt-16 md:px-20">
        <div className="flex w-full max-w-[820px] flex-col gap-5">
          <div className="flex items-center gap-2.5 text-sm text-text-secondary">
            <Link href="/business">Business Directory</Link>
            <span>/</span>
            <span>{business.category}</span>
          </div>
          <h1 className="font-serif text-4xl font-medium leading-tight tracking-tight md:text-[58px]">
            {business.name}
          </h1>
          <p className="text-xl leading-relaxed text-text-muted">{business.tagline}</p>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-green-tint font-serif font-semibold text-brand-green">
                {business.initials}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold">Owner: {business.ownerName}</span>
                <span className="text-sm text-text-secondary">Listed since {business.submittedAt}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {business.website && (
                <Button href={externalUrl(business.website)} size="sm">
                  Visit website <ExternalLinkIcon />
                </Button>
              )}
              <button aria-label="Share by email" className="flex h-11 w-11 items-center justify-center rounded-full border border-border-input bg-white">
                <MailIcon />
              </button>
            </div>
          </div>
        </div>

        <PlaceholderMedia label={`[Cover photo: ${business.name}]`} className="h-[300px] w-full max-w-[1120px] md:h-[480px]" rounded="rounded-3xl" />

        <div className="flex w-full max-w-[720px] flex-col gap-6">
          <p className="text-lg leading-relaxed text-text-article">{business.description}</p>

          {business.offerings.length > 0 && (
            <>
              <h2 className="font-serif text-2xl font-medium md:text-3xl">What we offer</h2>
              <div className="flex flex-wrap gap-2">
                {business.offerings.map((o) => (
                  <span key={o} className="rounded-full bg-brand-green-tint px-3.5 py-2 text-sm font-semibold text-brand-green">
                    {o}
                  </span>
                ))}
              </div>
            </>
          )}

          {business.testimonial && <Quote>{business.testimonial}</Quote>}

          <h2 className="font-serif text-2xl font-medium md:text-3xl">Get in touch</h2>
          <div className="flex flex-col gap-4 rounded-[18px] border border-border-default bg-white p-7">
            {business.phone && <ContactRow icon={<PhoneIcon />} text={business.phone} />}
            {business.email && <ContactRow icon={<MailIcon size={16} />} text={business.email} />}
            <ContactRow icon={<PinIcon size={16} />} text={business.city} />
            {business.linkedinUrl && <LinkRow href={externalUrl(business.linkedinUrl)} label="LinkedIn" />}
            {business.facebookUrl && <LinkRow href={externalUrl(business.facebookUrl)} label="Facebook" />}
            {!business.phone && !business.email && !business.linkedinUrl && !business.facebookUrl && (
              <span className="text-sm text-text-secondary">
                No contact details on file yet — reach out through the committee.
              </span>
            )}
          </div>
        </div>
      </article>

      <section className="mt-24 flex flex-col gap-10 bg-[#EDE8DC] px-5 py-20 md:px-20">
        <SectionHeader eyebrow="Keep browsing" title="More businesses" viewAllHref="/business" viewAllLabel="All businesses" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
          {others.map((b) => (
            <BusinessCard key={b.slug} business={b} />
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}

function LinkRow({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[15px] hover:underline">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-brand-green-tint text-brand-green">
        <ExternalLinkIcon size={16} />
      </span>
      {label}
    </a>
  );
}

function ContactRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="flex items-center gap-3 text-[15px]">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-brand-green-tint text-brand-green">
        {icon}
      </span>
      {text}
    </span>
  );
}
