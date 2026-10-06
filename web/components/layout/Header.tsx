"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { clearAllDrafts } from "@/lib/blog/draft";
import { LockIcon, MenuIcon } from "@/components/ui/icons";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Members", href: "/members" },
  { label: "Blog", href: "/blog" },
  { label: "Events", href: "/events" },
  { label: "Gallery & Videos", href: "/gallery" },
  { label: "Business", href: "/business" },
];

function AccountActions({
  mobile = false,
  status,
  isAdmin,
  onNavigate,
}: {
  mobile?: boolean;
  status: "loading" | "authenticated" | "unauthenticated";
  isAdmin: boolean;
  onNavigate?: () => void;
}) {
  if (status === "loading") return null;
  if (status !== "authenticated") {
    return (
      <Link
        href="/signin"
        onClick={onNavigate}
        className={`${mobile ? "mt-2 flex h-11 justify-center" : "hidden h-11 md:flex"} items-center gap-2 rounded-full bg-text-primary px-5 text-sm font-semibold text-bg-public`}
      >
        <LockIcon />
        Member login
      </Link>
    );
  }

  return (
    <div className={`${mobile ? "mt-2 flex flex-col" : "hidden md:flex"} items-center gap-2`}>
      <Link
        href="/account"
        onClick={onNavigate}
        className={`${mobile ? "h-11 w-full justify-center" : "h-9 px-3"} flex items-center rounded-full text-sm font-semibold text-text-primary`}
      >
        My account
      </Link>
      {isAdmin && (
        <Link
          href="/admin/dashboard"
          onClick={onNavigate}
          className="flex h-11 items-center rounded-full bg-brand-green px-5 text-sm font-semibold text-white"
        >
          Admin dashboard
        </Link>
      )}
      <button
        type="button"
        onClick={() => {
          clearAllDrafts(); // unsent blog drafts stay private to the person who wrote them
          void signOut({ redirectTo: "/" });
        }}
        className={`${mobile ? "h-11 w-full" : "h-9 px-3"} rounded-full text-sm font-semibold text-text-secondary`}
      >
        Sign out
      </button>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.platformRole === "admin" || session?.user?.platformRole === "superadmin";

  return (
    <header className="sticky top-0 z-40 border-b border-border-default bg-bg-public">
      <div className="flex h-[84px] items-center justify-between px-5 md:px-20">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-green font-serif text-lg font-semibold text-bg-public">
            11
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-bold">Batch 11</span>
            <span className="text-sm text-text-secondary">Khulna University</span>
          </div>
        </Link>

        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-border-input bg-white text-text-primary md:hidden"
        >
          <MenuIcon />
        </button>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3.5 py-2.5 text-sm font-semibold ${
                  active ? "bg-brand-green-tint text-brand-green" : "font-medium text-text-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <AccountActions status={status} isAdmin={isAdmin} />
      </div>

      {open && (
        <div className="flex flex-col gap-1 border-t border-border-default px-5 py-3 md:hidden">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-full px-3.5 py-2.5 text-sm font-semibold ${
                  active ? "bg-brand-green-tint text-brand-green" : "font-medium text-text-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <AccountActions mobile status={status} isAdmin={isAdmin} onNavigate={() => setOpen(false)} />
        </div>
      )}
    </header>
  );
}
