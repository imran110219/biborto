"use client";

import { useActionState } from "react";
import { PostEditorShell } from "@/components/blog/PostEditorShell";
import { PostSettingsFields } from "@/components/blog/PostSettingsFields";
import { retainedFormSubmit } from "@/lib/use-retained-form";
import { submitPost } from "./actions";

// Member submit form. Same shell as the admin post editor; a member gets the
// essentials only — category and tags — and one action: submit for review.
export function BlogSubmitForm({ imageBase }: { imageBase?: string }) {
  const [error, formAction, pending] = useActionState(submitPost, undefined);

  return (
    <form onSubmit={retainedFormSubmit(formAction)}>
      <PostEditorShell
        stickyTop={84} // the public site header is 84px tall and sticks to the top
        content={{ imageBase }}
        settings={<PostSettingsFields variant="member" />}
        error={error}
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
