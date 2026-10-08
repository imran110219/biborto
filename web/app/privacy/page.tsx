import type { Metadata } from "next";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How the Khulna University Batch 11 website handles personal information.",
};

export default async function PrivacyPage() {
  const { contact_email: contactEmail } = await getSiteSettings();

  return (
    <PublicLayout>
      <article className="mx-auto w-full max-w-3xl px-5 py-14 md:px-8 md:py-20">
        <p className="mb-3 text-sm font-bold tracking-[0.12em] text-accent-amber-text uppercase">Legal</p>
        <h1 className="font-serif text-4xl font-medium md:text-5xl">Privacy policy</h1>
        <p className="mt-4 text-sm text-text-secondary">Last updated: October 8, 2026</p>

        <div className="mt-10 space-y-8 text-base leading-7 text-text-article">
          <section className="space-y-3">
            <h2 className="font-serif text-2xl">About this policy</h2>
            <p>This policy explains how the Khulna University Batch 11 committee (“we”) handles information when you visit biborto11.com or use its member features. The site provides community news, member profiles, events, a gallery, and member-submitted stories and business listings.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl">Information we handle</h2>
            <p>Public member information is maintained by the committee. If you use member features, we may process your name, email address, profile details and photo, sign-in information, event RSVPs, and content or business details you submit. Google sign-in provides basic account information such as your email address, name, and profile image. We use the verified email address to match sign-ins to the committee’s member records.</p>
            <p>When you visit the site, our hosting and security services may process technical information such as your IP address, browser, and request details to deliver and protect the service.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl">How we use information</h2>
            <p>We use information to operate member accounts, verify membership, manage event RSVPs, review submissions, display public profiles and approved content, respond to requests, and protect the site. Information you submit for a profile or listing may be shown publicly when the relevant content is published. Submissions are reviewed before publication.</p>
            <p>If you request an account claim or password reset, we use your email address to send the requested verification link.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl">Analytics and cookies</h2>
            <p>Essential cookies and similar storage support sign-in and site operation. Google Analytics is optional: it loads only after you accept the analytics prompt. If enabled, we send page paths without query strings, and analytics is disabled on sign-in, account, administration, and submission pages. You can change your choice using “Cookie settings” in the footer. Your choice is stored in your browser’s local storage.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl">Service providers and sharing</h2>
            <p>We use service providers to host the site and database, store uploaded images, send account emails, and provide optional analytics. Google processes sign-in when you choose Google login; Google Analytics processes usage data only with your consent. These providers handle information under their own terms and privacy policies. We do not sell personal information. We may disclose information when required by law or when needed to protect the site and its users.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl">Retention and your choices</h2>
            <p>We keep information while needed to operate membership and community features, meet legal obligations, resolve disputes, and maintain security. You can ask the committee to review or correct your account details, remove a profile photo, or discuss deletion of account information. Some records may need to be retained where required for legitimate administrative or legal reasons. You can also decline analytics and manage your browser’s cookies and local storage.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl">Contact</h2>
            <p>For privacy questions or requests, contact the Batch 11 committee{contactEmail ? <> at <a className="underline decoration-accent-amber" href={`mailto:${contactEmail}`}>{contactEmail}</a></> : " using the committee’s contact details published on this site"}.</p>
          </section>
        </div>
      </article>
    </PublicLayout>
  );
}
