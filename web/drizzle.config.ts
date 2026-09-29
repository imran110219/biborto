import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

// db/schema.sql (repo root) is the source of truth for the actual
// database schema — this config is only used to pull (introspect) it
// into typed lib/db/schema.ts for drizzle-orm to query against. Never
// run `drizzle-kit push` or `generate` here; there is no Drizzle-owned
// migration history, only the hand-written SQL in ../db/.
export default defineConfig({
  dialect: "postgresql",
  out: "./drizzle", // `drizzle-kit pull` writes schema.ts + relations.ts here
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
