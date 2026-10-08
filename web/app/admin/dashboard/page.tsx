import Link from "next/link";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { ApprovalRow } from "@/components/admin/ApprovalRow";
import {
  BriefcaseIcon,
  CalendarIcon,
  DocumentIcon,
  EditIcon,
  MembersIcon,
  PhotoIcon,
} from "@/components/ui/icons";
import { getAdminMembersPage } from "@/lib/db/queries/members";
import { getAdminBusinessesPage } from "@/lib/db/queries/businesses";
import { getDashboardCounts } from "@/lib/db/queries/dashboard";
import { getAdminUpcomingEvents } from "@/lib/db/queries/events";
import { getRsvpSummary } from "@/lib/db/queries/rsvps";
import { getAdminPosts } from "@/lib/db/queries/blog";
import { getAdminMediaStats } from "@/lib/db/queries/stats";
import { getRecentActivity, timeAgo } from "@/lib/db/queries/activity";
import { auth } from "@/auth";
import { approveMember, suspendMember } from "@/app/admin/members/actions";
import { approveBusiness, rejectBusiness } from "@/app/admin/businesses/actions";
import { approvePost, rejectPost } from "@/app/admin/edit-post/actions";

export default async function AdminDashboardPage() {
  const session = await auth();
  const isSuperadmin = session?.user?.platformRole === "superadmin";
  // Counts come from COUNT queries; the approval lists load only the pending rows (first page).
  const [counts, { items: pendingMembers }, { items: pendingBusinesses }, pendingPosts] = await Promise.all([
    getDashboardCounts(),
    getAdminMembersPage({ status: "pending", page: 1 }),
    getAdminBusinessesPage({ status: "pending", page: 1 }),
    getAdminPosts("pending"),
  ]);
  const events = await getAdminUpcomingEvents();
  const eventRsvpSummaries = await Promise.all(events.slice(0, 3).map((e) => getRsvpSummary(e.id)));
  const [media, activity] = await Promise.all([getAdminMediaStats(), getRecentActivity()]);
  const firstName = session?.user?.name?.split(" ")[0];

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-serif text-4xl font-medium">{firstName ? `Welcome back, ${firstName}` : "Welcome back"}</h1>
          <p className="text-text-secondary">Here is what needs your attention today.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 md:grid-cols-5">
        <AdminStatCard label="Members" value={String(counts.members)} caption={`${counts.pendingMembers} waiting for approval`} icon={<MembersIcon />} />
        <AdminStatCard label="Blog posts" value={String(counts.posts)} caption={`${counts.pendingPosts} waiting for review`} icon={<DocumentIcon />} />
        <AdminStatCard
          label="Upcoming events"
          value={String(events.length)}
          caption={events[0] ? `Next: ${events[0].title}, ${events[0].dateLabel}` : "None scheduled"}
          icon={<CalendarIcon />}
        />
        <AdminStatCard label="Photos & videos" value={String(media.photos + media.videos)} caption={`${media.uploadsThisMonth} added this month`} icon={<PhotoIcon />} />
        <AdminStatCard label="Business listings" value={String(counts.businesses)} caption={`${counts.pendingBusinesses} waiting for approval`} icon={<BriefcaseIcon />} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-border-default bg-white">
          <div className="flex items-center justify-between border-b border-[#EFEAE0] px-6 py-5">
            <h2 className="text-lg font-semibold">Membership requests</h2>
            <Link href="/admin/members" className="text-sm font-semibold">
              View all
            </Link>
          </div>
          {pendingMembers.map((m) => (
            <ApprovalRow
              key={m.id}
              initials={m.initials}
              title={m.name}
              subtitle={`${m.discipline} · Student ID ${m.studentId ?? "—"}`}
              onApprove={approveMember.bind(null, m.id)}
              onReject={suspendMember.bind(null, m.id)}
              readOnly={!isSuperadmin}
            />
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-border-default bg-white">
          <div className="flex items-center justify-between border-b border-[#EFEAE0] px-6 py-5">
            <h2 className="text-lg font-semibold">Event RSVPs</h2>
            <Link href="/admin/events" className="text-sm font-semibold">
              Manage events
            </Link>
          </div>
          <div className="flex flex-col px-6 py-2">
            {events.slice(0, 3).map((e, i) => {
              const { going, total } = eventRsvpSummaries[i];
              const width = total === 0 ? 0 : Math.round((going / total) * 100);
              return (
                <div key={e.id} className="flex flex-col gap-2.5 border-b border-[#EFEAE0] py-4 last:border-0">
                  <div className="flex justify-between text-[15px]">
                    <span className="font-semibold">{e.title}</span>
                    <span className="text-text-secondary">{e.dateLabel}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#EFEAE0]">
                    <div className="h-2 rounded-full bg-brand-green" style={{ width: `${width}%` }} />
                  </div>
                  <span className="text-[13px] text-text-secondary">{going} going of {total} responded</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-default bg-white">
        <div className="flex items-center justify-between border-b border-[#EFEAE0] px-6 py-5">
          <h2 className="text-lg font-semibold">Business submissions</h2>
          <Link href="/admin/businesses" className="text-sm font-semibold">
            View all
          </Link>
        </div>
        {pendingBusinesses.map((b) => (
          <ApprovalRow
            key={b.slug}
            initials={b.initials}
            title={b.name}
            subtitle={`${b.category} · Owner: ${b.ownerName}`}
            onApprove={approveBusiness.bind(null, b.slug)}
            onReject={rejectBusiness.bind(null, b.slug)}
            readOnly={!isSuperadmin}
          />
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-default bg-white">
        <div className="flex items-center justify-between border-b border-[#EFEAE0] px-6 py-5">
          <h2 className="text-lg font-semibold">Blog submissions</h2>
          <Link href="/admin/edit-post" className="text-sm font-semibold">
            View all
          </Link>
        </div>
        {pendingPosts.length === 0 && <p className="px-6 py-5 text-sm text-text-secondary">No posts waiting for review.</p>}
        {pendingPosts.map((p) => (
          <ApprovalRow
            key={p.id}
            initials={p.authorName.slice(0, 2).toUpperCase()}
            title={p.title}
            subtitle={`${p.category} · By ${p.authorName}`}
            onApprove={approvePost.bind(null, p.id)}
            onReject={rejectPost.bind(null, p.id)}
          />
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-default bg-white">
        <div className="border-b border-[#EFEAE0] px-6 py-5">
          <h2 className="text-lg font-semibold">Recent activity</h2>
        </div>
        {activity.length === 0 && <p className="px-6 py-5 text-sm text-text-secondary">Nothing has happened yet. Approvals, submissions and new events will show up here.</p>}
        {activity.map((a) => (
          <div key={a.id} className="flex items-center gap-3.5 border-b border-[#EFEAE0] px-6 py-3.5 text-[15px] last:border-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-amber-tint text-accent-amber-text">
              <EditIcon />
            </span>
            <span className="flex-1">{a.summary}</span>
            <span className="text-sm text-text-secondary">{timeAgo(a.createdAt)}</span>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
