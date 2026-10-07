import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { activityLog, members } from "@/drizzle/schema";

// Writes one row to activity_log for the admin dashboard's "Recent activity" panel.
// `summary` may contain "{actor}", replaced with the acting member's name; it's stored
// as plain text so the entry stays readable after the target is edited or deleted.
// Best effort by design: a logging failure must never fail the action it describes.
export async function logActivity(entry: {
  actorId: string;
  action: string; // e.g. "blog_post.submitted"
  targetType: string; // e.g. "blog_post"
  targetId?: string;
  summary: string;
}) {
  try {
    const [actor] = await db.select({ name: members.name }).from(members).where(eq(members.id, entry.actorId)).limit(1);
    await db.insert(activityLog).values({
      actorMemberId: entry.actorId,
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId,
      summary: entry.summary.replace("{actor}", actor?.name ?? "A member"),
    });
  } catch (error) {
    console.error("activity log failed", error);
  }
}

// Display names for log summaries.
export async function memberNames(ids: string[]): Promise<string[]> {
  if (ids.length === 0) return [];
  const rows = await db.select({ name: members.name }).from(members).where(inArray(members.id, ids));
  return rows.map((r) => r.name);
}
