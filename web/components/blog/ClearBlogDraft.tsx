"use client";

import { useEffect } from "react";
import { clearDraft, draftKey } from "@/lib/blog/draft";

// Rendered on the page a member lands on after a successful submission, so the
// saved browser draft doesn't come back for a post that's already been sent.
export function ClearBlogDraft({ memberId }: { memberId: string }) {
  useEffect(() => {
    clearDraft(draftKey(memberId));
  }, [memberId]);
  return null;
}
