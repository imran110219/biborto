"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { blogPosts } from "@/drizzle/schema";
import { requireAdminMemberId } from "@/lib/auth/require-admin";
import { resolveCoverKey } from "@/lib/blog/images";
import { BLOG_CATEGORIES, type BlogCategoryOption, type BlogPostStatus } from "@/lib/types";

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
  // Form submission turns every line break into CRLF; store plain LF.
  const body = String(formData.get("body") ?? "").replace(/\r\n?/g, "\n").trim();
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const isPublic = formData.get("isPublic") === "on";
  const featured = formData.get("featured") === "on";
  const coverKeyRaw = formData.get("coverKey");
  return { title, category, authorName, body, tags, isPublic, featured, coverKeyRaw };
}

const revalidatePostPaths = (id?: string) => {
  revalidatePath("/admin/edit-post");
  if (id) revalidatePath(`/admin/edit-post/${id}`);
  revalidatePath("/blog");
  revalidatePath("/");
};

export async function createPost(status: BlogPostStatus, formData: FormData) {
  const adminId = await requireAdminMemberId();
  const { title, category, authorName, body, tags, isPublic, featured, coverKeyRaw } = readPostForm(formData);

  if (!title || !BLOG_CATEGORIES.includes(category as BlogCategoryOption)) {
    // The form requires both fields client-side, so this only fires on a
    // direct/malformed POST — no error UI to route it back to.
    return;
  }
  const cover = resolveCoverKey(coverKeyRaw, { memberId: adminId, isAdmin: true });
  if ("error" in cover) return;

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
    isPublic,
    featured,
    coverPhotoKey: cover.key,
    publishedAt: status === "published" ? new Date().toISOString() : null,
  });

  revalidatePostPaths();
  redirect("/admin/edit-post");
}

export async function savePost(id: string, status: BlogPostStatus, formData: FormData) {
  const adminId = await requireAdminMemberId();
  const { title, category, authorName, body, tags, isPublic, featured, coverKeyRaw } = readPostForm(formData);

  if (!title || !BLOG_CATEGORIES.includes(category as BlogCategoryOption)) return;
  const cover = resolveCoverKey(coverKeyRaw, { memberId: adminId, isAdmin: true });
  if ("error" in cover) return;

  const baseSet = {
    title,
    category: category as BlogCategoryOption,
    authorName: authorName || null,
    body,
    tags,
    status,
    isPublic,
    featured,
    coverPhotoKey: cover.key,
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

// Review of a member-submitted post. Approving publishes it (keeping an existing
// published_at); rejecting keeps it out of the public site.
export async function approvePost(id: string, _formData: FormData) {
  await requireAdminMemberId();
  await db
    .update(blogPosts)
    .set({ status: "published", publishedAt: sql`coalesce(${blogPosts.publishedAt}, now())` })
    .where(eq(blogPosts.id, id));
  revalidatePostPaths(id);
  revalidatePath("/account");
}

export async function rejectPost(id: string, _formData: FormData) {
  await requireAdminMemberId();
  await db.update(blogPosts).set({ status: "rejected" }).where(eq(blogPosts.id, id));
  revalidatePostPaths(id);
  revalidatePath("/account");
}

export async function deletePost(id: string, _formData: FormData) {
  await requireAdminMemberId();
  await db.delete(blogPosts).where(eq(blogPosts.id, id));
  revalidatePostPaths(id);
}
