import { describe, expect, it } from "vitest";
import { DEFAULT_ACCENT, DEFAULT_BRAND, contrastWithWhite, parseHex, themeColorOf, themeVars, validateThemeColor } from "@/lib/theme";

describe("theme colours", () => {
  it("parses hex with or without #, rejects the rest", () => {
    expect(parseHex("#1e4a38")).toEqual([30, 74, 56]);
    expect(parseHex("1E4A38")).toEqual([30, 74, 56]);
    for (const bad of ["", "#fff", "#12345g", "blue", "#1e4a380"]) expect(parseHex(bad)).toBeUndefined();
  });

  it("computes WCAG contrast against white", () => {
    expect(contrastWithWhite("#000000")).toBeCloseTo(21, 0);
    expect(contrastWithWhite("#ffffff")).toBeCloseTo(1, 1);
    expect(contrastWithWhite(DEFAULT_BRAND)).toBeGreaterThan(4.5);
    expect(contrastWithWhite(DEFAULT_ACCENT)).toBeGreaterThan(4.5);
  });

  it("validates colours: format and readability", () => {
    expect(validateThemeColor("Main", DEFAULT_BRAND)).toBeUndefined();
    expect(validateThemeColor("Main", "nope")).toMatch(/hex colour/);
    expect(validateThemeColor("Main", "#ffff00")).toMatch(/too light/);
  });

  it("derives shades close to the original hand-picked palette", () => {
    const v = themeVars(DEFAULT_BRAND, DEFAULT_ACCENT);
    const near = (actual: string, original: string, tolerance = 8) => {
      const [a, b] = [parseHex(actual)!, parseHex(original)!];
      return a.every((c, i) => Math.abs(c - b[i]) <= tolerance);
    };
    expect(v["--color-brand-green"]).toBe("#1e4a38");
    expect(near(v["--color-brand-green-dark"], "#143426")).toBe(true);
    expect(near(v["--color-brand-green-mid"], "#2c5a47")).toBe(true);
    expect(near(v["--color-brand-green-tint"], "#e4ece6")).toBe(true);
    expect(near(v["--color-accent-amber-tint"], "#f3e7d1", 12)).toBe(true);
    expect(near(v["--color-accent-amber-text"], "#7a4e0e")).toBe(true);
    expect(Object.keys(v)).toHaveLength(7);
  });

  it("falls back to the defaults for invalid or too-light stored values", () => {
    expect(themeVars("garbage", "#ffff00")).toEqual(themeVars(DEFAULT_BRAND, DEFAULT_ACCENT));
    expect(themeColorOf("#ffffff")).toBe(DEFAULT_BRAND);
    expect(themeColorOf("1e3a8a")).toBe("#1e3a8a"); // missing # is tolerated
  });
});
