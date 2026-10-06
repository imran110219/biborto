import Link from "next/link";
import { PostStatusPill, StatusBadge } from "@/components/ui/Badge";
import type { MySubmissions as Submissions } from "@/lib/db/queries/submissions";

const cardClasses = "flex flex-col gap-4 rounded-2xl border border-border-default bg-white p-5 sm:p-6";
const linkButton = "inline-flex h-10 items-center rounded-[10px] bg-brand-green px-4 text-sm font-semibold text-white";

// A member's own blog posts and business listings with their review status.
// Read-only on purpose: members can submit, but changes after that go through
// the committee.
export function MySubmissions({
  submissions,
  slots,
}: {
  submissions: Submissions;
  slots: { used: number; max: number; remaining: number };
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section className={cardClasses}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl font-medium">My blog posts</h2>
            <p className="text-sm text-text-secondary">Posts are reviewed by the committee before they go live.</p>
          </div>
          <Link href="/blog/submit" className={linkButton}>
            Write a post
          </Link>
        </div>
        {submissions.posts.length === 0 ? (
          <p className="text-sm text-text-secondary">You haven&apos;t submitted a post yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-[#EFEAE0]">
            {submissions.posts.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold">{p.title}</p>
                  <p className="text-xs text-text-secondary">
                    {p.category} · {p.date}
                  </p>
                </div>
                <PostStatusPill status={p.status} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={cardClasses}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl font-medium">My businesses</h2>
            <p className="text-sm text-text-secondary">
              {slots.used} of {slots.max} listings used. A rejected listing frees its slot.
            </p>
          </div>
          {slots.remaining > 0 ? (
            <Link href="/business/submit" className={linkButton}>
              List a business
            </Link>
          ) : (
            <span className="inline-flex h-10 items-center rounded-[10px] bg-bg-admin px-4 text-sm font-semibold text-text-secondary">Limit reached</span>
          )}
        </div>
        {submissions.businesses.length === 0 ? (
          <p className="text-sm text-text-secondary">You haven&apos;t listed a business yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-[#EFEAE0]">
            {submissions.businesses.map((b) => (
              <li key={b.slug} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  {b.status === "active" ? (
                    <Link href={`/business/${b.slug}`} className="truncate text-[15px] font-semibold text-brand-green">
                      {b.name}
                    </Link>
                  ) : (
                    <p className="truncate text-[15px] font-semibold">{b.name}</p>
                  )}
                  <p className="text-xs text-text-secondary">
                    {b.category} · {b.date}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
