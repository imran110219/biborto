import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/drizzle/schema";
import * as relations from "@/drizzle/relations";

// One pooled connection per process, cached on globalThis so Next.js
// dev's hot-reload (which re-evaluates this module on every edit)
// doesn't open a fresh pool each time.
const globalForDb = globalThis as unknown as {
  postgresClient?: postgres.Sql;
};

const client =
  globalForDb.postgresClient ??
  postgres(process.env.DATABASE_URL!, { max: 10 });

if (process.env.NODE_ENV !== "production") {
  globalForDb.postgresClient = client;
}

export const db = drizzle(client, { schema: { ...schema, ...relations } });
