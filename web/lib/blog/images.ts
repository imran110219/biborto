import { getR2PublicUrl } from "@/lib/r2";

// Blog images (in-body pictures and cover photos) live in R2 under
//   blog/<uploader member id>/<uuid>.<ext>
// The uploader's id in the key lets the server check that a post only references
// the author's own uploads (admins may reference any blog image).
const KEY = /^blog\/([0-9a-f-]{36})\/[0-9a-f-]{36}\.(?:jpg|png|webp|gif)$/;

export function blogImageKeyOwner(key: string): string | undefined {
  return KEY.exec(key)?.[1];
}

// Reads the form's `coverKey` field. Returns the key to store, null to clear the
// cover, or an error string. A member may only attach their own uploads.
export function resolveCoverKey(
  raw: FormDataEntryValue | null,
  { memberId, isAdmin }: { memberId: string; isAdmin: boolean },
): { key: string | null } | { error: string } {
  const value = String(raw ?? "").trim();
  if (!value) return { key: null };
  const owner = blogImageKeyOwner(value);
  if (!owner) return { error: "That cover image isn't valid. Upload it again." };
  if (!isAdmin && owner !== memberId) return { error: "You can only use cover images you uploaded." };
  return { key: value };
}

// URL prefix that body images must start with to render; anything else (external
// hosts, tracking pixels) is dropped by the renderer. Undefined when R2 isn't
// configured, in which case no body images render.
export function getBlogImageBase(): string | undefined {
  try {
    return getR2PublicUrl("blog/_").slice(0, -1);
  } catch {
    return undefined;
  }
}

export function blogImageUrl(key: string | null | undefined): string | undefined {
  if (!key) return undefined;
  try {
    return getR2PublicUrl(key);
  } catch {
    return undefined;
  }
}
