"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { EyeIcon, LogoutIcon, MembersIcon } from "@/components/ui/icons";
import { initialsOf } from "@/lib/db/format";

const ROLE_LABELS = { member: "Member", admin: "Admin", superadmin: "Superadmin" };

const ITEM = "flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium hover:bg-bg-admin";

export function AdminUserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const name = session?.user?.name ?? "…";
  const email = session?.user?.email;
  const role = session?.user?.platformRole;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-amber-tint text-sm font-bold text-accent-amber-text"
      >
        {initialsOf(name)}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[52px] z-50 w-64 rounded-xl border border-border-default bg-white p-2 shadow-lg"
        >
          <div className="flex flex-col px-3 py-2">
            <span className="text-sm font-semibold">{name}</span>
            {email && <span className="truncate text-xs text-text-secondary">{email}</span>}
            {role && <span className="mt-1 text-xs font-semibold text-brand-green">{ROLE_LABELS[role]}</span>}
          </div>
          <div className="my-1 h-px bg-border-default" />
          <Link href="/account" role="menuitem" onClick={() => setOpen(false)} className={ITEM}>
            <MembersIcon /> My profile
          </Link>
          <Link href="/" role="menuitem" onClick={() => setOpen(false)} className={ITEM}>
            <EyeIcon /> View public site
          </Link>
          <button type="button" role="menuitem" onClick={() => signOut({ redirectTo: "/" })} className={ITEM}>
            <LogoutIcon /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
