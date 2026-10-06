import { and, desc, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { blogPosts, businesses } from "@/drizzle/schema";
import { formatMonthDay } from "@/lib/db/format";
import type { BlogPostStatus, BusinessStatus } from "@/lib/types";

export interface MySubmissions {
  posts: { id: string; title: string; category: string; status: BlogPostStatus; date: string }[];
  businesses: { slug: string; name: string; category: string; status: BusinessStatus; date: string }[];
}

// What a member has submitted, with each item's review status. Admin working
// drafts are excluded — a member only ever sees pending / published / rejected
// posts. Read-only: members can't edit a submission once it's in.
export async function getMySubmissions(memberId: string): Promise<MySubmissions> {
  const [posts, listings] = await Promise.all([
    db
      .select({ id: blogPosts.id, title: blogPosts.title, category: blogPosts.category, status: blogPosts.status, createdAt: blogPosts.createdAt })
      .from(blogPosts)
      .where(and(eq(blogPosts.authorMemberId, memberId), ne(blogPosts.status, "draft")))
      .orderBy(desc(blogPosts.createdAt)),
    db
      .select({ slug: businesses.slug, name: businesses.name, category: businesses.category, status: businesses.status, createdAt: businesses.submittedAt })
      .from(businesses)
      .where(eq(businesses.ownerMemberId, memberId))
      .orderBy(desc(businesses.submittedAt)),
  ]);

  return {
    posts: posts.map((p) => ({ id: p.id, title: p.title, category: p.category, status: p.status, date: formatMonthDay(p.createdAt) })),
    businesses: listings.map((b) => ({ slug: b.slug, name: b.name, category: b.category, status: b.status, date: formatMonthDay(b.createdAt) })),
  };
}
