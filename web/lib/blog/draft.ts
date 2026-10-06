// Browser-side draft auto-save for the member blog form. Drafts live in this
// browser's localStorage only (never sent to the server until the member submits)
// under a key that includes the member's id, so two people sharing a computer never
// see each other's work. Every storage call is wrapped: private mode, blocked
// storage or a full quota just means "no draft", never a broken form.

export type BlogDraft = {
  title: string;
  body: string;
  coverKey: string;
  category: string;
  tags: string;
  savedAt: number;
};

const PREFIX = "blog-draft:v1:";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // a draft untouched for 30 days is dropped

export const draftKey = (memberId: string) => `${PREFIX}${memberId}`;

export function isEmptyDraft(d: Pick<BlogDraft, "title" | "body" | "coverKey" | "tags">): boolean {
  return !d.title.trim() && !d.body.trim() && !d.coverKey && !d.tags.trim();
}

export function readDraft(key: string): BlogDraft | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const d = JSON.parse(raw) as Partial<BlogDraft>;
    if (typeof d !== "object" || d === null || typeof d.savedAt !== "number") return null;
    if (Date.now() - d.savedAt > MAX_AGE_MS) {
      window.localStorage.removeItem(key);
      return null;
    }
    const draft: BlogDraft = {
      title: typeof d.title === "string" ? d.title : "",
      body: typeof d.body === "string" ? d.body : "",
      coverKey: typeof d.coverKey === "string" ? d.coverKey : "",
      category: typeof d.category === "string" ? d.category : "",
      tags: typeof d.tags === "string" ? d.tags : "",
      savedAt: d.savedAt,
    };
    return isEmptyDraft(draft) ? null : draft;
  } catch {
    return null; // corrupt JSON or storage unavailable
  }
}

export function writeDraft(key: string, draft: BlogDraft): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(draft));
    return true;
  } catch {
    return false; // quota exceeded / storage blocked
  }
}

export function clearDraft(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* nothing to clear */
  }
}

// On sign-out: remove every blog draft in this browser, whoever's it was.
export function clearAllDrafts(): void {
  try {
    for (let i = window.localStorage.length - 1; i >= 0; i--) {
      const k = window.localStorage.key(i);
      if (k?.startsWith(PREFIX)) window.localStorage.removeItem(k);
    }
  } catch {
    /* nothing to clear */
  }
}
