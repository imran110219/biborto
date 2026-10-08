import { describe, expect, it } from "vitest";
import { detectDelimiter, parseCsv } from "@/lib/members/csv";

describe("parseCsv", () => {
  it("parses a simple file", () => {
    expect(parseCsv("a,b\n1,2\n")).toEqual([["a", "b"], ["1", "2"]]);
  });

  it("handles CRLF, lone CR and a missing trailing newline", () => {
    expect(parseCsv("a,b\r\n1,2")).toEqual([["a", "b"], ["1", "2"]]);
    expect(parseCsv("a,b\r1,2\r")).toEqual([["a", "b"], ["1", "2"]]);
  });

  it("handles quoted fields with commas, doubled quotes and newlines", () => {
    expect(parseCsv('n,note\n"Doe, Jane","said ""hi"""\n"two\nlines",x')).toEqual([
      ["n", "note"],
      ["Doe, Jane", 'said "hi"'],
      ["two\nlines", "x"],
    ]);
  });

  it("strips a UTF-8 BOM", () => {
    expect(parseCsv("﻿Name,Email\nA,a@x.y")[0]).toEqual(["Name", "Email"]);
  });

  it("drops blank lines but keeps empty cells", () => {
    expect(parseCsv("a,b,c\n\n1,,3\n   ,  ,\n")).toEqual([["a", "b", "c"], ["1", "", "3"]]);
  });

  it("detects semicolon and tab delimiters from the header", () => {
    expect(parseCsv("a;b\n1;2")).toEqual([["a", "b"], ["1", "2"]]);
    expect(parseCsv("a\tb\n1\t2")).toEqual([["a", "b"], ["1", "2"]]);
    expect(detectDelimiter('"a;b",c\n1,2')).toBe(","); // a ; inside quotes doesn't count
  });

  it("returns nothing for an empty file", () => {
    expect(parseCsv("")).toEqual([]);
    expect(parseCsv("\n\n")).toEqual([]);
  });
});
