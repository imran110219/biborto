export type MemberStatus = "active" | "pending" | "suspended";
export type PlatformRole = "member" | "editor" | "admin";

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
