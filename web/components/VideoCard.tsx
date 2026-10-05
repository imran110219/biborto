"use client";

import { useState } from "react";
import { PlayIcon } from "@/components/ui/icons";
import { youtubeEmbedUrl, youtubeThumbnailUrl } from "@/lib/youtube";
import type { Video } from "@/lib/types";

// Click-to-play: the page loads only YouTube's thumbnail, and the
// (privacy-enhanced) iframe is mounted on click, so a gallery of videos
// doesn't load a player — or YouTube's trackers — per card.
export function VideoCard({ video }: { video: Video }) {
  const [playing, setPlaying] = useState(false);
  const { youtubeId, title } = video;
  if (!youtubeId) return null;

  const tags = [video.eventTitle, video.disciplineName].filter(Boolean);

  return (
    <article className="flex flex-col gap-3.5">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-video-dark">
        {playing ? (
          <iframe
            src={youtubeEmbedUrl(youtubeId)}
            title={title}
            allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play ${title}`}
            className="group absolute inset-0 flex items-center justify-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={youtubeThumbnailUrl(youtubeId)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-bg-public text-text-primary transition-transform group-hover:scale-105">
              <PlayIcon />
            </span>
          </button>
        )}
      </div>
      <h3 className="text-lg font-semibold leading-snug">{title}</h3>
      <span className="flex flex-wrap items-center gap-x-2 text-sm text-text-secondary">
        YouTube{tags.length > 0 && ` · ${tags.join(" · ")}`}
      </span>
    </article>
  );
}
