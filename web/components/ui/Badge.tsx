import type { ReactNode } from "react";
import type { BlogPostStatus, BusinessStatus, MemberStatus, SponsorTier } from "@/lib/types";

const base = "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold";

export function CategoryTag({ children }: { children: ReactNode }) {
  return <span className={`${base} bg-accent-amber-tint text-accent-amber-text`}>{children}</span>;
}

const statusStyles: Record<MemberStatus | BusinessStatus, string> = {
  active: "bg-brand-green-tint text-brand-green",
  pending: "bg-accent-amber-tint text-accent-amber-text",
  suspended: "bg-status-neutral-bg text-status-neutral-text",
  rejected: "bg-status-neutral-bg text-status-neutral-text",
};

const statusLabels: Record<MemberStatus | BusinessStatus, string> = {
  active: "Active",
  pending: "Pending",
  suspended: "Suspended",
  rejected: "Rejected",
};

export function StatusBadge({ status }: { status: MemberStatus | BusinessStatus }) {
  return <span className={`${base} ${statusStyles[status]}`}>{statusLabels[status]}</span>;
}

const tierStyles: Record<SponsorTier, string> = {
  diamond: "bg-diamond-tint text-diamond",
  gold: "bg-accent-amber-tint text-accent-amber-text",
  silver: "bg-tier-silver-bg text-tier-silver-text",
  bronze: "bg-tier-bronze-bg text-tier-bronze-text",
};

export function TierBadge({ tier }: { tier: SponsorTier }) {
  return (
    <span className={`${base} ${tierStyles[tier]}`}>
      {tier.charAt(0).toUpperCase() + tier.slice(1)}
    </span>
  );
}

// Admin lists: whether an item (blog post, event, album, video) is shown on
// the public site. Private = hidden from everyone but admins.
export function VisibilityBadge({ isPublic }: { isPublic: boolean }) {
  return (
    <span className={`${base} ${isPublic ? "bg-brand-green-tint text-brand-green" : "bg-status-neutral-bg text-status-neutral-text"}`}>
      {isPublic ? "Public" : "Private"}
    </span>
  );
}

const postStatusStyles: Record<BlogPostStatus, string> = {
  published: "bg-brand-green-tint text-brand-green",
  pending: "bg-accent-amber-tint text-accent-amber-text",
  draft: "bg-status-neutral-bg text-status-neutral-text",
  rejected: "bg-status-neutral-bg text-status-neutral-text",
};
const postStatusLabels: Record<BlogPostStatus, string> = {
  published: "Published",
  pending: "Pending review",
  draft: "Draft",
  rejected: "Rejected",
};

export function PostStatusPill({ status }: { status: BlogPostStatus }) {
  return <span className={`${base} ${postStatusStyles[status]}`}>{postStatusLabels[status]}</span>;
}
