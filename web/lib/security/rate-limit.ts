import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";

// Fixed-window rate limiting backed by the `rate_limits` table (see db/schema.sql).
// It lives in Postgres rather than process memory so limits survive restarts and
// hold across several server instances. A window is `windowSeconds` long, aligned to
// the clock; counters for older windows are simply never read again and are deleted
// opportunistically.

export type Rule = { limit: number; windowSeconds: number };

type Row = { hits: number };

const windowStartFor = (rule: Rule, now = Date.now()) => {
  const ms = rule.windowSeconds * 1000;
  return new Date(Math.floor(now / ms) * ms);
};

const retryAfterFor = (rule: Rule, now = Date.now()) => {
  const ms = rule.windowSeconds * 1000;
  return Math.max(1, Math.ceil((Math.floor(now / ms) * ms + ms - now) / 1000));
};

async function sweep() {
  // ~1% of calls: drop counters that can no longer matter.
  if (Math.random() < 0.01) await db.execute(sql`delete from rate_limits where window_start < now() - interval '2 days'`);
}

/** Current hit count for `key` in the active window, without counting anything. */
export async function peek(key: string, rule: Rule): Promise<{ blocked: boolean; hits: number; retryAfterSeconds: number }> {
  const rows = (await db.execute(
    sql`select hits from rate_limits where key = ${key} and window_start = ${windowStartFor(rule).toISOString()}`,
  )) as unknown as Row[];
  const hits = rows[0]?.hits ?? 0;
  return { blocked: hits >= rule.limit, hits, retryAfterSeconds: retryAfterFor(rule) };
}

/** Count one event for `key`. `allowed` is false once the window's limit is exceeded. */
export async function consume(key: string, rule: Rule): Promise<{ allowed: boolean; hits: number; retryAfterSeconds: number }> {
  const rows = (await db.execute(sql`
    insert into rate_limits (key, window_start, hits)
    values (${key}, ${windowStartFor(rule).toISOString()}, 1)
    on conflict (key, window_start) do update set hits = rate_limits.hits + 1
    returning hits`)) as unknown as Row[];
  const hits = rows[0]?.hits ?? 1;
  void sweep();
  return { allowed: hits <= rule.limit, hits, retryAfterSeconds: retryAfterFor(rule) };
}

/** Forget every window for `key` (e.g. after a successful sign-in). */
export async function reset(key: string): Promise<void> {
  await db.execute(sql`delete from rate_limits where key = ${key}`);
}

/** The caller's IP as set by the reverse proxy; "unknown" when there is none. */
export function clientIp(headers: Headers): string {
  // The first X-Forwarded-For entry is the original client *if* the proxy in front
  // overwrites the header (see server/README.md). Keys that include an IP are only
  // ever one of several counters, so a spoofed value can't defeat the per-email ones.
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (forwarded || headers.get("x-real-ip") || "unknown").slice(0, 64);
}

export const normalizeKeyPart = (value: string) => value.trim().toLowerCase().slice(0, 200);

export const formatWait = (seconds: number) => {
  const minutes = Math.ceil(seconds / 60);
  return minutes <= 1 ? "a minute" : `${minutes} minutes`;
};
