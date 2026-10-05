"use client";

import { useState, type ReactNode } from "react";

type GalleryTab = "albums" | "videos";

export function GalleryTabs({ albumCards, videoCards }: { albumCards: ReactNode[]; videoCards: ReactNode[] }) {
  const [activeTab, setActiveTab] = useState<GalleryTab>("albums");

  const tabClass = (tab: GalleryTab) =>
    `rounded-full px-4 py-2.5 text-sm font-semibold ${activeTab === tab ? "bg-white shadow-sm" : "text-text-secondary"}`;

  return (
    <div className="flex flex-col gap-8">
      <div role="tablist" aria-label="Gallery content" className="flex w-fit gap-1 rounded-full bg-black/5 p-1">
        <button
          id="gallery-albums-tab"
          type="button"
          role="tab"
          aria-selected={activeTab === "albums"}
          aria-controls="gallery-albums-panel"
          className={tabClass("albums")}
          onClick={() => setActiveTab("albums")}
        >
          Photo albums ({albumCards.length})
        </button>
        <button
          id="gallery-videos-tab"
          type="button"
          role="tab"
          aria-selected={activeTab === "videos"}
          aria-controls="gallery-videos-panel"
          className={tabClass("videos")}
          onClick={() => setActiveTab("videos")}
        >
          Videos ({videoCards.length})
        </button>
      </div>

      <section id="gallery-albums-panel" role="tabpanel" aria-labelledby="gallery-albums-tab" hidden={activeTab !== "albums"}>
        {albumCards.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">{albumCards}</div>
        ) : (
          <p className="rounded-2xl border border-dashed border-border-default py-12 text-center text-text-secondary">No photo albums yet.</p>
        )}
      </section>

      <section id="gallery-videos-panel" role="tabpanel" aria-labelledby="gallery-videos-tab" hidden={activeTab !== "videos"}>
        <div className="mb-6">
          <span className="text-xs font-bold tracking-[0.1em] text-accent-amber uppercase">Videos</span>
          <h2 className="mt-2 font-serif text-3xl font-medium">From our YouTube channel</h2>
        </div>
        {videoCards.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">{videoCards}</div>
        ) : (
          <p className="rounded-2xl border border-dashed border-border-default py-12 text-center text-text-secondary">No linked videos yet.</p>
        )}
      </section>
    </div>
  );
}
