import { inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { countries, disciplines, members } from "@/drizzle/schema";
import { parseCsv } from "@/lib/members/csv";
import { BLOOD_GROUPS, slugify, type BloodGroup } from "@/lib/members/form";

// Member CSV import: analyze() turns a file into a plan (what would be created / updated /
// skipped, with per-row reasons) without touching the database; apply() runs the same plan.
// The file is always re-analyzed on the server — the preview the admin saw is never trusted.

export const MAX_IMPORT_BYTES = 1_000_000;
export const MAX_IMPORT_ROWS = 2000;

export type ImportStatus = "active" | "pending";
export interface ImportOptions {
  updateExisting: boolean; // fill in blank/changed fields of members whose email already exists
  newStatus: ImportStatus; // status for newly created members
}

type Field =
  | "name" | "email" | "phoneNumber" | "studentId" | "discipline" | "campusName" | "profession"
  | "currentEmployer" | "city" | "country" | "bloodGroup" | "dateOfBirth" | "isPublic"
  | "linkedinUrl" | "facebookUrl" | "websiteUrl";

const LABELS: Record<Field, string> = {
  name: "name", email: "email", phoneNumber: "phone", studentId: "student ID", discipline: "discipline",
  campusName: "campus name", profession: "profession", currentEmployer: "employer", city: "city", country: "country",
  bloodGroup: "blood group", dateOfBirth: "date of birth", isPublic: "public profile",
  linkedinUrl: "LinkedIn", facebookUrl: "Facebook", websiteUrl: "website",
};

// Header → field. Headers are compared lowercased with everything but letters/digits removed,
// so "Student ID", "student_id" and "STUDENT-ID" are the same column.
const ALIASES: Record<string, Field> = {
  name: "name", fullname: "name",
  email: "email", emailaddress: "email",
  phone: "phoneNumber", phonenumber: "phoneNumber", mobile: "phoneNumber",
  studentid: "studentId", roll: "studentId", rollno: "studentId", rollnumber: "studentId",
  discipline: "discipline", department: "discipline", dept: "discipline",
  campusname: "campusName",
  profession: "profession", occupation: "profession", jobtitle: "profession",
  currentemployer: "currentEmployer", employer: "currentEmployer", company: "currentEmployer", organization: "currentEmployer",
  city: "city", currentcity: "city",
  country: "country",
  bloodgroup: "bloodGroup",
  dateofbirth: "dateOfBirth", dob: "dateOfBirth", birthdate: "dateOfBirth",
  publicprofile: "isPublic", ispublic: "isPublic", public: "isPublic",
  linkedin: "linkedinUrl", linkedinurl: "linkedinUrl",
  facebook: "facebookUrl", facebookurl: "facebookUrl",
  website: "websiteUrl", websiteurl: "websiteUrl",
};
// Columns the export contains that an import deliberately never reads: access level is
// never granted from a spreadsheet, and the other two are system-managed.
const IGNORED = new Set(["role", "platformrole", "status", "joined", "joinedat"]);

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CAPS: Partial<Record<Field, number>> = {
  name: 200, phoneNumber: 40, studentId: 40, campusName: 200, profession: 200, currentEmployer: 200, city: 200,
  linkedinUrl: 300, facebookUrl: 300, websiteUrl: 300,
};
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export type RowAction = "create" | "update" | "unchanged" | "error";
export interface RowResult {
  line: number; // 1-based line in the file (the header is line 1)
  name: string;
  email: string;
  action: RowAction;
  changes?: string[]; // update: which fields would change
  error?: string;
}

export interface ImportAnalysis {
  fatal?: string;
  columns: { recognized: string[]; ignored: string[]; unknown: string[] };
  rows: RowResult[];
  counts: Record<RowAction, number>;
}

export type Values = Partial<{
  name: string; email: string; phoneNumber: string; studentId: string; disciplineId: string; campusName: string;
  profession: string; currentEmployer: string; city: string; countryId: string; bloodGroup: BloodGroup;
  dateOfBirth: string; isPublic: boolean; linkedinUrl: string; facebookUrl: string; websiteUrl: string;
}>;
export type PlanItem = { kind: "create"; values: Values & { name: string; email: string } } | { kind: "update"; id: string; set: Values };

const emptyCounts = (): Record<RowAction, number> => ({ create: 0, update: 0, unchanged: 0, error: 0 });
const fatal = (message: string): ImportAnalysis => ({ fatal: message, columns: { recognized: [], ignored: [], unknown: [] }, rows: [], counts: emptyCounts() });

function parseDate(value: string): string | undefined {
  let iso = value;
  const dmy = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(value); // day first, as used in Bangladesh
  if (dmy) iso = `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return undefined;
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== iso || d > new Date()) return undefined;
  return iso;
}

function parseBool(value: string): boolean | undefined {
  const v = value.toLowerCase();
  if (["yes", "y", "true", "1", "public"].includes(v)) return true;
  if (["no", "n", "false", "0", "private", "hidden"].includes(v)) return false;
  return undefined;
}

function isHttpUrl(value: string) {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

export interface Lookups {
  disciplineBy: Map<string, string>; // lowercase short code / code / full name → discipline id
  countryBy: Map<string, string>; // lowercase ISO code / name → country id
}

export type ParsedRow = { line: number; values?: Values; name: string; email: string; error?: string };
export type Interpreted =
  | { fatal: string }
  | { columns: ImportAnalysis["columns"]; parsed: ParsedRow[] };

// Pure: reads the header, validates every row and turns cells into typed values. No database.
export function interpretTable(table: string[][], { disciplineBy, countryBy }: Lookups): Interpreted {
  if (table.length === 0) return { fatal: "The file is empty." };

  const header = table[0];
  const fieldAt = new Map<number, Field>();
  const recognized: string[] = [], ignored: string[] = [], unknown: string[] = [];
  header.forEach((h, i) => {
    const key = norm(h);
    if (!key) return;
    const field = ALIASES[key];
    if (field && ![...fieldAt.values()].includes(field)) {
      fieldAt.set(i, field);
      recognized.push(h.trim());
    } else if (IGNORED.has(key)) ignored.push(h.trim());
    else unknown.push(h.trim());
  });
  const have = new Set(fieldAt.values());
  if (!have.has("name") || !have.has("email")) {
    return { fatal: "The first row must be a header with at least “Name” and “Email” columns." };
  }
  const dataRows = table.slice(1);
  if (dataRows.length === 0) return { fatal: "The file has a header but no members." };
  if (dataRows.length > MAX_IMPORT_ROWS) return { fatal: `Too many rows (${dataRows.length}). Split the file into batches of ${MAX_IMPORT_ROWS} or fewer.` };

  // Parse every row first so one query can load all the members the file refers to.
  const parsed: ParsedRow[] = dataRows.map((cells, idx) => {
    const line = idx + 2;
    const raw: Partial<Record<Field, string>> = {};
    for (const [col, field] of fieldAt) {
      // Our own export prefixes risky cells with ' (formula protection) — undo that.
      const v = (cells[col] ?? "").trim().replace(/^'(?=[=+\-@])/, "");
      if (v) raw[field] = v;
      else delete raw[field];
    }
    const name = raw.name ?? "";
    const email = (raw.email ?? "").toLowerCase();
    const fail = (error: string): ParsedRow => ({ line, name, email, error });

    if (!name) return fail("Name is missing.");
    if (!email) return fail("Email is missing.");
    if (!EMAIL.test(email)) return fail(`“${raw.email}” is not a valid email address.`);
    for (const [field, max] of Object.entries(CAPS) as [Field, number][]) {
      if ((raw[field]?.length ?? 0) > max) return fail(`${LABELS[field]} is too long (${max} characters max).`);
    }

    const values: Values = { name, email };
    for (const f of ["phoneNumber", "studentId", "campusName", "profession", "currentEmployer", "city"] as const) {
      if (raw[f]) values[f] = raw[f];
    }
    for (const f of ["linkedinUrl", "facebookUrl", "websiteUrl"] as const) {
      if (raw[f]) {
        if (!isHttpUrl(raw[f]!)) return fail(`${LABELS[f]} must start with http:// or https://.`);
        values[f] = raw[f];
      }
    }
    if (raw.discipline) {
      const id = disciplineBy.get(raw.discipline.toLowerCase());
      if (!id) return fail(`Unknown discipline “${raw.discipline}”. Use the department code (e.g. CSE) or its full name.`);
      values.disciplineId = id;
    }
    if (raw.country) {
      const id = countryBy.get(raw.country.toLowerCase());
      if (!id) return fail(`Unknown country “${raw.country}”.`);
      values.countryId = id;
    }
    if (raw.bloodGroup) {
      const bg = raw.bloodGroup.toUpperCase().replace(/\s+/g, "");
      if (!BLOOD_GROUPS.includes(bg as BloodGroup)) return fail(`“${raw.bloodGroup}” is not a valid blood group.`);
      values.bloodGroup = bg as BloodGroup;
    }
    if (raw.dateOfBirth) {
      const d = parseDate(raw.dateOfBirth);
      if (!d) return fail(`“${raw.dateOfBirth}” is not a valid date of birth (use YYYY-MM-DD or DD/MM/YYYY).`);
      values.dateOfBirth = d;
    }
    if (raw.isPublic) {
      const b = parseBool(raw.isPublic);
      if (b === undefined) return fail(`“${raw.isPublic}” isn't Yes or No for the public-profile column.`);
      values.isPublic = b;
    }
    return { line, name, email, values };
  });
  return { columns: { recognized, ignored, unknown }, parsed };
}

