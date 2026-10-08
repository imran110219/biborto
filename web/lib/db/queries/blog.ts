import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { blogPosts, members } from "@/drizzle/schema";
import { formatMonthDay, estimateReadTime } from "@/lib/db/format";
import type { BlogCategoryOption } from "@/lib/types";
import { blogImageUrl } from "@/lib/blog/images";
import type { AdminBlogPost, AdminBlogPostDetail, BlogPost, BlogPostDetail, BlogPostStatus } from "@/lib/types";

// Same filter public_blog_posts (db/schema.sql) encodes, replicated here
// so this can join to members for the author's display name — see
// businesses.ts for why the view isn't queried directly.
const publicFilter = and(eq(blogPosts.status, "published"), eq(blogPosts.isPublic, true));

function authorNameOf(row: { authorMemberName: string | null; authorName: string | null }): string {
  // An explicit byline (set in the editor) wins; otherwise the member who wrote it.
  return row.authorName ?? row.authorMemberName ?? "Batch 11";
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

export const PUBLIC_POSTS_PAGE_SIZE = 10;

// The public blog index: published, public posts with optional category and text
// filters, paginated. Search matches the title, the byline / author's name and tags.
export async function getPublicPostsPage(filters: { q?: string; category?: BlogCategoryOption; page: number }) {
  const conditions = [publicFilter];
  const q = filters.q?.trim();
  if (q) {
    // Escape LIKE wildcards so a literal % or _ in the search isn't a pattern.
    const pattern = `%${q.replace(/[\\%_]/g, "\\$&")}%`;
    conditions.push(
      or(
        ilike(blogPosts.title, pattern),
        ilike(blogPosts.authorName, pattern),
        ilike(members.name, pattern),
        sql`array_to_string(${blogPosts.tags}, ' ') ilike ${pattern}`,
      ),
    );
  }
  if (filters.category) conditions.push(eq(blogPosts.category, filters.category));
  const where = and(...conditions);

  const [{ total }] = await db
    .select({ total: count() })
    .from(blogPosts)
    .leftJoin(members, eq(members.id, blogPosts.authorMemberId))
    .where(where);
  const pageCount = Math.max(1, Math.ceil(total / PUBLIC_POSTS_PAGE_SIZE));
  const page = Math.min(Math.max(1, filters.page), pageCount);

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
    .where(where)
    .orderBy(desc(blogPosts.featured), desc(blogPosts.publishedAt))
    .limit(PUBLIC_POSTS_PAGE_SIZE)
    .offset((page - 1) * PUBLIC_POSTS_PAGE_SIZE);

  const items: BlogPost[] = rows.map((row) => ({
    slug: row.slug,
    category: row.category,
    title: row.title,
    author: authorNameOf(row),
    date: row.publishedAt ? formatMonthDay(row.publishedAt) : "",
    readTime: estimateReadTime(row.body),
    coverUrl: blogImageUrl(row.coverPhotoKey),
  }));
  return { items, total, page, pageCount };
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
export async function getAdminPosts(status?: BlogPostStatus): Promise<AdminBlogPost[]> {
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
    .where(status ? eq(blogPosts.status, status) : undefined)
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
