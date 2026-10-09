import { afterAll, describe, expect, it } from "vitest";
import { eq, like } from "drizzle-orm";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db/client";
import { accounts, sessions, users, verificationTokens } from "@/lib/db/auth-schema";

// The database half of a first Google sign-in: Auth.js's adapter creates the user, links the Google
// account, and finds it again next time. If our hand-written auth tables drift from what the adapter
// expects, this fails (and a real login would end in error=Configuration). Throwaway rows only.
const adapter = DrizzleAdapter(db, { usersTable: users, accountsTable: accounts, sessionsTable: sessions, verificationTokensTable: verificationTokens });
const EMAIL = `itest-google-${Math.random().toString(36).slice(2)}@example.test`;

afterAll(async () => {
  await db.delete(users).where(like(users.email, "itest-google-%"));
});

describe("Auth.js adapter against the real schema", () => {
  it("creates a user, links a Google account, and finds it again", async () => {
    const created = await adapter.createUser!({ id: crypto.randomUUID(), email: EMAIL, emailVerified: new Date(), name: "Itest Google", image: null });
    expect(created.email).toBe(EMAIL);

    await adapter.linkAccount!({
      userId: created.id,
      type: "oidc",
      provider: "google",
      providerAccountId: "itest-1234567890",
      access_token: "x",
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: "bearer",
      scope: "openid email profile",
      id_token: "y",
    });

    const found = await adapter.getUserByAccount!({ provider: "google", providerAccountId: "itest-1234567890" });
    expect(found?.id).toBe(created.id);
    expect((await adapter.getUserByEmail!(EMAIL))?.id).toBe(created.id);
    expect((await db.select().from(accounts).where(eq(accounts.userId, created.id))).length).toBe(1);
  });
});
