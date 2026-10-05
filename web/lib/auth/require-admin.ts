import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { members } from "@/drizzle/schema";
import type { PlatformRole } from "@/lib/types";

// Shared by every admin Server Action (members, businesses, ...). proxy.ts
// already keeps signed-out/non-admin users off /admin/**, but a Server
// Action is its own callable endpoint — reachable directly, not just
// through the page that renders its bound form — so it needs the same
// role check restated here.
//
// The JWT's role claim is only a cheap first gate (and is what proxy.ts
// has to rely on). Here the role and status are re-read from Postgres,
// so a demoted or suspended admin loses write access immediately rather
// than whenever their token expires.
export async function requireAdmin(): Promise<{ id: string; role: PlatformRole }> {
  const session = await auth();
  const jwtRole = session?.user?.platformRole;
  if (!session?.user?.id || (jwtRole !== "admin" && jwtRole !== "superadmin")) {
    throw new Error("Not authorized.");
  }

  const [admin] = await db
    .select({ id: members.id, role: members.platformRole, status: members.status })
    .from(members)
    .where(eq(members.userId, session.user.id))
    .limit(1);
  if (!admin || admin.status !== "active" || (admin.role !== "admin" && admin.role !== "superadmin")) {
    throw new Error("Not authorized.");
  }
  return { id: admin.id, role: admin.role };
}

// Returns the acting admin's own members.id, for reviewed_by columns.
export async function requireAdminMemberId(): Promise<string> {
  return (await requireAdmin()).id;
}

// Superadmin-only operations (e.g. creating gallery albums). Same DB
// re-check as requireAdmin(); admins are rejected.
export async function requireSuperadmin(): Promise<string> {
  const admin = await requireAdmin();
  if (admin.role !== "superadmin") throw new Error("Not authorized.");
  return admin.id;
}
