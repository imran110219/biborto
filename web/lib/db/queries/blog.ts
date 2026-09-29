import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { blogPosts, members } from "@/drizzle/schema";
import { formatMonthDay, estimateReadTime } from "@/lib/db/format";
import type { BlogPost, BlogPostDetail } from "@/lib/types";

// Same filter public_blog_posts (db/schema.sql) encodes, replicated here
// so this can join to members for the author's display name — see
// businesses.ts for why the view isn't queried directly.
const publicFilter = and(eq(blogPosts.status, "published"), eq(blogPosts.visibility, "public"));

function authorNameOf(row: { authorMemberName: string | null; authorName: string | null }): string {
  return row.authorMemberName ?? row.authorName ?? "Batch 11";
}

export async function getPublishedPublicPosts(): Promise<BlogPost[]> {
  const rows = await db
    .select({
      slug: blogPosts.slug,
      category: blogPosts.category,
      title: blogPosts.title,
      authorMemberName: members.name,
      authorName: blogPosts.authorName,
      publishedAt: blogPosts.publishedAt,
      body: blogPosts.body,
    })
    .from(blogPosts)
    .leftJoin(members, eq(members.id, blogPosts.authorMemberId))
    .where(publicFilter)
    .orderBy(desc(blogPosts.featured), desc(blogPosts.publishedAt));

  return rows.map((row) => ({
    slug: row.slug,
    category: row.category,
    title: row.title,
    author: authorNameOf(row),
    date: row.publishedAt ? formatMonthDay(row.publishedAt) : "",
    readTime: estimateReadTime(row.body),
  }));
}

export async function getPublicPostBySlug(slug: string): Promise<BlogPostDetail | undefined> {
  const [row] = await db
    .select({
      slug: blogPosts.slug,
      category: blogPosts.category,
      title: blogPosts.title,
      authorMemberName: members.name,
      authorName: blogPosts.authorName,
      publishedAt: blogPosts.publishedAt,
      body: blogPosts.body,
      tags: blogPosts.tags,
    })
    .from(blogPosts)
    .leftJoin(members, eq(members.id, blogPosts.authorMemberId))
    .where(and(eq(blogPosts.slug, slug), publicFilter))
    .limit(1);

  if (!row) return undefined;

  return {
    slug: row.slug,
    category: row.category,
    title: row.title,
    author: authorNameOf(row),
    date: row.publishedAt ? formatMonthDay(row.publishedAt) : "",
    readTime: estimateReadTime(row.body),
    body: row.body,
    tags: row.tags,
  };
}
