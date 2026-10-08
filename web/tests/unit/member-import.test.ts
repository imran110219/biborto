import { describe, expect, it } from "vitest";
import { parseCsv } from "@/lib/members/csv";
import { decideRows, interpretTable, type ExistingMember, type ImportOptions, type Interpreted } from "@/lib/members/import";

const lookups = {
  disciplineBy: new Map([["cse", "d-cse"], ["computer science and engineering", "d-cse"], ["arch", "d-arch"]]),
  countryBy: new Map([["bd", "c-bd"], ["bangladesh", "c-bd"]]),
};
const OPTS: ImportOptions = { updateExisting: true, newStatus: "active" };

function interpret(csv: string): Extract<Interpreted, { parsed: unknown }> {
  const result = interpretTable(parseCsv(csv), lookups);
  if ("fatal" in result) throw new Error(`unexpected fatal: ${result.fatal}`);
  return result;
}

const existing = (over: Partial<ExistingMember> = {}): ExistingMember => ({
  id: "m1", name: "Jane Doe", phoneNumber: null, studentId: null, disciplineId: null, campusName: null,
  profession: null, currentEmployer: null, city: null, countryId: null, bloodGroup: null, dateOfBirth: null,
  isPublic: true, linkedinUrl: null, facebookUrl: null, websiteUrl: null, ...over,
});

function run(csv: string, byEmail: Record<string, ExistingMember> = {}, owners: Record<string, { id: string; name: string }> = {}, options = OPTS) {
  const { parsed } = interpret(csv);
  return decideRows(parsed, new Map(Object.entries(byEmail)), new Map(Object.entries(owners)), options);
}

describe("interpretTable — header", () => {
  it("is fatal without Name and Email columns, or without rows", () => {
    expect(interpretTable(parseCsv("Name,Phone\nA,1"), lookups)).toEqual({ fatal: expect.stringContaining("Name") });
    expect(interpretTable(parseCsv("Name,Email\n"), lookups)).toEqual({ fatal: "The file has a header but no members." });
    expect(interpretTable([], lookups)).toEqual({ fatal: "The file is empty." });
  });

  it("is fatal over the row limit", () => {
    const rows = Array.from({ length: 2001 }, (_, i) => `P${i},p${i}@x.test`).join("\n");
    const result = interpretTable(parseCsv(`Name,Email\n${rows}`), lookups);
    expect("fatal" in result && result.fatal).toMatch(/Too many rows/);
  });

  it("accepts aliases, any case/punctuation, and reports ignored and unknown columns", () => {
    const { columns } = interpret("FULL NAME,E-mail,Roll No,Dept,Role,Status,Joined,Favourite colour\nA B,a@x.test,1,CSE,superadmin,active,2020,red");
    expect(columns.recognized).toEqual(["FULL NAME", "E-mail", "Roll No", "Dept"]);
    expect(columns.ignored).toEqual(["Role", "Status", "Joined"]);
    expect(columns.unknown).toEqual(["Favourite colour"]);
  });
});

describe("interpretTable — rows", () => {
  const one = (csv: string) => interpret(csv).parsed[0];

  it("parses a full valid row", () => {
    const row = one(
      "Name,Email,Phone,Student ID,Discipline,City,Country,Blood group,Date of birth,Public profile,Website\n" +
        "Jane Doe,JANE@Example.test,0171,110201,cse,Dhaka,Bangladesh,o +,15/03/1990,No,https://example.org",
    );
    expect(row.error).toBeUndefined();
    expect(row.values).toEqual({
      name: "Jane Doe", email: "jane@example.test", phoneNumber: "0171", studentId: "110201", disciplineId: "d-cse",
      city: "Dhaka", countryId: "c-bd", bloodGroup: "O+", dateOfBirth: "1990-03-15", isPublic: false, websiteUrl: "https://example.org",
    });
  });

  it("matches a discipline by full name too", () => {
    expect(one("Name,Email,Discipline\nA,a@x.test,Computer Science and Engineering").values?.disciplineId).toBe("d-cse");
  });

  it.each([
    ["Name,Email\n,a@x.test", /Name is missing/],
    ["Name,Email\nA,", /Email is missing/],
    ["Name,Email\nA,not-an-email", /not a valid email/],
    ["Name,Email,Discipline\nA,a@x.test,ZZZ", /Unknown discipline/],
    ["Name,Email,Country\nA,a@x.test,Narnia", /Unknown country/],
    ["Name,Email,Blood group\nA,a@x.test,Z+", /blood group/],
    ["Name,Email,Date of birth\nA,a@x.test,31/02/2000", /date of birth/],
    ["Name,Email,Date of birth\nA,a@x.test,2999-01-01", /date of birth/],
    ["Name,Email,Public profile\nA,a@x.test,maybe", /Yes or No/],
    ["Name,Email,Website\nA,a@x.test,javascript:alert(1)", /http/],
    ["Name,Email,LinkedIn\nA,a@x.test,ftp://x.test", /http/],
  ])("rejects a bad row: %s", (csv, message) => {
    expect(one(csv).error).toMatch(message);
  });

  it("rejects over-long values", () => {
    expect(one(`Name,Email\n${"x".repeat(201)},a@x.test`).error).toMatch(/too long/);
  });

  it("accepts ISO dates and day-first dates", () => {
    expect(one("Name,Email,DOB\nA,a@x.test,1990-03-15").values?.dateOfBirth).toBe("1990-03-15");
    expect(one("Name,Email,DOB\nA,a@x.test,5-3-1990").values?.dateOfBirth).toBe("1990-03-05");
  });

  it("undoes the exporter's formula-protection apostrophe, only before formula characters", () => {
    expect(one("Name,Email,City\nA,a@x.test,'=1+1").values?.city).toBe("=1+1");
    expect(one("Name,Email,City\nA,a@x.test,'Dhaka").values?.city).toBe("'Dhaka");
  });

  it("never reads Role or Status", () => {
    const row = one("Name,Email,Role,Status\nA,a@x.test,superadmin,suspended");
    expect(row.values).toEqual({ name: "A", email: "a@x.test" });
  });
});

