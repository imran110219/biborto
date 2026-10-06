import { and, count, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { businesses } from "@/drizzle/schema";

// A member can have at most this many business listings. Pending and active
// ones count; a rejected listing frees its slot. Listings a superadmin creates
// for a member (as owner) count too — that's a committee override of the cap
// only in the sense that the admin form itself isn't limited.
export const MAX_BUSINESSES_PER_MEMBER = 2;

export async function getBusinessSlots(memberId: string) {
  const [row] = await db
    .select({ used: count() })
    .from(businesses)
    .where(and(eq(businesses.ownerMemberId, memberId), inArray(businesses.status, ["pending", "active"])));
  const used = row?.used ?? 0;
  return { used, max: MAX_BUSINESSES_PER_MEMBER, remaining: Math.max(0, MAX_BUSINESSES_PER_MEMBER - used) };
}
