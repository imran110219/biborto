import { redirect } from "next/navigation";
import Link from "next/link";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PageHero } from "@/components/ui/PageHero";
import { getActiveSessionMemberId } from "@/lib/auth/session-member";
import { getBusinessSlots } from "@/lib/businesses/limits";
import { SubmitBusinessForm } from "./SubmitBusinessForm";

export default async function SubmitBusinessPage() {
  const memberId = await getActiveSessionMemberId();
  if (!memberId) redirect("/signin?callbackUrl=/business/submit");
  const slots = await getBusinessSlots(memberId);

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Business directory"
        title="List your business"
        description="Free for verified batchmates. The committee reviews every submission before it goes live."
      />

      <section className="flex justify-center px-5 pb-24 md:px-20">
        <div className="w-full max-w-2xl rounded-2xl border border-border-default bg-white p-8">
          {slots.remaining > 0 ? (
            <>
              <p className="mb-5 rounded-xl bg-bg-admin px-4 py-3 text-sm text-text-secondary">
                You&apos;ve listed {slots.used} of {slots.max} businesses
                {slots.remaining === 1 ? " — this is your last one." : "."}
              </p>
              <SubmitBusinessForm />
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <h2 className="font-serif text-2xl font-medium">You&apos;ve reached the limit</h2>
              <p className="max-w-md text-text-secondary">
                Each member can list up to {slots.max} businesses, and you have {slots.used}. You can follow their
                review status on your account page. If one is rejected, that slot becomes free again.
              </p>
              <Link href="/account" className="font-semibold text-brand-green">
                Go to my account
              </Link>
            </div>
          )}
          <p className="mt-6 text-center text-sm text-text-secondary">
            <Link href="/business" className="font-semibold text-brand-green">
              Back to the directory
            </Link>
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
