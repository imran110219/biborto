// One-time production database setup: applies db/schema.sql, loads the CORE seed data (disciplines,
// countries, the member roster, the bootstrap superadmin, default site settings) and creates the
// superadmin's password login — all in ONE transaction, so a failure leaves the database empty.
//
//   server/init-db.sh                          production: runs this inside the app image
//   node scripts/init-db.mjs                   local: reads DATABASE_URL etc. from web/.env.local
//
// Reads DATABASE_URL, SUPERADMIN_PASSWORD (8+ chars) and optional SUPERADMIN_EMAIL from the
// environment. It refuses to run on a database that already has the schema, and never loads the
// sample content (use `npm run db:seed` for development data). Needs only `postgres` and `bcryptjs`.
import bcrypt from "bcryptjs";
import postgres from "postgres";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
if (!process.env.DATABASE_URL && fs.existsSync(path.join(here, "../.env.local"))) {
  process.loadEnvFile(path.join(here, "../.env.local")); // understands quotes, so a password containing # works
}

const fail = (message) => {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
};

const databaseUrl = process.env.DATABASE_URL;
const password = process.env.SUPERADMIN_PASSWORD;
const email = (process.env.SUPERADMIN_EMAIL || "superadmin@biborto11.com").trim().toLowerCase();
if (!databaseUrl) fail("DATABASE_URL is not set.");
if (!password || password.length < 8) fail("SUPERADMIN_PASSWORD is required and must be at least 8 characters.");
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) fail(`SUPERADMIN_EMAIL is not a valid email address: ${email}`);

// db/ sits next to scripts/ in the Docker image (/app/db) and next to web/ in the repo.
const dbDir = [path.join(here, "../db"), path.join(here, "../../db")].find((d) => fs.existsSync(path.join(d, "schema.sql")));
if (!dbDir) fail("Could not find the db/ folder (schema.sql).");
const read = (file) => fs.readFileSync(path.join(dbDir, file), "utf8");

// Core seeds only, in dependency order (same list as db/seed.sh).
const CORE = ["disciplines", "countries", "members", "superadmin", "site_settings"];
const quote = (value) => `'${value.replaceAll("'", "''")}'`;

const sql = postgres(databaseUrl, { max: 1, onnotice: () => {} });
try {
  const [{ exists }] = await sql`select to_regclass('public.members') is not null as exists`;
  if (exists) {
    fail("This database already has the schema (a members table exists). init-db only sets up an EMPTY database.\n  Nothing was changed. To add data later use the admin pages; for schema changes see db/migrations/README.md.");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await sql.begin(async (tx) => {
    console.log("Applying schema.sql …");
    await tx.unsafe(read("schema.sql"));

    for (const entity of CORE) {
      console.log(`Seeding ${entity} …`);
      // seed_superadmin.sql takes the email as a psql variable; fill it in as a quoted literal.
      const text = read(`seed_${entity}.sql`).replaceAll(":'superadmin_email'", quote(email));
      await tx.unsafe(text);
    }

    console.log("Creating the superadmin login …");
    const [member] = await tx`select id, name from members where email = ${email} for update`;
    if (!member) throw new Error(`The seeded superadmin member ${email} was not found.`);
    const [user] = await tx`insert into users (email, password_hash, name) values (${email}, ${passwordHash}, ${member.name}) returning id`;
    await tx`update members set user_id = ${user.id} where id = ${member.id}`;
  });

  const [{ members, publicMembers }] = await sql`select (select count(*) from members)::int as members, (select count(*) from public_members)::int as "publicMembers"`;
  console.log(`\n✓ Database ready: ${members} members (${publicMembers} public), superadmin ${email}.`);
  console.log("  Start the app (server/deploy.sh), sign in, then fill in Settings.\n");
} catch (error) {
  console.error("\n✗ Setup failed and was rolled back — the database is unchanged.\n");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await sql.end();
}
