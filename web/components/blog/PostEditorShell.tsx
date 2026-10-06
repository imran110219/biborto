"use client";

import type { CSSProperties, ReactNode } from "react";
import { PostContentFields } from "./PostContentFields";

// The one layout both blog editors use — the admin post editor and the member
// submit form — so writing a post looks and behaves the same everywhere:
//   • desktop: a reading-width writing column on the left; on the right a rail
//     that stays in view with the post's settings and the main actions;
//   • phone: a single column, with the actions pinned in a bar at the bottom.
// What differs is only *what's passed in*: members get fewer settings and a
// single "Submit for review" action; admins get status, visibility, byline,
// feature flag and Save draft / Publish.
export function PostEditorShell({
  content,
  settings,
  settingsTitle = "Post settings",
  status,
  actions,
  error,
  footnote,
  stickyTop = 0,
}: {
  content: React.ComponentProps<typeof PostContentFields>;
  settings: ReactNode;
  settingsTitle?: string;
  status?: ReactNode;
  actions: ReactNode;
  error?: string;
  // Small status line under the actions (e.g. "Draft saved in this browser").
  footnote?: ReactNode;
  // Height of any fixed/sticky site header above the page (px), so the editor's
  // sticky toolbar and the rail sit just beneath it.
  stickyTop?: number;
}) {
  return (
    <div
      className="mx-auto grid w-full max-w-[1104px] grid-cols-1 gap-6 pb-28 lg:grid-cols-[minmax(0,1fr)_300px] lg:pb-0"
      style={{ "--editor-sticky-top": `${stickyTop}px` } as CSSProperties}
    >
      <div className="min-w-0">
        <PostContentFields {...content} />
      </div>

      <aside className="flex flex-col gap-5 self-start lg:sticky lg:top-[calc(var(--editor-sticky-top)+24px)] lg:max-h-[calc(100vh-var(--editor-sticky-top)-48px)] lg:overflow-y-auto">
        {/* One element, two positions: the first card in the rail on desktop (so Publish / Submit is always on screen), a bar fixed to the bottom on phones. */}
        <div className="fixed inset-x-0 bottom-0 z-30 flex flex-col gap-3 border-t border-border-default bg-white/95 p-3 backdrop-blur lg:static lg:z-auto lg:rounded-2xl lg:border lg:bg-white lg:p-5 lg:backdrop-blur-none">
          {error && (
            <p role="alert" className="rounded-lg bg-[#FBEAE3] px-3 py-2 text-sm font-medium text-[#9C3D10]">
              {error}
            </p>
          )}
          {actions}
          {footnote}
        </div>

        <section className="flex flex-col gap-4 rounded-2xl border border-border-default bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">{settingsTitle}</h2>
            {status}
          </div>
          {settings}
        </section>
      </aside>
    </div>
  );
}
