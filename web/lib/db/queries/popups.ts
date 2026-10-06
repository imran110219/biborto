import { and, desc, eq, isNotNull, ne, or } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { popups } from "@/drizzle/schema";
import { getR2PublicUrl } from "@/lib/r2";
import type { Popup } from "@/lib/types";

function toPopup(row: typeof popups.$inferSelect): Popup {
  let imageUrl: string | undefined;
  if (row.imageKey) {
    try {
      imageUrl = getR2PublicUrl(row.imageKey);
    } catch {
      imageUrl = undefined; // R2_PUBLIC_URL not configured — treated as "no image" below
    }
  }
  return {
    id: row.id,
    title: row.title,
    kind: row.kind,
    htmlContent: row.htmlContent ?? "",
    imageUrl,
    altText: row.altText ?? "",
    linkUrl: row.linkUrl ?? "",
    heightPx: row.heightPx,
    active: row.active,
  };
}

// The popup the home page should show, or undefined when none is active (or the active one has nothing to render —
// e.g. an image popup with no uploaded image yet).
export async function getActivePopup(): Promise<Popup | undefined> {
  const [row] = await db
    .select()
    .from(popups)
    .where(
      and(
        eq(popups.active, true),
        or(
          and(eq(popups.kind, "html"), isNotNull(popups.htmlContent), ne(popups.htmlContent, "")),
          and(eq(popups.kind, "image"), isNotNull(popups.imageKey)),
        ),
      ),
    )
    .orderBy(desc(popups.updatedAt))
    .limit(1);
  if (!row) return undefined;

  const popup = toPopup(row);
  return popup.kind === "image" && !popup.imageUrl ? undefined : popup;
}

export async function getAdminPopups(): Promise<Popup[]> {
  const rows = await db.select().from(popups).orderBy(desc(popups.active), desc(popups.updatedAt));
  return rows.map(toPopup);
}

export async function getAdminPopupById(id: string): Promise<Popup | undefined> {
  const [row] = await db.select().from(popups).where(eq(popups.id, id)).limit(1);
  return row ? toPopup(row) : undefined;
}