export interface ExistingMember {
  id: string;
  name: string;
  phoneNumber: string | null;
  studentId: string | null;
  disciplineId: string | null;
  campusName: string | null;
  profession: string | null;
  currentEmployer: string | null;
  city: string | null;
  countryId: string | null;
  bloodGroup: string | null;
  dateOfBirth: string | null;
  isPublic: boolean;
  linkedinUrl: string | null;
  facebookUrl: string | null;
  websiteUrl: string | null;
}

// Pure: decides what happens to each parsed row given who already exists (matched by lower-cased
// email) and who already owns each roll. No database.
export function decideRows(
  parsed: ParsedRow[],
  byEmail: Map<string, ExistingMember>,
  ownerOfRoll: Map<string, { id: string; name: string }>,
  options: ImportOptions,
): { rows: RowResult[]; items: (PlanItem | null)[]; counts: Record<RowAction, number> } {
  const seenRolls = new Set<string>();
  const seen = new Set<string>();
  const rows: RowResult[] = [];
  const items: (PlanItem | null)[] = [];
  for (const p of parsed) {
    const base = { line: p.line, name: p.name, email: p.email };
    const push = (r: Omit<RowResult, "line" | "name" | "email">, item: PlanItem | null) => {
      rows.push({ ...base, ...r });
      items.push(item);
    };
    if (p.error || !p.values) {
      push({ action: "error", error: p.error }, null);
      continue;
    }
    if (seen.has(p.email)) {
      push({ action: "error", error: "This email appears earlier in the file; only the first row is used." }, null);
      continue;
    }
    seen.add(p.email);

    const current = byEmail.get(p.email);
    const roll = p.values.studentId;
    if (roll) {
      const owner = ownerOfRoll.get(roll);
      if (seenRolls.has(roll)) {
        push({ action: "error", error: `Student ID ${roll} appears earlier in the file.` }, null);
        continue;
      }
      if (owner && owner.id !== current?.id) {
        push({ action: "error", error: `Student ID ${roll} already belongs to ${owner.name}.` }, null);
        continue;
      }
      seenRolls.add(roll);
    }
    if (!current) {
      push({ action: "create" }, { kind: "create", values: p.values as Values & { name: string; email: string } });
      continue;
    }
    if (!options.updateExisting) {
      push({ action: "unchanged", changes: [] }, null);
      continue;
    }
    // Only fill or change what the file provides; a blank cell never erases existing data.
    const set: Values = {};
    const changes: string[] = [];
    const diff = (key: keyof Values, label: string, now: unknown) => {
      const next = p.values![key];
      if (next !== undefined && next !== now) {
        (set as Record<string, unknown>)[key] = next;
        changes.push(label);
      }
    };
    diff("name", "name", current.name);
    diff("phoneNumber", "phone", current.phoneNumber);
    diff("studentId", "student ID", current.studentId);
    diff("disciplineId", "discipline", current.disciplineId);
    diff("campusName", "campus name", current.campusName);
    diff("profession", "profession", current.profession);
    diff("currentEmployer", "employer", current.currentEmployer);
    diff("city", "city", current.city);
    diff("countryId", "country", current.countryId);
    diff("bloodGroup", "blood group", current.bloodGroup);
    diff("dateOfBirth", "date of birth", current.dateOfBirth);
    diff("isPublic", "public profile", current.isPublic);
    diff("linkedinUrl", "LinkedIn", current.linkedinUrl);
    diff("facebookUrl", "Facebook", current.facebookUrl);
    diff("websiteUrl", "website", current.websiteUrl);
    if (changes.length === 0) push({ action: "unchanged", changes }, null);
    else push({ action: "update", changes }, { kind: "update", id: current.id, set });
  }

  const counts = emptyCounts();
  for (const r of rows) counts[r.action]++;
  return { rows, items, counts };
}

