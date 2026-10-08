import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { getSessionMemberId } from "@/lib/auth/session-member";
import { AccountTabs } from "./AccountTabs";

export const metadata = { title: "My account" };

// Shared shell for the member's own pages: Profile | Submissions & events | Security.
export default async function AccountLayout({ children }: LayoutProps<"/account">) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/account");

  if (!(await getSessionMemberId())) {
    return (
      <PublicLayout>
        <section className="flex flex-col items-center gap-3 px-5 py-24 text-center">
          <h1 className="font-serif text-3xl font-medium">No member profile found</h1>
          <p className="max-w-md text-text-secondary">Your login isn&apos;t linked to a member record yet. Contact the committee.</p>
        </section>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="flex flex-col gap-6 px-5 pb-24 pt-10 md:px-20">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold tracking-[0.1em] text-accent-amber uppercase">My account</span>
          <p className="text-text-secondary">Keep your profile up to date, follow what you&apos;ve submitted and manage how you sign in.</p>
        </div>
        <AccountTabs />
        {children}
      </section>
    </PublicLayout>
  );
}
