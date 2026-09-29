export type MemberStatus = "active" | "pending" | "suspended";
export type PlatformRole = "member" | "admin" | "superadmin";

export interface Member {
  id: string;
  name: string;
  initials: string;
  discipline: string;
  profession: string;
  city: string;
  email: string;
  studentId?: string;
  platformRole: PlatformRole;
  status: MemberStatus;
  joinedAt: string; // "Jan 2025"
}

// The subset of Member safe to render on public (unauthenticated) pages
// — matches db's public_members view column-for-column. Deliberately
// excludes email/platformRole/status/studentId: those are admin-only,
// and a Server Component prop is serialized to the client, so including
// them here would leak exactly what the view was designed to keep out.
export interface PublicMember {
  id: string;
  slug: string;
  name: string;
  initials: string;
  discipline: string;
  profession: string;
  city: string;
  avatarKey?: string;
}

// Only the profile page needs the rest of the public card — the
// directory/home-page cards never touch these, so they stay out of the
// shared PublicMember type above.
export interface PublicMemberDetail extends PublicMember {
  currentEmployer?: string;
  bio?: string;
  country?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  websiteUrl?: string;
  joinedAt: string; // "Jan 2025"
}

export type BusinessStatus = "active" | "pending" | "rejected";

export interface Business {
  slug: string;
  initials: string;
  name: string;
  category: string;
  ownerName: string;
  city: string;
  status: BusinessStatus;
  submittedAt: string;
  tagline: string;
  description: string;
  offerings: string[];
  testimonial: string;
  phone?: string;
  email?: string;
  website?: string;
}

export type SponsorTier = "diamond" | "gold" | "silver" | "bronze";

export interface Sponsor {
  id: string;
  initials: string;
  name: string;
  tier: SponsorTier;
  website: string;
  active: boolean;
}

export interface EventItem {
  id: string;
  title: string;
  month: string;
  day: string;
  dateLabel: string;
  timeLabel: string;
  location: string;
  category: string;
  description: string;
  featured?: boolean;
}

export interface BlogPost {
  slug: string;
  category: string;
  title: string;
  author: string;
  date: string;
  readTime: string;
}

// Only the post detail page needs the full article — BlogTeaser's
// components (used on the home page and the blog index) never touch
// body/tags, so those stay out of the shared BlogPost type above.
export interface BlogPostDetail extends BlogPost {
  body: string;
  tags: string[];
}
