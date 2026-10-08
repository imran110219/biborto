import { afterAll, describe, expect, it } from "vitest";
import { like } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { rateLimits } from "@/drizzle/schema";
import { consume, peek, reset } from "@/lib/security/rate-limit";

// Real Postgres (npm run test:integration). Every key starts with "itest:" and is removed afterwards.
const key = (name: string) => `itest:${name}:${Math.random().toString(36).slice(2)}`;
const RULE = { limit: 3, windowSeconds: 3600 };

afterAll(async () => {
  await db.delete(rateLimits).where(like(rateLimits.key, "itest:%"));
});

describe("rate limiting (Postgres)", () => {
  it("allows up to the limit, then blocks with a retry time", async () => {
    const k = key("limit");
    for (let i = 1; i <= 3; i++) expect((await consume(k, RULE)).allowed).toBe(true);
    const blocked = await consume(k, RULE);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    expect(blocked.retryAfterSeconds).toBeLessThanOrEqual(3600);
  });

  it("counts atomically under parallel requests", async () => {
    const k = key("parallel");
    const results = await Promise.all(Array.from({ length: 10 }, () => consume(k, RULE)));
    expect(results.filter((r) => r.allowed)).toHaveLength(3);
    expect(results.filter((r) => !r.allowed)).toHaveLength(7);
  });

  it("keeps separate keys independent", async () => {
    const [a, b] = [key("a"), key("b")];
    for (let i = 0; i < 4; i++) await consume(a, RULE);
    expect((await consume(b, RULE)).allowed).toBe(true);
  });

  it("peek reads without counting, and reset clears the counter", async () => {
    const k = key("peek");
    await consume(k, RULE);
    await consume(k, RULE);
    expect((await peek(k, RULE)).hits).toBe(2);
    expect((await peek(k, RULE)).hits).toBe(2); // peeking twice changed nothing
    expect((await peek(k, { limit: 2, windowSeconds: 3600 })).blocked).toBe(true);
    await reset(k);
    expect((await peek(k, RULE)).hits).toBe(0);
  });
});
