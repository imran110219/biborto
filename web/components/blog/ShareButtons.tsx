"use client";

import { useState } from "react";
import { MailIcon, ShareIcon } from "@/components/ui/icons";

const BUTTON = "flex h-11 w-11 items-center justify-center rounded-full border border-border-input bg-white";

// Copy-link and share-by-email for a post. Uses the page's own URL at click time,
// so it is right on any domain without configuration.
export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", window.location.href);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {copied && (
        <span role="status" className="text-sm font-semibold text-brand-green">
          Link copied
        </span>
      )}
      <button type="button" aria-label="Copy link" onClick={copy} className={BUTTON}>
        <ShareIcon />
      </button>
      <button
        type="button"
        aria-label="Share by email"
        onClick={() => {
          window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(window.location.href)}`;
        }}
        className={BUTTON}
      >
        <MailIcon />
      </button>
    </div>
  );
}
