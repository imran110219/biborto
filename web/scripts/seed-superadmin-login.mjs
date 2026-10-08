import bcrypt from "bcryptjs";
import postgres from "postgres";
import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env.local") });

// Same default and normalization as db/seed.sh, which seeds the member row this looks up.
const email = (process.env.SUPERADMIN_EMAIL || "superadmin@biborto11.com").trim().toLowerCase();
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error(`SUPERADMIN_EMAIL is not a valid email address: ${email}`);
const databaseUrl = process.env.DATABASE_URL;
const password = process.env.SUPERADMIN_PASSWORD;

if (!databaseUrl) throw new Error("DATABASE_URL is required.");
if (!password || password.length < 8) {
  throw new Error("SUPERADMIN_PASSWORD is required and must be at least 8 characters.");
}

const passwordHash = await bcrypt.hash(password, 10);
const sql = postgres(databaseUrl, { max: 1 });

try {
  await sql.begin(async (tx) => {
    const [member] = await tx`
      select id, user_id, name
      from members
      where email = ${email}
      for update
    `;
    if (!member) throw new Error(`Seeded superadmin member ${email} was not found.`);

    let userId = member.user_id;
    if (userId) {
      const [updatedUser] = await tx`
        update users
        set password_hash = ${passwordHash}, updated_at = now()
        where id = ${userId} and email = ${email}
        returning id
      `;
      if (!updatedUser) throw new Error("The superadmin member is linked to a missing or mismatched user.");
    } else {
      const [user] = await tx`
        insert into users (email, password_hash, name)
        values (${email}, ${passwordHash}, ${member.name})
        returning id
      `;
      userId = user.id;
      await tx`update members set user_id = ${userId} where id = ${member.id}`;
    }
  });
  process.stdout.write(`Password login seeded for ${email}.\n`);
} finally {
  await sql.end();
}
