"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { CloseIcon } from "@/components/ui/icons";

// Modal chrome for the home-page popup (see CustomPopup):
// backdrop click / Escape / close button all dismiss, and the page behind
// doesn't scroll while it's open. Parents render it only while open.
export function PopupShell({
  label,
  onClose,
  className = "",
  closeButtonClassName = "absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full border border-border-default text-text-secondary",
  children,
}: {
  label: string;
  onClose: () => void;
  className?: string;
  closeButtonClassName?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <button type="button" aria-label="Dismiss" onClick={onClose} className="absolute inset-0 bg-brand-green-dark/55" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`relative w-full animate-[popupIn_0.35s_ease] motion-reduce:animate-none ${className}`}
      >
        <button type="button" aria-label="Close" onClick={onClose} className={closeButtonClassName}>
          <CloseIcon size={16} />
        </button>
        {children}
      </div>
    </div>
  );
}
