import type { MemberStatus, PlatformRole } from "@/lib/types";

// Shared by the create and update Server Actions so both enforce the same
// rules. (Plain module, not a "use server" file — those may only export
// async functions.)

export const PLATFORM_ROLES: PlatformRole[] = ["member", "admin", "superadmin"];
export const MEMBER_STATUSES: MemberStatus[] = ["pending", "active", "suspended"];
export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Only same-site admin paths — returnTo comes from a hidden form field, so
// it must not become an open redirect.
export const safeReturnTo = (value: string, fallback = "/admin/members") =>
  value.startsWith("/admin/") && !value.startsWith("//") && !value.includes("\\") ? value : fallback;

function isHttpUrl(value: string) {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

export interface MemberFormValues {
  name: string;
  email: string;
  disciplineId: string | null;
  countryId: string | null;
  campusName: string | null;
  shortBio: string | null;
  bio: string | null;
  favoriteCampusPlace: string | null;
  mostMemorableEvent: string | null;
  profession: string | null;
  currentEmployer: string | null;
  city: string | null;
  linkedinUrl: string | null;
  facebookUrl: string | null;
  websiteUrl: string | null;
  phoneNumber: string | null;
  studentId: string | null;
  bloodGroup: BloodGroup | null;
  dateOfBirth: string | null;
  platformRole: PlatformRole;
  status: MemberStatus;
  isPublic: boolean;
  returnTo: string;
}

export function parseMemberForm(
  formData: FormData,
  { requireEmail }: { requireEmail: boolean },
): { error: string } | { values: MemberFormValues } {
  const text = (key: string) => String(formData.get(key) ?? "").trim();
  const opt = (key: string) => text(key) || null;

  const name = text("name");
  const email = text("email").toLowerCase();
  const requestedRole = text("platformRole");
  const requestedStatus = text("status");
  const linkedinUrl = text("linkedinUrl");
  const facebookUrl = text("facebookUrl");
  const websiteUrl = text("websiteUrl");
  const bloodGroup = text("bloodGroup");
  const dateOfBirth = text("dateOfBirth");

  if (!name) return { error: "Name is required." };
  if (requireEmail) {
    if (!email) return { error: "Email is required." };
    if (!EMAIL.test(email)) return { error: "Enter a valid email address." };
  }
  if (!PLATFORM_ROLES.includes(requestedRole as PlatformRole)) return { error: "Choose a valid role." };
  if (!MEMBER_STATUSES.includes(requestedStatus as MemberStatus)) return { error: "Choose a valid status." };
  for (const [label, url] of [["LinkedIn", linkedinUrl], ["Facebook", facebookUrl], ["Website", websiteUrl]]) {
    if (url && !isHttpUrl(url)) return { error: `${label} URL must start with http:// or https://.` };
  }
  if (bloodGroup && !BLOOD_GROUPS.includes(bloodGroup as BloodGroup)) return { error: "Choose a valid blood group." };
  if (dateOfBirth) {
    const parsed = new Date(`${dateOfBirth}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth) || Number.isNaN(parsed.getTime()) || parsed > new Date()) {
      return { error: "Enter a valid date of birth." };
    }
  }

  return {
    values: {
      name,
      email,
      disciplineId: opt("disciplineId"),
      countryId: opt("countryId"),
      campusName: opt("campusName"),
      shortBio: opt("shortBio"),
      bio: opt("bio"),
      favoriteCampusPlace: opt("favoriteCampusPlace"),
      mostMemorableEvent: opt("mostMemorableEvent"),
      profession: opt("profession"),
      currentEmployer: opt("currentEmployer"),
      city: opt("city"),
      linkedinUrl: linkedinUrl || null,
      facebookUrl: facebookUrl || null,
      websiteUrl: websiteUrl || null,
      phoneNumber: opt("phoneNumber"),
      studentId: opt("studentId"),
      bloodGroup: (bloodGroup as BloodGroup) || null,
      dateOfBirth: dateOfBirth || null,
      platformRole: requestedRole as PlatformRole,
      status: requestedStatus as MemberStatus,
      isPublic: formData.get("isPublic") === "on",
      returnTo: text("returnTo"),
    },
  };
}

export function slugify(name: string) {
  const slug = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "member";
}