async function plan(csvText: string, options: ImportOptions): Promise<{ analysis: ImportAnalysis; items: (PlanItem | null)[] }> {
  const table = parseCsv(csvText);

  const [disciplineRows, countryRows] = await Promise.all([
    db.select({ id: disciplines.id, code: disciplines.code, shortCode: disciplines.shortCode, name: disciplines.name }).from(disciplines),
    db.select({ id: countries.id, isoCode: countries.isoCode, name: countries.name }).from(countries),
  ]);
  const disciplineBy = new Map<string, string>();
  for (const d of disciplineRows) for (const k of [d.shortCode, d.code, d.name]) disciplineBy.set(k.toLowerCase().trim(), d.id);
  const countryBy = new Map<string, string>();
  for (const c of countryRows) for (const k of [c.isoCode, c.name]) countryBy.set(k.toLowerCase().trim(), c.id);

  const interpreted = interpretTable(table, { disciplineBy, countryBy });
  if ("fatal" in interpreted) return { analysis: fatal(interpreted.fatal), items: [] };
  const { columns, parsed } = interpreted;

  const emails = [...new Set(parsed.filter((p) => p.values).map((p) => p.email))];
  const existing = emails.length ? await db.select().from(members).where(inArray(sql`lower(${members.email})`, emails)) : [];
  const byEmail = new Map(existing.map((m) => [m.email.toLowerCase(), m]));

  // Roll (student ID) is unique per member and doubles as a profile URL, so a roll that
  // already belongs to someone else — in the database or earlier in this file — is an error.
  const rolls = [...new Set(parsed.flatMap((p) => (p.values?.studentId ? [p.values.studentId] : [])))];
  const rollOwners = rolls.length
    ? await db.select({ id: members.id, name: members.name, studentId: members.studentId }).from(members).where(inArray(members.studentId, rolls))
    : [];
  const ownerOfRoll = new Map(rollOwners.map((r) => [r.studentId!, { id: r.id, name: r.name }]));

  const { rows, items, counts } = decideRows(parsed, byEmail, ownerOfRoll, options);
  return { analysis: { columns, rows, counts }, items };
}

