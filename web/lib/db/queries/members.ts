import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { members } from "@/drizzle/schema";
import { initialsOf } from "@/lib/db/format";
import type { PublicMember } from "@/lib/types";

// Same filter public_members (db/schema.sql) encodes — replicated here
// rather than selecting from the view directly, since this query also
// needs to pick which columns to expose, which the view already limits
// for any other client. See PublicMember's comment in lib/types.ts for
// why email/platformRole/status/studentId are never included.
export async function getPublicMembers(): Promise<PublicMember[]> {
  const rows = await db
    .select({
      id: members.id,
      name: members.name,
      discipline: members.discipline,
      profession: members.profession,
      city: members.city,
    })
    .from(members)
    .where(and(eq(members.status, "active"), eq(members.isPublic, true)))
    .orderBy(members.name);

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    initials: initialsOf(row.name),
    discipline: row.discipline,
    profession: row.profession ?? "",
    city: row.city ?? "",
  }));
}
