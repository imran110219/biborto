"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { blogPosts } from "@/drizzle/schema";
import { requireAdminMemberId } from "@/lib/auth/require-admin";
import { BLOG_CATEGORIES, type BlogCategoryOption, type BlogPostStatus, type BlogVisibility } from "@/lib/types";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function readPostForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "") as BlogCategoryOption | "";
  const authorName = String(formData.get("authorName") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const visibility = String(formData.get("visibility") ?? "public") as BlogVisibility;
  const featured = formData.get("featured") === "on";
  return { title, category, authorName, body, tags, visibility, featured };
}

const revalidatePostPaths = (id?: string) => {
  revalidatePath("/admin/edit-post");
  if (id) revalidatePath(`/admin/edit-post/${id}`);
  revalidatePath("/blog");
  revalidatePath("/");
};

export async function createPost(status: BlogPostStatus, formData: FormData) {
  const adminId = await requireAdminMemberId();
  const { title, category, authorName, body, tags, visibility, featured } = readPostForm(formData);

  if (!title || !BLOG_CATEGORIES.includes(category as BlogCategoryOption)) {
    // The form requires both fields client-side, so this only fires on a
    // direct/malformed POST — no error UI to route it back to.
    return;
  }

  const slug = `${slugify(title)}-${Math.random().toString(36).slice(2, 7)}`;

  await db.insert(blogPosts).values({
    slug,
    category: category as BlogCategoryOption,
    title,
    authorMemberId: adminId,
    authorName: authorName || null,
    body,
    tags,
    status,
    visibility,
    featured,
    publishedAt: status === "published" ? new Date().toISOString() : null,
  });

  revalidatePostPaths();
  redirect("/admin/edit-post");
}

export async function savePost(id: string, status: BlogPostStatus, formData: FormData) {
  await requireAdminMemberId();
  const { title, category, authorName, body, tags, visibility, featured } = readPostForm(formData);

  if (!title || !BLOG_CATEGORIES.includes(category as BlogCategoryOption)) return;

  const baseSet = {
    title,
    category: category as BlogCategoryOption,
    authorName: authorName || null,
    body,
    tags,
    status,
    visibility,
    featured,
  };

  await db
    .update(blogPosts)
    .set(
      status === "published"
        ? { ...baseSet, publishedAt: sql`coalesce(${blogPosts.publishedAt}, now())` }
        : baseSet
    )
    .where(eq(blogPosts.id, id));

  revalidatePostPaths(id);
  redirect("/admin/edit-post");
}

export async function deletePost(id: string, _formData: FormData) {
  await requireAdminMemberId();
  await db.delete(blogPosts).where(eq(blogPosts.id, id));
  revalidatePostPaths(id);
}
