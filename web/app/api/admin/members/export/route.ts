import { NextResponse } from "next/server";
import { requireSuperadmin } from "@/lib/auth/require-admin";
import { getAdminMembersForExport } from "@/lib/db/queries/members";
import { parseMemberFilters } from "@/lib/members/filters";

export const runtime = "nodejs";

// Spreadsheet apps execute cells starting with these as formulas; neutralize
// them so imported roster data can't run as an Excel/Sheets formula.
const FORMULA_START = /^[=+\-@\t\r]/;

function cell(value: string | boolean | null) {
  let text = value === null ? "" : String(value);
  if (FORMULA_START.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const COLUMNS = [
  "Name", "Email", "Phone", "Student ID", "Discipline", "Campus name", "Profession", "Current employer",
  "City", "Country", "Blood group", "Date of birth", "Role", "Status", "Public profile", "Joined",
];

// Superadmin-only: the export includes admin-only fields (phone, student ID,
// blood group, date of birth). Honors the same filters as the members list.
export async function GET(request: Request) {
  try {
    await requireSuperadmin();
  } catch {
    return NextResponse.json({ error: "Only a superadmin can export members." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const { page: _page, ...filters } = parseMemberFilters(Object.fromEntries(searchParams));
  const rows = await getAdminMembersForExport(filters);

  const lines = [COLUMNS.map(cell).join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.name, r.email, r.phoneNumber, r.studentId, r.discipline, r.campusName, r.profession, r.currentEmployer,
        r.city, r.country, r.bloodGroup, r.dateOfBirth, r.platformRole, r.status, r.isPublic ? "Yes" : "No", r.joinedAt,
      ]
        .map(cell)
        .join(","),
    );
  }

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse("﻿" + lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="members-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
