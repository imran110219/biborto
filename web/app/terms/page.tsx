import type { Metadata } from "next";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms for using the Khulna University Batch 11 website.",
};

export default async function TermsPage() {
  const { contact_email: contactEmail } = await getSiteSettings();

  return (
    <PublicLayout>
      <article className="mx-auto w-full max-w-3xl px-5 py-14 md:px-8 md:py-20">
        <p className="mb-3 text-sm font-bold tracking-[0.12em] text-accent-amber-text uppercase">Legal</p>
        <h1 className="font-serif text-4xl font-medium md:text-5xl">Terms of use</h1>
        <p className="mt-4 text-sm text-text-secondary">Last updated: October 8, 2026</p>

        <div className="mt-10 space-y-8 text-base leading-7 text-text-article">
          <section className="space-y-3">
            <h2 className="font-serif text-2xl">Using the site</h2>
            <p>This website is maintained by the Khulna University Batch 11 committee for its community. By using it, you agree to these terms and to use the site lawfully and respectfully. Some features are available only to members approved by the committee.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl">Accounts and security</h2>
            <p>Keep your account credentials private and tell the committee if you believe someone has used your account without permission. You are responsible for activity carried out through your account. We may suspend access when membership is no longer active, when these terms are breached, or when needed to protect the community or the site.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl">Content you submit</h2>
            <p>You are responsible for the text, images, profile information, and business details you submit. Submit only material you have the right to share. Do not submit unlawful, misleading, abusive, discriminatory, invasive, or harmful material, or content that infringes another person’s rights.</p>
            <p>You retain ownership of your submissions. You give the committee permission to store, review, format, and display them on this site as needed to operate its community features. Submissions may be edited for presentation or declined. Content is not public until approved or published by the committee; published material may remain visible until it is removed.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl">Third-party services and links</h2>
            <p>The site may link to third-party websites or use third-party services, including Google sign-in. Those services are governed by their own terms and privacy policies. We are not responsible for external sites or services.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl">Availability and changes</h2>
            <p>We work to keep the site available and accurate, but features and content may change, be interrupted, or be removed. The site is provided for community information and coordination. To the extent permitted by applicable law, the committee makes no guarantee that the site will always be available, error-free, or suitable for a particular purpose.</p>
            <p>We may update these terms as the site changes. The updated date above indicates when this page was last revised. Continued use after an update means you accept the revised terms.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl">Contact</h2>
            <p>Questions about these terms can be sent to the Batch 11 committee{contactEmail ? <> at <a className="underline decoration-accent-amber" href={`mailto:${contactEmail}`}>{contactEmail}</a></> : " using the committee’s contact details published on this site"}.</p>
          </section>
        </div>
      </article>
    </PublicLayout>
  );
}
