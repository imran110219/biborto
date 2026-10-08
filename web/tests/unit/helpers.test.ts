import { describe, expect, it } from "vitest";
import { clientIp, formatWait, normalizeKeyPart } from "@/lib/security/rate-limit";
import { timeAgo } from "@/lib/db/queries/activity";
import { estimateReadTime, eventTimeLabel, initialsOf } from "@/lib/db/format";
import { blogImageKeyOwner, resolveCoverKey } from "@/lib/blog/images";
import { parseMemberFilters } from "@/lib/members/filters";
import { parsePublicMemberFilters, publicMemberFiltersToQuery } from "@/lib/members/public-filters";
import { parseBusinessFilters } from "@/lib/businesses/filters";
import { parseBlogFilters } from "@/lib/blog/filters";

describe("rate-limit helpers", () => {
  it("takes the first X-Forwarded-For entry, then X-Real-IP, then 'unknown'", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": "203.0.113.5, 10.0.0.1" }))).toBe("203.0.113.5");
    expect(clientIp(new Headers({ "x-real-ip": "198.51.100.7" }))).toBe("198.51.100.7");
    expect(clientIp(new Headers())).toBe("unknown");
    expect(clientIp(new Headers({ "x-forwarded-for": "x".repeat(200) })).length).toBe(64);
  });
  it("normalizes key parts and words waits", () => {
    expect(normalizeKeyPart("  Jane@X.Test ")).toBe("jane@x.test");
    expect(formatWait(1)).toBe("a minute");
    expect(formatWait(60)).toBe("a minute");
    expect(formatWait(61)).toBe("2 minutes");
    expect(formatWait(2665)).toBe("45 minutes");
  });
});

describe("formatting", () => {
  it("initials", () => {
    expect(initialsOf("Jane Doe")).toBe("JD");
    expect(initialsOf("  madonna ")).toBe("M");
    expect(initialsOf("A B C")).toBe("AC");
    expect(initialsOf("")).toBe("");
  });
  it("event times", () => {
    expect(eventTimeLabel("10:00:00", "20:00:00")).toBe("10:00 AM – 8:00 PM");
    expect(eventTimeLabel("00:30:00", null)).toBe("12:30 AM");
    expect(eventTimeLabel(null, null)).toBe("");
  });
  it("read time is at least a minute", () => {
    expect(estimateReadTime("one two")).toBe("1 min");
    expect(estimateReadTime("word ".repeat(1000))).toBe("5 min");
  });
  it("activity timestamps read naturally", () => {
    const now = new Date("2026-10-09T12:00:00Z");
    const ago = (ms: number) => new Date(now.getTime() - ms).toISOString();
    expect(timeAgo(ago(10_000), now)).toBe("Just now");
    expect(timeAgo(ago(60_000), now)).toBe("1 minute ago");
    expect(timeAgo(ago(5 * 3_600_000), now)).toBe("5 hours ago");
    expect(timeAgo(ago(30 * 3_600_000), now)).toBe("Yesterday");
    expect(timeAgo(ago(3 * 86_400_000), now)).toBe("3 days ago");
    expect(timeAgo(ago(30 * 86_400_000), now)).toMatch(/Sept? 2026/);
  });
});

describe("blog image keys", () => {
  const owner = "11111111-1111-4111-8111-111111111111";
  const key = `blog/${owner}/22222222-2222-4222-8222-222222222222.png`;
  it("reads the uploader from a valid key only", () => {
    expect(blogImageKeyOwner(key)).toBe(owner);
    for (const bad of ["blog/x/y.png", `blog/${owner}/../secret.png`, `avatars/${owner}/22222222-2222-4222-8222-222222222222.png`, `${key}.exe`]) {
      expect(blogImageKeyOwner(bad)).toBeUndefined();
    }
  });
  it("lets members use only their own cover images; admins any", () => {
    expect(resolveCoverKey(key, { memberId: owner, isAdmin: false })).toEqual({ key });
    expect(resolveCoverKey(key, { memberId: "someone-else", isAdmin: false })).toHaveProperty("error");
    expect(resolveCoverKey(key, { memberId: "someone-else", isAdmin: true })).toEqual({ key });
    expect(resolveCoverKey("", { memberId: owner, isAdmin: false })).toEqual({ key: null });
    expect(resolveCoverKey("https://evil.test/x.png", { memberId: owner, isAdmin: true })).toHaveProperty("error");
  });
});

describe("URL filter parsing", () => {
  it("drops unknown values and clamps junk", () => {
    expect(parseMemberFilters({ status: "hacked", role: "root", discipline: "not-a-uuid", page: "abc" })).toEqual({
      q: "", status: undefined, role: undefined, disciplineId: undefined, page: 1,
    });
    expect(parseMemberFilters({ status: "pending", role: "admin", page: "3", q: "x".repeat(300) })).toMatchObject({ status: "pending", role: "admin", page: 3 });
    expect(parseMemberFilters({ q: "x".repeat(300) }).q).toHaveLength(100);
  });
  it("takes the first of repeated params", () => {
    expect(parseMemberFilters({ q: ["a", "b"] }).q).toBe("a");
  });
  it("public members filters round-trip to a query string", () => {
    const uuid = "123e4567-e89b-12d3-a456-426614174000";
    const parsed = parsePublicMemberFilters({ q: "rahman", discipline: uuid, city: "Dhaka", page: "2" });
    expect(parsed).toEqual({ q: "rahman", disciplineId: uuid, city: "Dhaka", page: 2 });
    expect(publicMemberFiltersToQuery(parsed).toString()).toBe(`q=rahman&discipline=${uuid}&city=Dhaka`);
    expect(parsePublicMemberFilters({ discipline: "x'; drop table" }).disciplineId).toBeUndefined();
  });
  it("business and blog filters ignore unknown categories", () => {
    expect(parseBusinessFilters({ category: "Weapons", status: "active" })).toMatchObject({ category: undefined, status: "active" });
    expect(parseBlogFilters({ category: "Nonsense" }).category).toBeUndefined();
  });
});
