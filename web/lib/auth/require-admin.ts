import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { members } from "@/drizzle/schema";

// Shared by every admin Server Action (members, businesses, ...). proxy.ts
// already keeps signed-out/non-admin users off /admin/**, but a Server
// Action is its own callable endpoint — reachable directly, not just
// through the page that renders its bound form — so it needs the same
// role check restated here. Returns the acting admin's own members.id,
// for reviewed_by columns.
export async function requireAdminMemberId(): Promise<string> {
  const session = await auth();
  const role = session?.user?.platformRole;
  if (role !== "admin" && role !== "superadmin") {
    throw new Error("Not authorized.");
  }

  const [admin] = await db
    .select({ id: members.id })
    .from(members)
    .where(eq(members.userId, session!.user.id))
    .limit(1);
  if (!admin) throw new Error("Not authorized.");
  return admin.id;
}
