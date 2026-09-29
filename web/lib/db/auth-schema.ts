import { pgTable, uuid, text, timestamp, integer, primaryKey } from "drizzle-orm/pg-core";

// Hand-written, unlike every other table in this app (which comes from
// `npm run db:pull` introspecting db/schema.sql — see that file's
// header). @auth/drizzle-adapter imposes an exact TypeScript shape on
// these 4 tables specifically — particular JS property names
// (`refresh_token`, not `refreshToken`) and `mode: "date"` timestamps —
// that drizzle-kit's introspection can't reproduce (it defaults
// timestamps to string mode and casing is a global option, not
// per-column). db/schema.sql is still the actual source of truth for
// the DDL; this only has to match it structurally, not redefine it —
// if that DDL changes, update both by hand.

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  passwordHash: text("password_hash"),
  name: text("name"),
  image: text("image"),
  emailVerified: timestamp("email_verified", { mode: "date", withTimezone: true }),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => [primaryKey({ columns: [table.provider, table.providerAccountId] })]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.identifier, table.token] })]
);
