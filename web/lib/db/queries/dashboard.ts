import { count, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { blogPosts, businesses, members } from "@/drizzle/schema";

// Headline numbers for the admin dashboard cards. Plain COUNT queries — the dashboard used to
// load every member, business and post just to take `.length` of them.
export async function getDashboardCounts() {
  const [m, mPending, b, bPending, p, pPending] = await Promise.all([
    db.select({ n: count() }).from(members),
    db.select({ n: count() }).from(members).where(eq(members.status, "pending")),
    db.select({ n: count() }).from(businesses),
    db.select({ n: count() }).from(businesses).where(eq(businesses.status, "pending")),
    db.select({ n: count() }).from(blogPosts),
    db.select({ n: count() }).from(blogPosts).where(eq(blogPosts.status, "pending")),
  ]);
  return {
    members: m[0].n,
    pendingMembers: mPending[0].n,
    businesses: b[0].n,
    pendingBusinesses: bPending[0].n,
    posts: p[0].n,
    pendingPosts: pPending[0].n,
  };
}
