"use client";

import { useState } from "react";
import { PopupShell } from "@/components/PopupShell";
import { externalUrl } from "@/lib/url";
import type { Popup } from "@/lib/types";

// Wraps superadmin-supplied markup in a minimal document. Links open in a new
// tab (<base target>), and the page gets no margin so it fills the frame.
function frameDocument(html: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base target="_blank"><style>html,body{margin:0}</style></head><body>${html}</body></html>`;
}

// The popup body, without any modal chrome — also used by the admin preview.
export function PopupContent({ popup }: { popup: Popup }) {
  if (popup.kind === "html") {
    return (
      <iframe
        title={popup.title}
        // Untrusted-by-design markup: scripts may run (for animations) but in an
        // opaque origin — no allow-same-origin, so it can't touch this site's
        // cookies, storage or DOM. Popups/links may open in new tabs only.
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
        referrerPolicy="no-referrer"
        srcDoc={frameDocument(popup.htmlContent)}
        style={{ height: popup.heightPx }}
        className="block w-full max-w-full border-0 bg-white"
      />
    );
  }

  /* eslint-disable-next-line @next/next/no-img-element -- remote R2 URL, may be an animated GIF/WebP that next/image would flatten */
  const image = <img src={popup.imageUrl} alt={popup.altText} className="block h-auto max-h-[80vh] w-full object-contain" />;
  return popup.linkUrl ? (
    <a href={externalUrl(popup.linkUrl)} target="_blank" rel="noopener noreferrer">
      {image}
    </a>
  ) : (
    image
  );
}

export function PopupModal({ popup, onClose }: { popup: Popup; onClose: () => void }) {
  return (
    <PopupShell
      label={popup.title}
      onClose={onClose}
      className="max-w-[560px] overflow-hidden rounded-[20px] bg-white shadow-2xl"
      closeButtonClassName="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-text-primary shadow-md"
    >
      <PopupContent popup={popup} />
    </PopupShell>
  );
}

// Shown on every load of the home page it is rendered on.
export function CustomPopup({ popup }: { popup: Popup }) {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return <PopupModal popup={popup} onClose={() => setOpen(false)} />;
}
