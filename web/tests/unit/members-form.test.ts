import { describe, expect, it } from "vitest";
import { parseMemberForm, parseSelfProfileForm, safeReturnTo, slugify } from "@/lib/members/form";

const form = (fields: Record<string, string>) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
};
const valid = { name: "Jane Doe", email: "Jane@Example.test", platformRole: "member", status: "active" };

describe("slugify", () => {
  it("lowercases, hyphenates and trims", () => {
    expect(slugify("MD. ZAHIDUR RAHMAN")).toBe("md-zahidur-rahman");
    expect(slugify("  A.B.M.  Muhitur   Rahman ")).toBe("a-b-m-muhitur-rahman");
    expect(slugify("Ayesha_Rubaiyat--Khan")).toBe("ayesha-rubaiyat-khan");
  });
  it("strips accents and falls back for names with no latin letters", () => {
    expect(slugify("José Ñandú")).toBe("jose-nandu");
    expect(slugify("মোহাম্মদ")).toBe("member");
    expect(slugify("***")).toBe("member");
  });
});

describe("safeReturnTo", () => {
  it("only allows same-site admin paths", () => {
    expect(safeReturnTo("/admin/members?page=2")).toBe("/admin/members?page=2");
    for (const bad of ["https://evil.test", "//evil.test", "/admin/..\\x", "/account", "javascript:1", ""]) {
      expect(safeReturnTo(bad)).toBe("/admin/members");
    }
  });
});

describe("parseMemberForm", () => {
  it("accepts a valid form and normalizes the email", () => {
    const result = parseMemberForm(form(valid), { requireEmail: true });
    expect("values" in result && result.values.email).toBe("jane@example.test");
  });

  it.each([
    [{ ...valid, name: " " }, /Name is required/],
    [{ ...valid, email: "" }, /Email is required/],
    [{ ...valid, email: "nope" }, /valid email/],
    [{ ...valid, platformRole: "root" }, /valid role/],
    [{ ...valid, status: "banned" }, /valid status/],
    [{ ...valid, bloodGroup: "Q+" }, /blood group/],
    [{ ...valid, dateOfBirth: "2999-01-01" }, /date of birth/],
    [{ ...valid, dateOfBirth: "yesterday" }, /date of birth/],
    [{ ...valid, linkedinUrl: "javascript:alert(1)" }, /LinkedIn/],
    [{ ...valid, shortBio: "x".repeat(501) }, /too long/],
  ])("rejects bad input %#", (fields, message) => {
    const result = parseMemberForm(form(fields), { requireEmail: true });
    expect("error" in result && result.error).toMatch(message);
  });

  it("doesn't need an email when editing", () => {
    expect("values" in parseMemberForm(form({ ...valid, email: "" }), { requireEmail: false })).toBe(true);
  });
});

describe("parseSelfProfileForm", () => {
  it("never reads identity or access fields, even if a crafted request sends them", () => {
    const result = parseSelfProfileForm(form({ city: "Dhaka", platformRole: "superadmin", status: "active", email: "x@y.test", studentId: "1", name: "Hacker" }));
    if (!("values" in result)) throw new Error("expected values");
    expect(result.values.city).toBe("Dhaka");
    for (const key of ["platformRole", "status", "email", "studentId", "name"]) expect(result.values).not.toHaveProperty(key);
  });
});
