import { redirect } from "next/navigation";
import { getSessionMemberId } from "@/lib/auth/session-member";
import { getMySubmissions } from "@/lib/db/queries/submissions";
import { getMemberGoingEvents } from "@/lib/db/queries/rsvps";
import { getBusinessSlots } from "@/lib/businesses/limits";
import { ClearBlogDraft } from "@/components/blog/ClearBlogDraft";
import { MySubmissions } from "../MySubmissions";
import { MyEvents } from "../MyEvents";

export default async function AccountSubmissionsPage({ searchParams }: PageProps<"/account/submissions">) {
  const memberId = await getSessionMemberId();
  if (!memberId) redirect("/signin?callbackUrl=/account/submissions");

  const { submitted } = await searchParams;
  const [submissions, slots, goingEvents] = await Promise.all([
    getMySubmissions(memberId),
    getBusinessSlots(memberId),
    getMemberGoingEvents(memberId),
  ]);

  return (
    <>
      {submitted === "blog" && <ClearBlogDraft memberId={memberId} />}
      {submitted === "blog" && (
        <p role="status" className="rounded-xl bg-brand-green-tint px-4 py-3 text-sm font-medium text-brand-green">
          Thanks — your post was submitted and is waiting for committee review.
        </p>
      )}
      <MySubmissions submissions={submissions} slots={slots} />
      <MyEvents events={goingEvents} />
    </>
  );
}