describe("decideRows", () => {
  it("creates unknown emails with only the provided values", () => {
    const { rows, items, counts } = run("Name,Email\nNew Person,new@x.test");
    expect(rows[0].action).toBe("create");
    expect(items[0]).toEqual({ kind: "create", values: { name: "New Person", email: "new@x.test" } });
    expect(counts).toEqual({ create: 1, update: 0, unchanged: 0, error: 0 });
  });

  it("matches existing members by lower-cased email and updates only changed fields", () => {
    const { rows, items } = run("Name,Email,City,Phone\nJane Doe,JANE@x.test,Dhaka,0171", {
      "jane@x.test": existing({ phoneNumber: "0171" }),
    });
    expect(rows[0]).toMatchObject({ action: "update", changes: ["city"] });
    expect(items[0]).toEqual({ kind: "update", id: "m1", set: { city: "Dhaka" } });
  });

  it("never erases data with a blank cell", () => {
    const { rows, items } = run("Name,Email,City\nJane Doe,jane@x.test,", { "jane@x.test": existing({ city: "Khulna" }) });
    expect(rows[0].action).toBe("unchanged");
    expect(items[0]).toBeNull();
  });

  it("leaves existing members alone when updating is off", () => {
    const { rows } = run("Name,Email,City\nJane Doe,jane@x.test,Dhaka", { "jane@x.test": existing() }, {}, { ...OPTS, updateExisting: false });
    expect(rows[0].action).toBe("unchanged");
  });

  it("skips a repeated email, keeping the first row", () => {
    const { rows } = run("Name,Email\nA,a@x.test\nB,A@X.test");
    expect(rows.map((r) => r.action)).toEqual(["create", "error"]);
    expect(rows[1].error).toMatch(/earlier in the file/);
  });

  it("rejects a roll that belongs to someone else, or repeats in the file", () => {
    const owners = { "110201": { id: "other", name: "Omar" } };
    const { rows } = run("Name,Email,Roll\nA,a@x.test,110201\nB,b@x.test,110300\nC,c@x.test,110300", {}, owners);
    expect(rows.map((r) => r.action)).toEqual(["error", "create", "error"]);
    expect(rows[0].error).toMatch(/already belongs to Omar/);
    expect(rows[2].error).toMatch(/earlier in the file/);
  });

  it("lets a member keep their own roll", () => {
    const { rows } = run("Name,Email,Roll,City\nJane Doe,jane@x.test,110201,Dhaka", { "jane@x.test": existing({ studentId: "110201" }) }, { "110201": { id: "m1", name: "Jane Doe" } });
    expect(rows[0]).toMatchObject({ action: "update", changes: ["city"] });
  });

  it("keeps row numbers aligned with the file (header is line 1) and reports bad rows without blocking others", () => {
    const { rows } = run("Name,Email\nA,a@x.test\n,missing-name@x.test\nC,c@x.test");
    expect(rows.map((r) => [r.line, r.action])).toEqual([[2, "create"], [3, "error"], [4, "create"]]);
  });
});
