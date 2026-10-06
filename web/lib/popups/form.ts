import { parseWebsite } from "@/lib/url";
import type { PopupKind } from "@/lib/types";

// Plain module (a "use server" file may only export async functions).

export const MAX_HTML_LENGTH = 50_000;
export const MIN_HEIGHT = 160;
export const MAX_HEIGHT = 900;
export const DEFAULT_HEIGHT = 420;

export interface PopupFormValues {
  title: string;
  kind: PopupKind;
  htmlContent: string | null;
  altText: string | null;
  linkUrl: string | null;
  heightPx: number;
  active: boolean;
}

export function parsePopupForm(formData: FormData): { error: string } | { values: PopupFormValues } {
  const text = (key: string) => String(formData.get(key) ?? "").trim();

  const title = text("title");
  const kind = text("kind");
  const html = String(formData.get("htmlContent") ?? ""); // not trimmed: whitespace can matter in markup
  const altText = text("altText");
  const height = Number.parseInt(text("heightPx") || String(DEFAULT_HEIGHT), 10);

  if (!title) return { error: "Give the popup a title (only admins see it)." };
  if (title.length > 100) return { error: "Title is too long (100 characters max)." };
  if (kind !== "html" && kind !== "image") return { error: "Choose a popup type." };
  if (!Number.isFinite(height) || height < MIN_HEIGHT || height > MAX_HEIGHT) {
    return { error: `Height must be between ${MIN_HEIGHT} and ${MAX_HEIGHT} pixels.` };
  }
  if (altText.length > 200) return { error: "Alt text is too long (200 characters max)." };

  let htmlContent: string | null = null;
  let linkUrl: string | null = null;
  if (kind === "html") {
    if (!html.trim()) return { error: "Add some HTML for the popup." };
    if (html.length > MAX_HTML_LENGTH) return { error: `HTML is too long (${MAX_HTML_LENGTH.toLocaleString()} characters max).` };
    htmlContent = html;
  } else {
    const url = parseWebsite(text("linkUrl"));
    if (url === undefined) return { error: "Enter a valid link address (http or https)." };
    linkUrl = url;
  }

  return {
    values: {
      title,
      kind,
      htmlContent,
      altText: kind === "image" ? altText || null : null,
      linkUrl,
      heightPx: height,
      active: formData.get("active") === "on",
    },
  };
}
