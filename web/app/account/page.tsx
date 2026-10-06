import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/auth-schema";
import { members } from "@/drizzle/schema";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { getSessionMemberId } from "@/lib/auth/session-member";
import { getAdminMemberById } from "@/lib/db/queries/members";
import { getDisciplineOptions } from "@/lib/db/queries/disciplines";
import { getCountryOptions } from "@/lib/db/queries/countries";
import { MemberHeader } from "@/app/admin/members/[id]/MemberHeader";
import { EditMemberForm } from "@/app/admin/members/[id]/edit/EditMemberForm";
import { MemberPhotoControls } from "@/app/admin/members/[id]/edit/MemberPhotoControls";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { MySubmissions } from "./MySubmissions";
import { ClearBlogDraft } from "@/components/blog/ClearBlogDraft";
import { getMySubmissions } from "@/lib/db/queries/submissions";
import { getBusinessSlots } from "@/lib/businesses/limits";

export const metadata = { title: "My account — Batch 11" };

export default async function AccountPage({ searchParams }: PageProps<"/account">) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/account");

  const memberId = await getSessionMemberId();
  const [member, disciplines, countries, [user]] = await Promise.all([
    memberId ? getAdminMemberById(memberId) : undefined,
    getDisciplineOptions(),
    getCountryOptions(),
    db.select({ passwordHash: users.passwordHash }).from(users).where(eq(users.id, session.user.id)).limit(1),
  ]);
  const { saved, submitted } = await searchParams;
  const [submissions, slots] = memberId ? await Promise.all([getMySubmissions(memberId), getBusinessSlots(memberId)]) : [undefined, undefined];

  if (!member) {
    return (
      <PublicLayout>
        <section className="flex flex-col items-center gap-3 px-5 py-24 text-center">
          <h1 className="font-serif text-3xl font-medium">No member profile found</h1>
          <p className="max-w-md text-text-secondary">Your login isn&apos;t linked to a member record yet. Contact the committee.</p>
        </section>
      </PublicLayout>
    );
  }

  const publicSlug = member.isPublic && member.status === "active" ? await slugOf(member.id) : undefined;

  return (
    <PublicLayout>
      <section className="flex flex-col gap-6 px-5 pb-24 pt-10 md:px-20">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold tracking-[0.1em] text-accent-amber uppercase">My account</span>
            <p className="text-text-secondary">Keep your profile up to date and manage how you sign in.</p>
          </div>
          {publicSlug && (
            <Link href={`/members/${publicSlug}`} className="text-sm font-semibold text-brand-green">
              View my public profile →
            </Link>
          )}
        </div>

        {saved === "1" && (
          <p role="status" className="rounded-xl bg-brand-green-tint px-4 py-3 text-sm font-medium text-brand-green">
            Profile saved.
          </p>
        )}

        {submitted === "blog" && memberId && <ClearBlogDraft memberId={memberId} />}
        {submitted === "blog" && (
          <p role="status" className="rounded-xl bg-brand-green-tint px-4 py-3 text-sm font-medium text-brand-green">
            Thanks — your post was submitted and is waiting for committee review.
          </p>
        )}

        <MemberHeader member={member} />

        {submissions && slots && <MySubmissions submissions={submissions} slots={slots} />}

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <EditMemberForm mode="self" member={member} disciplines={disciplines} countries={countries} returnTo="/account" />
          <aside className="flex flex-col gap-5 lg:sticky lg:top-24">
            <MemberPhotoControls
              memberId={member.id}
              avatarUrl={member.avatarUrl}
              coverPhotoUrl={member.coverPhotoUrl}
              endpoint="/api/account/photos"
            />
            <ChangePasswordForm hasPassword={!!user?.passwordHash} />
          </aside>
        </div>
      </section>
    </PublicLayout>
  );
}

// The profile page URL uses the member's slug, which AdminMemberDetail doesn't carry.
async function slugOf(memberId: string) {
  const [row] = await db.select({ slug: members.slug }).from(members).where(eq(members.id, memberId)).limit(1);
  return row?.slug;
}
