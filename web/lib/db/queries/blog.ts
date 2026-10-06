import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { blogPosts, members } from "@/drizzle/schema";
import { formatMonthDay, estimateReadTime } from "@/lib/db/format";
import { blogImageUrl } from "@/lib/blog/images";
import type { AdminBlogPost, AdminBlogPostDetail, BlogPost, BlogPostDetail } from "@/lib/types";

// Same filter public_blog_posts (db/schema.sql) encodes, replicated here
// so this can join to members for the author's display name — see
// businesses.ts for why the view isn't queried directly.
const publicFilter = and(eq(blogPosts.status, "published"), eq(blogPosts.isPublic, true));

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
      coverPhotoKey: blogPosts.coverPhotoKey,
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
    coverUrl: blogImageUrl(row.coverPhotoKey),
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
      coverPhotoKey: blogPosts.coverPhotoKey,
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
    coverUrl: blogImageUrl(row.coverPhotoKey),
  };
}

// Admin-only: every post regardless of status/is_public.
export async function getAdminPosts(): Promise<AdminBlogPost[]> {
  const rows = await db
    .select({
      id: blogPosts.id,
      slug: blogPosts.slug,
      title: blogPosts.title,
      category: blogPosts.category,
      authorMemberName: members.name,
      authorName: blogPosts.authorName,
      status: blogPosts.status,
      isPublic: blogPosts.isPublic,
      updatedAt: blogPosts.updatedAt,
    })
    .from(blogPosts)
    .leftJoin(members, eq(members.id, blogPosts.authorMemberId))
    .orderBy(desc(blogPosts.updatedAt));

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    authorName: authorNameOf(row),
    status: row.status,
    isPublic: row.isPublic,
    updatedAt: formatMonthDay(row.updatedAt),
  }));
}

export async function getAdminPostById(id: string): Promise<AdminBlogPostDetail | undefined> {
  const [row] = await db
    .select({
      id: blogPosts.id,
      slug: blogPosts.slug,
      title: blogPosts.title,
      category: blogPosts.category,
      authorMemberName: members.name,
      authorName: blogPosts.authorName,
      body: blogPosts.body,
      tags: blogPosts.tags,
      status: blogPosts.status,
      isPublic: blogPosts.isPublic,
      featured: blogPosts.featured,
      coverPhotoKey: blogPosts.coverPhotoKey,
    })
    .from(blogPosts)
    .leftJoin(members, eq(members.id, blogPosts.authorMemberId))
    .where(eq(blogPosts.id, id))
    .limit(1);

  if (!row) return undefined;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    authorName: row.authorName ?? "",
    body: row.body,
    tags: row.tags,
    status: row.status,
    isPublic: row.isPublic,
    featured: row.featured,
    coverKey: row.coverPhotoKey ?? "",
    coverUrl: blogImageUrl(row.coverPhotoKey),
  };
}
