import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PlaceholderMedia } from "@/components/ui/PlaceholderMedia";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Avatar } from "@/components/ui/Avatar";
import { MemberCard } from "@/components/MemberCard";
import { BriefcaseIcon, ExternalLinkIcon, PinIcon } from "@/components/ui/icons";
import { getPublicMembers, getPublicMemberBySlug } from "@/lib/db/queries/members";

export async function generateMetadata({ params }: PageProps<"/members/[slug]">) {
  const { slug } = await params;
  const member = await getPublicMemberBySlug(slug);
  if (!member) return {};
  // Both /members/<name-slug> and /members/<roll> show this page; search engines
  // should treat the name slug as the one true address.
  return { title: `${member.name} — Batch 11`, alternates: { canonical: `/members/${member.slug}` } };
}

export default async function MemberProfilePage({ params }: PageProps<"/members/[slug]">) {
  const { slug } = await params;
  const member = await getPublicMemberBySlug(slug);
  if (!member) notFound();

  const others = await getPublicMembers({ limit: 4, excludeSlug: member.slug });
  const locationLabel = [member.city, member.country].filter(Boolean).join(", ");
  const hasSocialLinks = member.linkedinUrl || member.facebookUrl || member.websiteUrl;

  return (
    <PublicLayout>
      <article className="flex flex-col items-center gap-10 px-5 pt-16 md:px-20">
        <div className="flex w-full max-w-[820px] flex-col gap-5">
          <div className="flex items-center gap-2.5 text-sm text-text-secondary">
            <Link href="/members">Members</Link>
            <span>/</span>
            <span>{member.discipline}</span>
          </div>
          <h1 className="font-serif text-4xl font-medium leading-tight tracking-tight md:text-[58px]">
            {member.name}
          </h1>
          {member.profession && (
            <p className="text-xl leading-relaxed text-text-muted">
              {member.profession}
              {member.currentEmployer && ` at ${member.currentEmployer}`}
            </p>
          )}
          <div className="flex items-center gap-3.5 pt-2">
            <Avatar initials={member.initials} imageUrl={member.avatarUrl} size="md" />
            <div className="flex flex-col">
              {locationLabel && (
                <span className="flex items-center gap-1.5 text-sm text-text-secondary">
                  <PinIcon size={15} /> {locationLabel}
                </span>
              )}
              <span className="text-sm text-text-secondary">Batchmate since {member.joinedAt}</span>
            </div>
          </div>
        </div>

        {member.coverPhotoUrl ? (
          <div role="img" aria-label={`${member.name} cover photo`} className="h-[300px] w-full max-w-[1120px] rounded-3xl bg-cover bg-center md:h-[480px]" style={{ backgroundImage: `url("${member.coverPhotoUrl}")` }} />
        ) : (
          <PlaceholderMedia label={`[Cover photo: ${member.name}]`} className="h-[300px] w-full max-w-[1120px] md:h-[480px]" rounded="rounded-3xl" />
        )}

        <div className="flex w-full max-w-[720px] flex-col gap-6">
          <p className="text-lg leading-relaxed text-text-article">
            {member.shortBio || member.bio || `${member.name} hasn't added a bio yet.`}
          </p>

          {(member.favoriteCampusPlace || member.mostMemorableEvent) && (
            <section className="flex flex-col gap-4 rounded-[18px] border border-border-default bg-white p-7">
              <h2 className="font-serif text-2xl font-medium">Campus memories</h2>
              {member.favoriteCampusPlace && (
                <p><strong>Favorite campus place:</strong> {member.favoriteCampusPlace}</p>
              )}
              {member.mostMemorableEvent && (
                <p><strong>Most memorable event:</strong> {member.mostMemorableEvent}</p>
              )}
            </section>
          )}

          <h2 className="font-serif text-2xl font-medium md:text-3xl">Connect</h2>
          <div className="flex flex-col gap-4 rounded-[18px] border border-border-default bg-white p-7">
            <span className="flex items-center gap-3 text-[15px]">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-brand-green-tint text-brand-green">
                <BriefcaseIcon size={16} />
              </span>
              {member.discipline}
            </span>
            {member.campusName && (
              <span className="text-sm text-text-secondary">Campus: {member.campusName}</span>
            )}
            {member.linkedinUrl && <LinkRow href={member.linkedinUrl} label="LinkedIn" />}
            {member.facebookUrl && <LinkRow href={member.facebookUrl} label="Facebook" />}
            {member.websiteUrl && <LinkRow href={member.websiteUrl} label="Website" />}
            {!hasSocialLinks && (
              <span className="text-sm text-text-secondary">
                No social links on file yet.
              </span>
            )}
          </div>
        </div>
      </article>

      <section className="mt-24 flex flex-col gap-10 bg-[#EDE8DC] px-5 py-20 md:px-20">
        <SectionHeader eyebrow="Keep browsing" title="More members" viewAllHref="/members" viewAllLabel="All members" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
          {others.map((m) => (
            <MemberCard key={m.slug} member={m} />
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
