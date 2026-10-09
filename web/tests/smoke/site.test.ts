import { beforeAll, describe, expect, it } from "vitest";

// Black-box checks against a running server (see vitest.smoke.config.mts). They assume the dev
// database was seeded from db/seed*.sql (member "md-zahidur-rahman" / arch-110101, a public event).
const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const get = (path: string, init?: RequestInit) => fetch(BASE + path, { redirect: "manual", ...init });

beforeAll(async () => {
  try {
    await fetch(BASE, { signal: AbortSignal.timeout(5000) });
  } catch {
    throw new Error(`No server at ${BASE}. Start it first (npm run dev), then run npm run test:smoke.`);
  }
});

describe("public pages", () => {
  it.each(["/", "/members", "/events", "/events?view=past", "/blog", "/gallery", "/business", "/signin", "/signup", "/privacy", "/terms", "/robots.txt", "/sitemap.xml"])(
    "%s responds 200",
    async (path) => {
      expect((await get(path)).status).toBe(200);
    },
  );

  it("unknown things 404", async () => {
    for (const path of ["/members/no-such-member", "/blog/no-such-post", "/events/no-such-event", "/business/no-such-business", "/gallery/no-such-album", "/popup-frame/not-a-uuid"]) {
      expect((await get(path)).status, path).toBe(404);
    }
  });

  it("the home page shows the batch motto and a footer", async () => {
    const html = await (await get("/")).text();
    expect(html).toMatch(/One as an individual/);
    expect(html).toMatch(/<footer/);
    expect(html).toMatch(/href="https:\/\/www\.ciphertextlabs\.com"[^>]*>Cipher Text Lab</);
  });

  it("member search and filters work, and junk filters are ignored", async () => {
    expect(await (await get("/members?q=zzzzzzzzzz")).text()).toContain("No members found");
    expect((await get("/members?discipline=not-a-uuid&page=abc&city=%27")).status).toBe(200);
  });
});

describe("member profile URLs", () => {
  it("opens by name slug and by discipline-roll slug, with the name slug as canonical", async () => {
    const byName = await get("/members/md-zahidur-rahman");
    const byRoll = await get("/members/arch-110101");
    expect(byName.status).toBe(200);
    expect(byRoll.status).toBe(200);
    for (const res of [byName, byRoll]) {
      expect(await res.text()).toContain('<link rel="canonical" href="/members/md-zahidur-rahman"');
    }
  });

  it("a bare roll or a wrong discipline doesn't resolve", async () => {
    expect((await get("/members/110101")).status).toBe(404);
    expect((await get("/members/cse-110101")).status).toBe(404);
  });

  it("never leaks private member data into public pages", async () => {
    for (const path of ["/members", "/members/md-zahidur-rahman", "/"]) {
      const html = await (await get(path)).text();
      expect(html, path).not.toMatch(/zahid110101@gmail|01511197916/);
      expect(html, path).not.toMatch(/"(?:studentId|phoneNumber|dateOfBirth|bloodGroup)"/);
    }
  });
});

describe("security headers", () => {
  it("every page carries a nonce CSP that matches its scripts", async () => {
    const res = await get("/members");
    const csp = res.headers.get("content-security-policy") ?? "";
    const nonce = /'nonce-([^']+)'/.exec(csp)?.[1];
    expect(nonce).toBeTruthy();
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
    expect(await res.text()).toContain(`nonce="${nonce}"`);
    expect(res.headers.get("x-frame-options")).toBe("DENY");
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    expect(res.headers.get("referrer-policy")).toBeTruthy();
    expect(res.headers.get("x-powered-by")).toBeNull();
  });

  it("each request gets a fresh nonce", async () => {
    const nonce = async () => /'nonce-([^']+)'/.exec((await get("/events")).headers.get("content-security-policy") ?? "")?.[1];
    expect(await nonce()).not.toBe(await nonce());
  });
});

describe("access control", () => {
  it("sends anonymous visitors from /admin to sign in", async () => {
    for (const path of ["/admin", "/admin/dashboard", "/admin/members", "/admin/members/new", "/admin/settings", "/admin/members/import"]) {
      const res = await get(path);
      expect(res.status, path).toBe(307);
      expect(res.headers.get("location"), path).toContain("/signin");
    }
  });

  it("sends anonymous visitors from member pages to sign in", async () => {
    for (const path of ["/account", "/account/submissions", "/account/security", "/welcome"]) {
      const res = await get(path);
      expect(res.status, path).toBe(307);
      expect(res.headers.get("location"), path).toContain("/signin");
    }
  });

  it("has no public registration: the sign-up page only activates existing accounts", async () => {
    const html = await (await get("/signup")).text();
    expect(html).toContain("Activate your account");
    expect(html).not.toMatch(/Request membership/i);
    const denied = await (await get("/signin?error=AccessDenied")).text();
    expect(denied).toMatch(/isn(&#x27;|&apos;|')t on the member roster/);
    const failed = await (await get("/signin?error=Configuration")).text();
    expect(failed).toMatch(/Google sign-in didn(&#x27;|&apos;|')t complete/);
  });

  it("refuses protected APIs without a session", async () => {
    expect((await get("/api/blog/images", { method: "POST" })).status).toBe(401);
    expect((await get("/api/account/photos", { method: "POST" })).status).toBe(401);
    for (const path of ["/api/admin/members/export", "/api/admin/businesses/export"]) {
      expect([401, 403], path).toContain((await get(path)).status);
    }
    expect([401, 403]).toContain((await get("/api/admin/members/import", { method: "POST" })).status);
    expect([401, 403]).toContain((await get("/api/admin/gallery/photos", { method: "POST" })).status);
  });

  it("credentials in a native (non-JS) form post never reach the URL", async () => {
    const res = await get("/signin", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: "email=a%40b.test&password=secret" });
    expect(res.headers.get("location") ?? "").not.toContain("secret");
  });
});

describe("events", () => {
  it("serves a calendar file for a public event", async () => {
    const html = await (await get("/events")).text();
    const slug = /href="\/events\/([a-z0-9-]+)"/.exec(html)?.[1];
    if (!slug) return; // no public upcoming events in this database
    const res = await get(`/events/${slug}/calendar.ics`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/calendar");
    const ics = await res.text();
    expect(ics).toMatch(/^BEGIN:VCALENDAR/);
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toMatch(/END:VCALENDAR\r\n$/);
  });
});
