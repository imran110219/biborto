"use client";

import { useState } from "react";
import { PopupModal } from "@/components/CustomPopup";
import { EyeIcon } from "@/components/ui/icons";
import type { Popup } from "@/lib/types";

// Opens the popup exactly as visitors see it (the saved version).
export function PopupPreviewButton({ popup, label = "Preview" }: { popup: Popup; label?: string }) {
  const [open, setOpen] = useState(false);
  const previewable = popup.kind === "html" || !!popup.imageUrl;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={!previewable}
        title={previewable ? "Preview popup" : "Upload an image to preview"}
        className="flex h-9 items-center gap-1.5 rounded-lg border border-border-default bg-white px-3 text-xs font-semibold disabled:opacity-40"
      >
        <EyeIcon size={14} /> {label}
      </button>
      {open && <PopupModal popup={popup} onClose={() => setOpen(false)} />}
    </>
  );
}
