"use client";

import { useActionState, useEffect, useState } from "react";
import { DraftAutosave } from "@/components/blog/DraftAutosave";
import { PostEditorShell } from "@/components/blog/PostEditorShell";
import { PostSettingsFields } from "@/components/blog/PostSettingsFields";
import { clearDraft, draftKey, readDraft, type BlogDraft } from "@/lib/blog/draft";
import { retainedFormSubmit } from "@/lib/use-retained-form";
import { submitPost } from "./actions";

const timeLabel = (at: number) => new Date(at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

// Member submit form. Same shell as the admin post editor; a member gets the
// essentials only — category and tags — and one action: submit for review. What
// they write is also auto-saved to this browser (see lib/blog/draft.ts), so a
// refresh, a crash or a closed tab doesn't lose a long post.
export function BlogSubmitForm({ imageBase, memberId }: { imageBase?: string; memberId: string }) {
  const [error, formAction, pending] = useActionState(submitPost, undefined);
  const storageKey = draftKey(memberId);

  // undefined = still reading localStorage (it only exists in the browser), null = no draft.
  const [draft, setDraft] = useState<BlogDraft | null | undefined>(undefined);
  const [generation, setGeneration] = useState(0); // bumping it remounts the form blank
  const [savedAt, setSavedAt] = useState<number>();

  useEffect(() => {
    // Reads a browser-only API after mount, so an effect is the right place for it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(readDraft(storageKey));
  }, [storageKey]);

  if (draft === undefined) {
    return <div className="mx-auto h-[420px] w-full max-w-[1104px] animate-pulse rounded-2xl bg-black/5" aria-label="Loading editor" />;
  }

  // The cover's public URL is the image base (…/blog/) up to the bucket root plus its key.
  const coverUrl = draft?.coverKey && imageBase ? `${imageBase.slice(0, -"blog/".length)}${draft.coverKey}` : undefined;

  return (
    <form key={generation} onSubmit={retainedFormSubmit(formAction)}>
      <DraftAutosave storageKey={storageKey} onSaved={setSavedAt} />

      {draft && generation === 0 && (
        <div role="status" className="mx-auto mb-5 flex w-full max-w-[1104px] flex-wrap items-center justify-between gap-3 rounded-xl bg-brand-green-tint px-4 py-3 text-sm text-brand-green">
          <span>
            <strong>Draft restored</strong> — we found what you were writing, saved in this browser at {timeLabel(draft.savedAt)}.
          </span>
          <button
            type="button"
            onClick={() => {
              clearDraft(storageKey);
              setDraft(null);
              setSavedAt(undefined);
              setGeneration((g) => g + 1);
            }}
            className="font-semibold underline"
          >
            Start over
          </button>
        </div>
      )}

      <PostEditorShell
        stickyTop={84} // the public site header is 84px tall and sticks to the top
        content={{
          imageBase,
          initialTitle: draft?.title,
          initialBody: draft?.body,
          initialCoverKey: draft?.coverKey,
          initialCoverUrl: coverUrl,
        }}
        settings={
          <PostSettingsFields
            variant="member"
            post={draft ? { category: draft.category, tags: draft.tags.split(",").map((t) => t.trim()).filter(Boolean) } : undefined}
          />
        }
        error={error}
        footnote={
          <p className="text-center text-xs text-text-secondary">
            {savedAt ? `Draft auto-saved in this browser · ${timeLabel(savedAt)}` : "Your draft is auto-saved in this browser as you write."}
          </p>
        }
        actions={
          <>
            <button
              type="submit"
              disabled={pending}
              className="h-11 w-full rounded-full border border-brand-green bg-brand-green text-sm font-semibold text-white transition-colors hover:bg-brand-green-dark disabled:opacity-60"
            >
              {pending ? "Submitting…" : "Submit for review"}
            </button>
            <p className="hidden text-center text-xs text-text-secondary lg:block">
              The committee reviews every post before it goes live.
            </p>
          </>
        }
      />
    </form>
  );
}
