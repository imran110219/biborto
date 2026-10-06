import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { members } from "@/drizzle/schema";

// A session only exists for an active member (see auth.ts's activeMemberByEmail
// gate) — so any signed-in user already maps to exactly one members row.
export async function getSessionMemberId(): Promise<string | undefined> {
  const session = await auth();
  if (!session?.user?.id) return undefined;

  const [member] = await db
    .select({ id: members.id })
    .from(members)
    .where(eq(members.userId, session.user.id))
    .limit(1);
  return member?.id;
}

export async function requireMemberId(): Promise<string> {
  const id = await getSessionMemberId();
  if (!id) throw new Error("Sign in required.");
  return id;
}

// Submitting content (blog posts, business listings) needs an *active* member,
// not just a valid session: a member suspended after signing in still holds a
// JWT until it expires, so the status is re-read from the database.
export async function getActiveSessionMemberId(): Promise<string | undefined> {
  const session = await auth();
  if (!session?.user?.id) return undefined;

  const [member] = await db
    .select({ id: members.id, status: members.status })
    .from(members)
    .where(eq(members.userId, session.user.id))
    .limit(1);
  return member?.status === "active" ? member.id : undefined;
}

export async function requireActiveMemberId(): Promise<string> {
  const id = await getActiveSessionMemberId();
  if (!id) throw new Error("Sign in required.");
  return id;
}
