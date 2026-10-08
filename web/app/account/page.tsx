import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { members } from "@/drizzle/schema";
import { getSessionMemberId } from "@/lib/auth/session-member";
import { getAdminMemberById } from "@/lib/db/queries/members";
import { getDisciplineOptions } from "@/lib/db/queries/disciplines";
import { getCountryOptions } from "@/lib/db/queries/countries";
import { ProfileNudge } from "./ProfileNudge";
import { MemberHeader } from "@/app/admin/members/[id]/MemberHeader";
import { EditMemberForm } from "@/app/admin/members/[id]/edit/EditMemberForm";
import { MemberPhotoControls } from "@/app/admin/members/[id]/edit/MemberPhotoControls";

export default async function AccountPage({ searchParams }: PageProps<"/account">) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/account");

  const memberId = await getSessionMemberId();
  if (!memberId) return null; // the layout shows the "no member profile" message
  const [member, disciplines, countries] = await Promise.all([
    getAdminMemberById(memberId),
    getDisciplineOptions(),
    getCountryOptions(),
  ]);
  if (!member) return null;
  const { saved, welcome } = await searchParams;

  const publicSlug = member.isPublic && member.status === "active" ? await slugOf(member.id) : undefined;

  return (
    <>
      {publicSlug && (
        <Link href={`/members/${publicSlug}`} className="self-start text-sm font-semibold text-brand-green">
          View my public profile →
        </Link>
      )}

      {welcome === "1" && (
        <p role="status" className="rounded-xl bg-brand-green-tint px-4 py-3 text-sm font-medium text-brand-green">
          Welcome aboard! Your profile is confirmed. Tell your batchmates a bit more about you below.
        </p>
      )}

      <ProfileNudge
        missing={[
          !member.avatarUrl && "a profile photo",
          !member.profession && "your profession",
          !member.city && "the city you live in",
          !member.shortBio && "a short bio",
        ].filter((x): x is string => !!x)}
      />

      {saved === "1" && (
        <p role="status" className="rounded-xl bg-brand-green-tint px-4 py-3 text-sm font-medium text-brand-green">
          Profile saved.
        </p>
      )}

      <MemberHeader member={member} />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <EditMemberForm mode="self" member={member} disciplines={disciplines} countries={countries} returnTo="/account" />
        <aside className="flex flex-col gap-5 lg:sticky lg:top-24">
          <MemberPhotoControls
            memberId={member.id}
            avatarUrl={member.avatarUrl}
            coverPhotoUrl={member.coverPhotoUrl}
            endpoint="/api/account/photos"
          />
        </aside>
      </div>
    </>
  );
}

// The profile page URL uses the member's slug, which AdminMemberDetail doesn't carry.
async function slugOf(memberId: string) {
  const [row] = await db.select({ slug: members.slug }).from(members).where(eq(members.id, memberId)).limit(1);
  return row?.slug;
}
