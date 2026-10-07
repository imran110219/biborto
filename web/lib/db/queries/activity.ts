import { desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { activityLog } from "@/drizzle/schema";

export async function getRecentActivity(limit = 8) {
  return db
    .select({ id: activityLog.id, summary: activityLog.summary, createdAt: activityLog.createdAt })
    .from(activityLog)
    .orderBy(desc(activityLog.createdAt))
    .limit(limit);
}

// "5 minutes ago" / "Yesterday" / "12 Oct" style labels for the dashboard feed.
export function timeAgo(iso: string, now = new Date()): string {
  const then = new Date(iso);
  const minutes = Math.floor((now.getTime() - then.getTime()) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(then);
}
