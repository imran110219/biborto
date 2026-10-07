"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { clearAllDrafts } from "@/lib/blog/draft";
import { initialsOf } from "@/lib/db/format";
import { LogoutIcon, MembersIcon } from "@/components/ui/icons";

const ITEM = "flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium hover:bg-bg-public";

export const MEMBER_LINKS = [
  { label: "My account", href: "/account" },
  { label: "Write a post", href: "/blog/submit" },
  { label: "List a business", href: "/business/submit" },
];

export function signOutMember() {
  clearAllDrafts(); // unsent blog drafts stay private to the person who wrote them
  void signOut({ redirectTo: "/" });
}

// Avatar dropdown for signed-in members in the public navbar (desktop).
export function MemberMenu({ isAdmin }: { isAdmin: boolean }) {
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

  const name = session?.user?.name ?? "Member";
  const email = session?.user?.email;

  return (
    <div ref={ref} className="relative hidden md:block">
      <button
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-green text-sm font-bold text-white"
      >
        {initialsOf(name)}
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-[52px] z-50 w-64 rounded-xl border border-border-default bg-white p-2 shadow-lg">
          <div className="flex flex-col px-3 py-2">
            <span className="text-sm font-semibold">{name}</span>
            {email && <span className="truncate text-xs text-text-secondary">{email}</span>}
          </div>
          <div className="my-1 h-px bg-border-default" />
          {MEMBER_LINKS.map((l) => (
            <Link key={l.href} href={l.href} role="menuitem" onClick={() => setOpen(false)} className={ITEM}>
              <MembersIcon /> {l.label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin/dashboard" role="menuitem" onClick={() => setOpen(false)} className={`${ITEM} font-semibold text-brand-green`}>
              <MembersIcon /> Admin dashboard
            </Link>
          )}
          <div className="my-1 h-px bg-border-default" />
          <button type="button" role="menuitem" onClick={signOutMember} className={ITEM}>
            <LogoutIcon /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