export async function analyzeImport(csvText: string, options: ImportOptions): Promise<ImportAnalysis> {
  return (await plan(csvText, options)).analysis;
}

// A problem with the file itself (safe to show the admin), as opposed to a database failure.
export class ImportFileError extends Error {}

export interface ImportResult {
  created: number;
  updated: number;
  unchanged: number;
  skipped: number;
}

export async function applyImport(csvText: string, options: ImportOptions, actorId: string): Promise<ImportResult> {
  const { analysis, items } = await plan(csvText, options);
  if (analysis.fatal) throw new ImportFileError(analysis.fatal);

  const now = new Date().toISOString();
  return db.transaction(async (tx) => {
    const taken = new Set((await tx.select({ slug: members.slug }).from(members)).map((r) => r.slug));
    let created = 0, updated = 0;
    for (const item of items) {
      if (!item) continue;
      if (item.kind === "create") {
        const base = slugify(item.values.name);
        let slug = base;
        for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
        taken.add(slug);
        await tx.insert(members).values({
          ...item.values,
          slug,
          platformRole: "member", // access is never granted from a spreadsheet
          status: options.newStatus,
          ...(options.newStatus === "active" ? { reviewedBy: actorId, reviewedAt: now } : {}),
        });
        created++;
      } else {
        await tx.update(members).set(item.set).where(sql`${members.id} = ${item.id}`);
        updated++;
      }
    }
    return { created, updated, unchanged: analysis.counts.unchanged, skipped: analysis.counts.error };
  });
}
