import Link from "next/link";
import { redirect } from "next/navigation";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { getActiveSessionMemberId } from "@/lib/auth/session-member";
import { getBlogImageBase } from "@/lib/blog/images";
import { BlogSubmitForm } from "./BlogSubmitForm";

export const metadata = { title: "Write for the blog — Batch 11" };

export default async function SubmitPostPage() {
  const memberId = await getActiveSessionMemberId();
  if (!memberId) redirect("/signin?callbackUrl=/blog/submit");

  return (
    <PublicLayout>
      <section className="flex flex-col gap-6 px-5 pb-16 pt-8 md:px-10">
        <div className="mx-auto flex w-full max-w-[1104px] flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="font-serif text-3xl font-medium">Write for the blog</h1>
            <p className="text-sm text-text-secondary">Share a story with the batch. The committee reviews every post before it goes live.</p>
          </div>
          <Link href="/account" className="text-sm font-semibold text-brand-green">
            My submissions →
          </Link>
        </div>

        <BlogSubmitForm imageBase={getBlogImageBase()} />
      </section>
    </PublicLayout>
  );
}
