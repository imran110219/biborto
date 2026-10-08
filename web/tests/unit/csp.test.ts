import { afterEach, describe, expect, it, vi } from "vitest";
import { POPUP_FRAME_CSP, buildCsp, securityHeaders } from "@/lib/security/csp";

afterEach(() => vi.unstubAllEnvs());

const directive = (csp: string, name: string) => csp.split("; ").find((d) => d.startsWith(`${name} `)) ?? "";

describe("buildCsp", () => {
  it("scripts need this request's nonce and never allow unsafe-inline", () => {
    vi.stubEnv("NODE_ENV", "production");
    const scripts = directive(buildCsp("abc123"), "script-src");
    expect(scripts).toContain("'nonce-abc123'");
    expect(scripts).toContain("'strict-dynamic'");
    expect(scripts).not.toContain("unsafe-inline");
    expect(scripts).not.toContain("unsafe-eval");
  });

  it("allows eval and websockets only in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(buildCsp("n")).toContain("'unsafe-eval'");
    expect(directive(buildCsp("n"), "connect-src")).toContain("ws:");
    vi.stubEnv("NODE_ENV", "production");
    expect(buildCsp("n")).not.toContain("'unsafe-eval'");
    expect(directive(buildCsp("n"), "connect-src")).not.toContain("ws:");
  });

  it("takes the image origin from R2_PUBLIC_URL and ignores a bad value", () => {
    vi.stubEnv("R2_PUBLIC_URL", "https://media.example.org/some/path");
    expect(directive(buildCsp("n"), "img-src")).toContain("https://media.example.org");
    vi.stubEnv("R2_PUBLIC_URL", "not a url");
    expect(directive(buildCsp("n"), "img-src")).not.toContain("not a url");
  });

  it("opens Google Analytics hosts only when it is configured", () => {
    vi.stubEnv("GA_MEASUREMENT_ID", "");
    expect(buildCsp("n")).not.toContain("googletagmanager");
    vi.stubEnv("GA_MEASUREMENT_ID", "G-TEST");
    expect(buildCsp("n")).toContain("googletagmanager");
  });

  it("is locked down by default: no framing, no plugins, same-origin base and forms", () => {
    const csp = buildCsp("n");
    expect(directive(csp, "frame-ancestors")).toBe("frame-ancestors 'none'");
    expect(directive(csp, "object-src")).toBe("object-src 'none'");
    expect(directive(csp, "base-uri")).toBe("base-uri 'self'");
    expect(directive(csp, "default-src")).toBe("default-src 'self'");
  });

  it("adds HTTPS-only protections only in production on an https origin", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("APP_URL", "https://example.org");
    expect(buildCsp("n")).toContain("upgrade-insecure-requests");
    expect(securityHeaders("n")["Strict-Transport-Security"]).toBeDefined();
    vi.stubEnv("APP_URL", "http://localhost:3000");
    expect(buildCsp("n")).not.toContain("upgrade-insecure-requests");
    expect(securityHeaders("n")["Strict-Transport-Security"]).toBeUndefined();
  });
});

describe("securityHeaders", () => {
  it("sets the standard hardening headers", () => {
    const h = securityHeaders("n");
    expect(h["X-Content-Type-Options"]).toBe("nosniff");
    expect(h["X-Frame-Options"]).toBe("DENY");
    expect(h["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["Permissions-Policy"]).toContain("camera=()");
    expect(h["Content-Security-Policy"]).toContain("nonce-n");
  });
});

describe("POPUP_FRAME_CSP", () => {
  it("sandboxes custom popup HTML to an opaque origin with no script network access", () => {
    expect(POPUP_FRAME_CSP).toMatch(/^sandbox allow-scripts allow-popups allow-popups-to-escape-sandbox;/);
    expect(POPUP_FRAME_CSP).not.toContain("allow-same-origin");
    expect(POPUP_FRAME_CSP).toContain("connect-src 'none'");
    expect(POPUP_FRAME_CSP).toContain("form-action 'none'");
    expect(POPUP_FRAME_CSP).toContain("frame-ancestors 'self'");
  });
});
