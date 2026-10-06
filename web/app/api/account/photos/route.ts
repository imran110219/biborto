import { NextResponse } from "next/server";
import { getSessionMemberId } from "@/lib/auth/session-member";
import { uploadMemberPhoto } from "@/lib/members/photo-upload";
import { db } from "@/lib/db/client";
import { members } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

// A signed-in, active member sets their own profile or cover photo. The target
// member comes from the session — never from the request — so one member can't
// change another's photo through this route.
export async function POST(request: Request) {
  const memberId = await getSessionMemberId();
  if (!memberId) return NextResponse.json({ error: "Sign in to change your photo." }, { status: 401 });

  const [member] = await db.select({ status: members.status }).from(members).where(eq(members.id, memberId)).limit(1);
  if (member?.status !== "active") return NextResponse.json({ error: "Your membership isn't active." }, { status: 403 });

  return uploadMemberPhoto(request, memberId);
}
