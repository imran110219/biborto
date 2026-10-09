import Link from "next/link";
import { CookieSettingsLink } from "@/components/AnalyticsConsent";
import { BrandMark } from "@/components/layout/BrandMark";
import { brandOf, getSiteSettings, safeHttpUrl } from "@/lib/settings";

export async function Footer() {
  const settings = await getSiteSettings();
  const brand = brandOf(settings);
  const youtube = safeHttpUrl(settings.youtube_url);
  const facebook = safeHttpUrl(settings.facebook_url);
  const contact = settings.contact_email;
  return (
    <footer className="mt-auto flex flex-col gap-12 bg-brand-green-dark px-5 py-16 text-bg-public md:px-20">
      <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <BrandMark brand={brand} tone="dark" />
          </div>
          <p className="text-sm leading-relaxed text-brand-green-tint">{settings.footer_description}</p>
        </div>

        <FooterColumn title="Explore">
          <FooterLink href="/members">Members</FooterLink>
          <FooterLink href="/blog">Blog</FooterLink>
          <FooterLink href="/events">Events</FooterLink>
          <FooterLink href="/gallery">Gallery</FooterLink>
          <FooterLink href="/business">Business Directory</FooterLink>
        </FooterColumn>

        <FooterColumn title="Community">
          <FooterLink href="/signin">Member login</FooterLink>
          <FooterLink href="/blog/submit">Share your story</FooterLink>
          <FooterLink href="/privacy">Privacy policy</FooterLink>
          <FooterLink href="/terms">Terms of use</FooterLink>
          {contact && <FooterLink href={`mailto:${contact}`}>Contact the committee</FooterLink>}
        </FooterColumn>

        {(youtube || facebook) && (
          <FooterColumn title="Follow us">
            {youtube && <FooterLink href={youtube} external>YouTube channel</FooterLink>}
            {facebook && <FooterLink href={facebook} external>Facebook group</FooterLink>}
          </FooterColumn>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-brand-green-mid pt-6 text-sm text-brand-green-tint sm:flex-row sm:justify-between">
        <span>© {brand.batchName}, {brand.institution}</span>
        <span className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <CookieSettingsLink />
          <span>
            Maintained by{" "}
            <a href="https://www.ciphertextlabs.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-bg-public hover:underline">
              Cipher Text Lab
            </a>
          </span>
        </span>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-bold tracking-[0.08em] text-brand-green-tint uppercase">{title}</span>
      {children}
    </div>
  );
}

function FooterLink({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  if (external || href.startsWith("mailto:")) {
    return (
      <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="text-sm text-bg-public hover:underline">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className="text-sm text-bg-public hover:underline">
      {children}
    </Link>
  );
}
