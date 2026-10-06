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


// Profile fields shared by the admin forms and the member's own account form:
// everything a member can describe about themselves, validated identically.
export interface ProfileFieldValues {
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
  bloodGroup: BloodGroup | null;
  dateOfBirth: string | null;
  isPublic: boolean;
}

function parseProfileFields(formData: FormData): { error: string } | { values: ProfileFieldValues } {
  const text = (key: string) => String(formData.get(key) ?? "").trim();
  const opt = (key: string) => text(key) || null;

  const linkedinUrl = text("linkedinUrl");
  const facebookUrl = text("facebookUrl");
  const websiteUrl = text("websiteUrl");
  const bloodGroup = text("bloodGroup");
  const dateOfBirth = text("dateOfBirth");

  // Length caps keep public profile content sane (the admin form shares them).
  const caps: [string, string, number][] = [
    ["Short bio", "shortBio", 500], ["Bio", "bio", 5000], ["Campus name", "campusName", 200],
    ["Favorite campus place", "favoriteCampusPlace", 200], ["Most memorable event", "mostMemorableEvent", 500],
    ["Profession", "profession", 200], ["Current employer", "currentEmployer", 200], ["City", "city", 200],
    ["Phone number", "phoneNumber", 40],
  ];
  for (const [label, key, max] of caps) {
    if (text(key).length > max) return { error: `${label} is too long (${max} characters max).` };
  }
  for (const [label, url] of [["LinkedIn", linkedinUrl], ["Facebook", facebookUrl], ["Website", websiteUrl]]) {
    if (url && (url.length > 300 || !isHttpUrl(url))) return { error: `${label} URL must start with http:// or https://.` };
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
      bloodGroup: (bloodGroup as BloodGroup) || null,
      dateOfBirth: dateOfBirth || null,
      isPublic: formData.get("isPublic") === "on",
    },
  };
}

// A member editing their own profile. Identity and access fields — name,
// discipline, email, student ID, role, status — are deliberately not parsed
// here, so a crafted request can't change them.
export function parseSelfProfileForm(formData: FormData) {
  return parseProfileFields(formData);
}

export interface MemberFormValues extends ProfileFieldValues {
  name: string;
  email: string;
  disciplineId: string | null;
  studentId: string | null;
  platformRole: PlatformRole;
  status: MemberStatus;
  returnTo: string;
}

export function parseMemberForm(
  formData: FormData,
  { requireEmail }: { requireEmail: boolean },
): { error: string } | { values: MemberFormValues } {
  const text = (key: string) => String(formData.get(key) ?? "").trim();

  const name = text("name");
  const email = text("email").toLowerCase();
  const requestedRole = text("platformRole");
  const requestedStatus = text("status");

  if (!name) return { error: "Name is required." };
  if (requireEmail) {
    if (!email) return { error: "Email is required." };
    if (!EMAIL.test(email)) return { error: "Enter a valid email address." };
  }
  if (!PLATFORM_ROLES.includes(requestedRole as PlatformRole)) return { error: "Choose a valid role." };
  if (!MEMBER_STATUSES.includes(requestedStatus as MemberStatus)) return { error: "Choose a valid status." };

  const profile = parseProfileFields(formData);
  if ("error" in profile) return profile;

  return {
    values: {
      ...profile.values,
      name,
      email,
      disciplineId: text("disciplineId") || null,
      studentId: text("studentId") || null,
      platformRole: requestedRole as PlatformRole,
      status: requestedStatus as MemberStatus,
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
