import { describe, expect, it } from "vitest";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { SETTING_KEYS } from "@/lib/settings";

// Guards the invariants the app relies on (npm run test:integration, seeded dev database).
describe("database invariants", () => {
  it("roll (student_id) and name slug are unique", async () => {
    const dupes = await db.execute(sql`
      select 'roll' as what, student_id as v from members where student_id is not null group by student_id having count(*) > 1
      union all
      select 'slug', slug from members group by slug having count(*) > 1`);
    expect([...dupes]).toEqual([]);
  });

  it("name slugs are lowercase hyphenated text", async () => {
    const bad = await db.execute(sql`select slug from members where slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' limit 5`);
    expect([...bad]).toEqual([]);
  });

  it("a duplicate roll is rejected by the database itself", async () => {
    const [{ id, student_id }] = [...(await db.execute(sql`select id, student_id from members where student_id is not null limit 1`))] as { id: string; student_id: string }[];
    await expect(
      db.execute(sql`insert into members (slug, name, email, student_id) values (${"itest-" + id}, 'Dupe', ${"itest-" + id + "@example.test"}, ${student_id})`),
    ).rejects.toThrow();
  });

  it("only one popup can be active, and at most one active diamond sponsor", async () => {
    const popups = await db.execute(sql`select count(*)::int as n from popups where active`);
    expect([...popups][0].n).toBeLessThanOrEqual(1);
    const diamonds = await db.execute(sql`select count(*)::int as n from sponsors where tier = 'diamond' and active`);
    expect([...diamonds][0].n).toBeLessThanOrEqual(1);
  });

  it("nobody is public before confirming their details at /welcome", async () => {
    const leaked = await db.execute(sql`select email from members where profile_completed_at is null and is_public`);
    expect([...leaked]).toEqual([]);
  });

  it("no member is stuck in a sign-up-style pending state with no way in (registration is closed)", async () => {
    // 'pending' is only ever set by an admin now; a Google sign-in for an unknown email must not create rows.
    const googleStubs = await db.execute(sql`select email from members where slug like 'google-%'`);
    expect([...googleStubs]).toEqual([]);
  });

  it("every stored setting key is one the app knows", async () => {
    const rows = [...(await db.execute(sql`select key from site_settings`))] as { key: string }[];
    for (const { key } of rows) expect(SETTING_KEYS as readonly string[]).toContain(key);
  });

  it("the public_members view never exposes private columns", async () => {
    const cols = [...(await db.execute(sql`select column_name from information_schema.columns where table_name = 'public_members'`))] as { column_name: string }[];
    const names = cols.map((c) => c.column_name);
    for (const secret of ["email", "phone_number", "student_id", "blood_group", "date_of_birth"]) expect(names).not.toContain(secret);
  });
});
