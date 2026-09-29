import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { ApprovalRow } from "@/components/admin/ApprovalRow";
import { Button } from "@/components/ui/Button";
import {
  BriefcaseIcon,
  CalendarIcon,
  DocumentIcon,
  DownloadIcon,
  EditIcon,
  MembersIcon,
  PhotoIcon,
} from "@/components/ui/icons";
import { members, businesses, events } from "@/lib/mock-data";

export default function AdminDashboardPage() {
  const pendingMembers = members.filter((m) => m.status === "pending");
  const pendingBusinesses = businesses.filter((b) => b.status === "pending");

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-serif text-4xl font-medium">Good morning, Sadman</h1>
          <p className="text-text-secondary">Here is what needs your attention today.</p>
        </div>
        <Button variant="ghost" size="sm">
          <DownloadIcon /> Export report
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-5 md:grid-cols-5">
        <AdminStatCard label="Members" value="[000]" caption={`[${pendingMembers.length.toString().padStart(2, "0")}] waiting for approval`} icon={<MembersIcon />} />
        <AdminStatCard label="Blog posts" value="[00]" caption="[0] drafts in review" icon={<DocumentIcon />} />
        <AdminStatCard label="Upcoming events" value={`[${events.length}]`} caption="Next: Grand Reunion, Dec 12" icon={<CalendarIcon />} />
        <AdminStatCard label="Photos & videos" value="[000]" caption="[00] uploads this month" icon={<PhotoIcon />} />
        <AdminStatCard label="Business listings" value="[00]" caption={`[${pendingBusinesses.length.toString().padStart(2, "0")}] waiting for approval`} icon={<BriefcaseIcon />} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-border-default bg-white">
          <div className="flex items-center justify-between border-b border-[#EFEAE0] px-6 py-5">
            <h2 className="text-lg font-semibold">Membership requests</h2>
            <a href="/admin/members" className="text-sm font-semibold">
              View all
            </a>
          </div>
          {pendingMembers.map((m) => (
            <ApprovalRow key={m.id} initials={m.initials} title={m.name} subtitle={`${m.discipline} · Student ID [ID]`} />
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-border-default bg-white">
          <div className="flex items-center justify-between border-b border-[#EFEAE0] px-6 py-5">
            <h2 className="text-lg font-semibold">Event RSVPs</h2>
            <a href="/admin/events" className="text-sm font-semibold">
              Manage events
            </a>
          </div>
          <div className="flex flex-col px-6 py-2">
            {events.slice(0, 3).map((e, i) => (
              <div key={e.id} className="flex flex-col gap-2.5 border-b border-[#EFEAE0] py-4 last:border-0">
                <div className="flex justify-between text-[15px]">
                  <span className="font-semibold">{e.title}</span>
                  <span className="text-text-secondary">{e.dateLabel}</span>
                </div>
                <div className="h-2 rounded-full bg-[#EFEAE0]">
                  <div className="h-2 rounded-full bg-brand-green" style={{ width: `${68 - i * 27}%` }} />
                </div>
                <span className="text-[13px] text-text-secondary">[00] going of [000] invited</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-default bg-white">
        <div className="flex items-center justify-between border-b border-[#EFEAE0] px-6 py-5">
          <h2 className="text-lg font-semibold">Business submissions</h2>
          <a href="/admin/businesses" className="text-sm font-semibold">
            View all
          </a>
        </div>
        {pendingBusinesses.map((b) => (
          <ApprovalRow key={b.slug} initials={b.initials} title={b.name} subtitle={`${b.category} · Owner: ${b.ownerName}`} />
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-default bg-white">
        <div className="border-b border-[#EFEAE0] px-6 py-5">
          <h2 className="text-lg font-semibold">Recent activity</h2>
        </div>
        {[
          { text: "Arif Khan submitted a blog post for review", time: "2 hours ago" },
          { text: 'Nusrat Jahan uploaded photos to "Convocation"', time: "Yesterday" },
          { text: "A new video was added from YouTube", time: "2 days ago" },
          { text: 'Event "Tree planting at Gollamari" was published', time: "3 days ago" },
        ].map((a) => (
          <div key={a.text} className="flex items-center gap-3.5 border-b border-[#EFEAE0] px-6 py-3.5 text-[15px] last:border-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-amber-tint text-accent-amber-text">
              <EditIcon />
            </span>
            <span className="flex-1">{a.text}</span>
            <span className="text-sm text-text-secondary">{a.time}</span>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
