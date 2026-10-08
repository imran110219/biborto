import { describe, expect, it } from "vitest";
import { SETTING_DEFAULTS, brandOf, fillReunionPlaceholders, safeHttpUrl } from "@/lib/settings";

describe("fillReunionPlaceholders", () => {
  const text = "Register before [DEADLINE]. The fee is [AMOUNT] per person. [AMOUNT]!";

  it("fills every marker from the settings", () => {
    const out = fillReunionPlaceholders(text, { ...SETTING_DEFAULTS, registration_fee: "৳500", registration_deadline: "2026-11-30" });
    expect(out).toBe("Register before 30 November 2026. The fee is ৳500 per person. ৳500!");
  });

  it("never shows a raw bracket while the settings are unset", () => {
    const out = fillReunionPlaceholders(text, SETTING_DEFAULTS);
    expect(out).not.toMatch(/\[(AMOUNT|DEADLINE)\]/);
    expect(out).toMatch(/to be announced/);
  });

  it("passes an unparseable date through instead of crashing", () => {
    expect(fillReunionPlaceholders("[DEADLINE]", { ...SETTING_DEFAULTS, registration_deadline: "soon" })).toBe("soon");
  });
});

describe("safeHttpUrl", () => {
  it("allows http(s) only", () => {
    expect(safeHttpUrl("https://example.org/a?b=1")).toBe("https://example.org/a?b=1");
    expect(safeHttpUrl("http://example.org")).toBe("http://example.org/");
    for (const bad of ["javascript:alert(1)", "data:text/html,x", "ftp://x.test", "not a url", ""]) expect(safeHttpUrl(bad)).toBeUndefined();
  });
});

describe("brandOf", () => {
  it("uses the digits of the batch name as the logo, else initials", () => {
    expect(brandOf({ ...SETTING_DEFAULTS, batch_name: "Batch 11" }).logoText).toBe("11");
    expect(brandOf({ ...SETTING_DEFAULTS, batch_name: "Batch 2012" }).logoText).toBe("2012");
    expect(brandOf({ ...SETTING_DEFAULTS, batch_name: "Alumni Association" }).logoText).toBe("AA");
  });

  it("carries the names through", () => {
    expect(brandOf(SETTING_DEFAULTS)).toEqual({ batchName: "Batch 11", institution: "Khulna University", logoText: "11" });
  });
});
