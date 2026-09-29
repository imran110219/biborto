"use client";

import { useEffect, useState } from "react";
import { CloseIcon, ExternalLinkIcon } from "@/components/ui/icons";
import type { Sponsor } from "@/lib/types";

const SEEN_KEY = "diamondSponsorSeen";

export function DiamondPopup({ sponsor }: { sponsor: Sponsor }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Reads a browser-only API to decide first-render visibility after
    // mount — an effect is the right tool here, not an external store.
    if (sessionStorage.getItem(SEEN_KEY) !== "1") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(true);
    }
  }, []);

  function dismiss() {
    sessionStorage.setItem(SEEN_KEY, "1");
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <button
        type="button"
        aria-label="Dismiss"
        onClick={dismiss}
        className="absolute inset-0 bg-brand-green-dark/55"
      />
      <div
        role="dialog"
        aria-label="Diamond sponsor"
        className="relative flex w-full max-w-[380px] animate-[diamondPopIn_0.35s_ease] flex-col items-center gap-3.5 rounded-[20px] bg-white px-9 pb-9 pt-10 text-center"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={dismiss}
          className="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full border border-border-default text-text-secondary"
        >
          <CloseIcon size={16} />
        </button>
        <span className="text-xs font-bold tracking-[0.1em] text-diamond uppercase">Diamond Sponsor</span>
        <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-diamond-tint font-serif text-2xl font-semibold text-diamond">
          {sponsor.initials}
        </div>
        <h2 className="font-serif text-2xl font-medium">{sponsor.name}</h2>
        <p className="text-sm leading-relaxed text-text-secondary">
          Proud to fuel every Batch 11 gathering — from late study nights to the Grand Reunion itself.
        </p>
        <a
          href="#"
          className="mt-1.5 flex h-12 items-center gap-2 rounded-full bg-brand-green px-6 text-sm font-semibold text-white"
        >
          Visit website <ExternalLinkIcon />
        </a>
      </div>
    </div>
  );
}
