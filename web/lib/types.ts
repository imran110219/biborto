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
  // False for a record the committee added by email + roll whose owner hasn't yet confirmed their details at /welcome.
  onboarded?: boolean;
}

// The editable form of a member's admin-only record — everything the
// edit page's <select>/<input>s need, including the raw disciplineId
// (Member.discipline above is already the resolved display name and
// can't round-trip into a <select>'s value).
export interface AdminMemberDetail {
  id: string;
  // Public profile addresses (`/members/<slug>`); absent on the blank "new member" form.
  slug?: string;
  rollSlug?: string; // `<discipline short code>-<roll>`, only when the member has both
  name: string;
  disciplineId: string | null;
  campusName: string;
  avatarUrl?: string;
  coverPhotoUrl?: string;
  shortBio: string;
  favoriteCampusPlace: string;
  mostMemorableEvent: string;
  profession: string;
  currentEmployer: string;
  city: string;
  countryId: string | null;
  bio: string;
  linkedinUrl: string;
  facebookUrl: string;
  websiteUrl: string;
  email: string;
  phoneNumber: string;
  studentId: string;
  bloodGroup: string | null;
  dateOfBirth: string; // yyyy-mm-dd, "" when unset
  platformRole: PlatformRole;
  status: MemberStatus;
  isPublic: boolean;
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
  avatarUrl?: string;
}

// Only the profile page needs the rest of the public card — the
// directory/home-page cards never touch these, so they stay out of the
// shared PublicMember type above.
export interface PublicMemberDetail extends PublicMember {
  campusName?: string;
  coverPhotoUrl?: string;
  shortBio?: string;
  favoriteCampusPlace?: string;
  mostMemorableEvent?: string;
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
  linkedinUrl?: string;
  facebookUrl?: string;
}

export const BUSINESS_CATEGORIES = [
  "Food & Catering",
  "Tech Services",
  "Consulting",
  "Education",
  "Retail & Trade",
  "Travel & Tourism",
] as const;
export type BusinessCategory = (typeof BUSINESS_CATEGORIES)[number];

// The editable form of a business listing's admin-only record.
export interface AdminBusinessDetail {
  slug: string;
  name: string;
  category: string;
  city: string;
  status: BusinessStatus;
  tagline: string;
  description: string;
  offerings: string[];
  testimonial: string;
  phone: string;
  email: string;
  website: string;
  linkedinUrl: string;
  facebookUrl: string;
  ownerMemberId: string | null;
  ownerName: string;
  submittedAt: string;
}

export type SponsorTier = "diamond" | "gold" | "silver" | "bronze";

export interface Sponsor {
  id: string;
  initials: string;
  name: string;
  tier: SponsorTier;
  website: string;
  active: boolean;
  logoUrl?: string;
  // Optional cross-link to a Business Directory listing (admin-facing).
  businessId?: string | null;
  businessName?: string;
}

export type RsvpStatus = "going" | "interested" | "declined";

export interface Video {
  id: string;
  title: string;
  youtubeUrl: string;
  youtubeId?: string; // parsed from youtubeUrl; undefined until a real link is set
  eventId?: string;
  eventTitle?: string;
  disciplineId?: string;
  disciplineName?: string;
  // Shown on the public site (landing page, lists, own page). Only admin
  // queries ever return non-public rows.
  isPublic: boolean;
}

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  month: string;
  day: string;
  dateLabel: string;
  timeLabel: string;
  location: string;
  category: string;
  description: string;
  featured?: boolean;
  isPublic: boolean;
  // True once the event date has passed (Asia/Dhaka calendar day).
  past?: boolean;
}

export const EVENT_CATEGORIES = ["Reunion", "Online", "Chapter", "Volunteer"] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number];

// Raw (non-display-formatted) fields the admin create/edit form needs —
// EventItem above is already formatted for display (dateLabel, timeLabel)
// and can't round-trip into <input type="date">/<input type="time">.
export interface AdminEventDetail {
  id: string;
  slug: string;
  title: string;
  eventDate: string; // "YYYY-MM-DD"
  startTime: string; // "HH:MM" or ""
  endTime: string; // "HH:MM" or ""
  location: string;
  category: string;
  description: string;
  featured: boolean;
  isPublic: boolean;
}

export interface BlogPost {
  slug: string;
  category: string;
  title: string;
  author: string;
  date: string;
  readTime: string;
  // Public URL of the post's cover photo, when it has one.
  coverUrl?: string;
}

// Only the post detail page needs the full article — BlogTeaser's
// components (used on the home page and the blog index) never touch
// body/tags, so those stay out of the shared BlogPost type above.
export interface BlogPostDetail extends BlogPost {
  body: string;
  tags: string[];
}

export const BLOG_CATEGORIES = ["Reunion", "Memories", "Careers", "Campus"] as const;
export type BlogCategoryOption = (typeof BLOG_CATEGORIES)[number];
// draft: admin working copy · pending: submitted by a member, awaiting review ·
// published / rejected: the outcome of that review.
export type BlogPostStatus = "draft" | "pending" | "published" | "rejected";

// Admin list row — every post regardless of status/is_public.
export interface AdminBlogPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  authorName: string;
  status: BlogPostStatus;
  isPublic: boolean;
  updatedAt: string;
}

// The editable form of a post's full record.
export interface AdminBlogPostDetail {
  id: string;
  slug: string;
  title: string;
  category: string;
  authorName: string;
  body: string;
  tags: string[];
  status: BlogPostStatus;
  isPublic: boolean;
  featured: boolean;
  coverKey: string;
  coverUrl?: string;
}

export type PopupKind = "html" | "image";

// Superadmin-managed home-page popup. Public-safe by design: everything here
// is shown to visitors (the admin-facing `title` is just a label).
export interface Popup {
  id: string;
  title: string;
  kind: PopupKind;
  htmlContent: string;
  imageUrl?: string;
  altText: string;
  linkUrl: string;
  heightPx: number;
  active: boolean;
}
