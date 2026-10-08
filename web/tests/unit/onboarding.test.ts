import { describe, expect, it } from "vitest";
import { disciplineCodeFromRoll, isEmail, placeholderName, validateDisplayName, validateRoll } from "@/lib/members/onboarding";

describe("disciplineCodeFromRoll", () => {
  it("takes digits 3–4 of a six-digit roll", () => {
    expect(disciplineCodeFromRoll("110201")).toBe("02");
    expect(disciplineCodeFromRoll("110101")).toBe("01");
    expect(disciplineCodeFromRoll("112407")).toBe("24");
  });
  it("gives nothing for other shapes", () => {
    for (const roll of ["", "1102", "1102011", "11A201", "abcdef"]) expect(disciplineCodeFromRoll(roll)).toBeUndefined();
  });
});

describe("validateRoll", () => {
  it("accepts normal rolls and rejects junk", () => {
    expect(validateRoll("110201")).toBeUndefined();
    expect(validateRoll("KU-2011-07")).toBeUndefined();
    expect(validateRoll("")).toMatch(/required/);
    expect(validateRoll("12")).toMatch(/3–20/);
    expect(validateRoll("1102 01")).toMatch(/3–20/);
    expect(validateRoll("x".repeat(21))).toMatch(/3–20/);
    expect(validateRoll("1';drop")).toMatch(/3–20/);
  });
});

describe("placeholderName", () => {
  it("builds a readable stand-in from the email's local part", () => {
    expect(placeholderName("a.b.m.rahman@gmail.com")).toBe("A B M Rahman");
    expect(placeholderName("zahid110101@gmail.com")).toBe("Zahid");
    expect(placeholderName("JANE_DOE@x.test")).toBe("Jane Doe");
  });
  it("falls back when there are no letters", () => {
    expect(placeholderName("110101@x.test")).toBe("New member");
  });
});

describe("validateDisplayName", () => {
  it("normalizes whitespace and enforces length", () => {
    expect(validateDisplayName("  Md.   Zahidur  Rahman ")).toEqual({ name: "Md. Zahidur Rahman" });
    expect(validateDisplayName("A")).toHaveProperty("error");
    expect(validateDisplayName("x".repeat(101))).toHaveProperty("error");
    expect(validateDisplayName("<script>")).toHaveProperty("error");
  });
});

describe("isEmail", () => {
  it("is a basic shape check", () => {
    expect(isEmail("a@b.co")).toBe(true);
    for (const bad of ["a", "a@b", "a b@c.d", "@b.c"]) expect(isEmail(bad)).toBe(false);
  });
});
