import Link from "next/link";
import { redirect } from "next/navigation";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PageHero } from "@/components/ui/PageHero";
import { getActiveSessionMemberId } from "@/lib/auth/session-member";
import { getBlogImageBase } from "@/lib/blog/images";
import { BlogSubmitForm } from "./BlogSubmitForm";

export const metadata = { title: "Write for the blog — Batch 11" };

export default async function SubmitPostPage() {
  const memberId = await getActiveSessionMemberId();
  if (!memberId) redirect("/signin?callbackUrl=/blog/submit");

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Blog"
        title="Write for the blog"
        description="Share a story with the batch. The committee reviews every post before it goes live."
      />

      <section className="flex justify-center px-5 pb-24 md:px-20">
        <div className="w-full max-w-3xl rounded-2xl border border-border-default bg-white p-8">
          <BlogSubmitForm imageBase={getBlogImageBase()} />
          <p className="mt-6 text-center text-sm text-text-secondary">
            <Link href="/account" className="font-semibold text-brand-green">
              See my submissions
            </Link>
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
