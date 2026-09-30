import { redirect } from "next/navigation";
import Link from "next/link";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PageHero } from "@/components/ui/PageHero";
import { getSessionMemberId } from "@/lib/auth/session-member";
import { SubmitBusinessForm } from "./SubmitBusinessForm";

export default async function SubmitBusinessPage() {
  const memberId = await getSessionMemberId();
  if (!memberId) redirect("/signin?callbackUrl=/business/submit");

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Business directory"
        title="List your business"
        description="Free for verified batchmates. The committee reviews every submission before it goes live."
      />

      <section className="flex justify-center px-5 pb-24 md:px-20">
        <div className="w-full max-w-2xl rounded-2xl border border-border-default bg-white p-8">
          <SubmitBusinessForm />
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
