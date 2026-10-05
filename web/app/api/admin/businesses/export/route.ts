import { NextResponse } from "next/server";
import { requireSuperadmin } from "@/lib/auth/require-admin";
import { getAdminBusinessesForExport } from "@/lib/db/queries/businesses";
import { parseBusinessFilters } from "@/lib/businesses/filters";

export const runtime = "nodejs";

// Spreadsheet apps execute cells starting with these as formulas; neutralize
// them so listing data can't run as an Excel/Sheets formula.
const FORMULA_START = /^[=+\-@\t\r]/;

function cell(value: string | null) {
  let text = value ?? "";
  if (FORMULA_START.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const COLUMNS = [
  "Name", "Owner", "Owner email", "Category", "City", "Status", "Tagline", "Offerings",
  "Phone", "Email", "Website", "LinkedIn", "Facebook", "Submitted",
];

// Superadmin-only (mirrors the members export). Honors the same filters as
// the admin businesses list.
export async function GET(request: Request) {
  try {
    await requireSuperadmin();
  } catch {
    return NextResponse.json({ error: "Only a superadmin can export listings." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const { page: _page, ...filters } = parseBusinessFilters(Object.fromEntries(searchParams));
  const rows = await getAdminBusinessesForExport(filters);

  const lines = [COLUMNS.map(cell).join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.name, r.ownerName, r.ownerEmail, r.category, r.city, r.status, r.tagline, r.offerings.join("; "),
        r.phone, r.email, r.website, r.linkedinUrl, r.facebookUrl, r.submittedAt,
      ]
        .map(cell)
        .join(","),
    );
  }

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse("﻿" + lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="businesses-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
