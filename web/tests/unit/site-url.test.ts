import { describe, expect, it } from "vitest";
import { configuredOrigin, publicOrigin } from "@/lib/site-url";

describe("public origin", () => {
  it("prefers AUTH_URL, then APP_URL, ignoring paths and bad values", () => {
    expect(configuredOrigin({ AUTH_URL: "https://a.example/x", APP_URL: "https://b.example" })).toBe("https://a.example");
    expect(configuredOrigin({ APP_URL: "https://b.example/" })).toBe("https://b.example");
    expect(configuredOrigin({ AUTH_URL: "not a url", APP_URL: "https://b.example" })).toBe("https://b.example");
    expect(configuredOrigin({})).toBeUndefined();
  });

  it("redirects go to the configured site, not the container's own address", () => {
    expect(publicOrigin("http://localhost:3000", { APP_URL: "https://batch11.example" })).toBe("https://batch11.example");
    expect(publicOrigin("http://localhost:3000", {})).toBe("http://localhost:3000"); // local dev: use the request
  });
});
