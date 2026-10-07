"use server";

import { logActivity } from "@/lib/activity";
import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, count, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { blogPosts } from "@/drizzle/schema";
import { getActiveSessionMemberId } from "@/lib/auth/session-member";
import { resolveCoverKey } from "@/lib/blog/images";
import { MAX_PENDING_POSTS_PER_MEMBER, MAX_POST_BODY, MIN_POST_BODY } from "@/lib/blog/limits";
import { BLOG_CATEGORIES, type BlogCategoryOption } from "@/lib/types";

function slugify(title: string) {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "post";
}

// A member submits a post for review. It is stored as 'pending' — never
// published directly — with the member as author, and is invisible to the
// public until an admin approves it. Members can't edit it afterwards.
export async function submitPost(_prevState: string | undefined, formData: FormData) {
  const memberId = await getActiveSessionMemberId();
  if (!memberId) return "Sign in with an active membership to submit a post.";

  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "") as BlogCategoryOption;
  const body = String(formData.get("body") ?? "").replace(/\r\n?/g, "\n").trim();
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (!title) return "Give your post a title.";
  if (title.length > 160) return "The title must be 160 characters or fewer.";
  if (!BLOG_CATEGORIES.includes(category)) return "Choose a category.";
  if (body.length < MIN_POST_BODY) return `Write a little more — posts need at least ${MIN_POST_BODY} characters.`;
  if (body.length > MAX_POST_BODY) return `That's too long — posts can be up to ${MAX_POST_BODY.toLocaleString()} characters.`;
  if (tags.length > 8 || tags.some((t) => t.length > 30)) return "Use up to 8 tags, each 30 characters or fewer.";

  const cover = resolveCoverKey(formData.get("coverKey"), { memberId, isAdmin: false });
  if ("error" in cover) return cover.error;

  const slug = `${slugify(title)}-${randomBytes(3).toString("hex")}`;

  // Cap + insert under a per-member advisory lock (same approach as business
  // submissions) so parallel requests can't exceed the pending limit.
  const accepted = await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`blog-limit:${memberId}`}))`);
    const [{ pending }] = await tx
      .select({ pending: count() })
      .from(blogPosts)
      .where(and(eq(blogPosts.authorMemberId, memberId), eq(blogPosts.status, "pending")));
    if (pending >= MAX_PENDING_POSTS_PER_MEMBER) return false;

    await tx.insert(blogPosts).values({
      slug,
      category,
      title,
      authorMemberId: memberId,
      body,
      tags,
      status: "pending",
      isPublic: true,
      featured: false,
      coverPhotoKey: cover.key,
      publishedAt: null,
    });
    return true;
  });
  if (!accepted) return `You already have ${MAX_PENDING_POSTS_PER_MEMBER} posts waiting for review. Please wait for the committee to review them first.`;

  await logActivity({ actorId: memberId, action: "blog_post.submitted", targetType: "blog_post", summary: `{actor} submitted the blog post "${title}" for review` });

  revalidatePath("/admin/edit-post");
  revalidatePath("/admin/dashboard");
  revalidatePath("/account", "layout");
  redirect("/account/submissions?submitted=blog");
}
