"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminUserMenu } from "./AdminUserMenu";
import { BellIcon, MenuIcon, SearchIcon } from "@/components/ui/icons";

export function AdminLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-bg-admin">
      <AdminSidebar className="hidden w-[264px] shrink-0 md:flex" />

      {open && (
        <>
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-brand-green-dark/45 md:hidden"
          />
          <AdminSidebar className="fixed inset-y-0 left-0 z-50 w-60 md:hidden" />
        </>
      )}

      <div className="flex flex-1 flex-col">
        <div className="flex h-[76px] flex-wrap items-center justify-between gap-3 border-b border-border-default bg-white px-5 py-3 md:px-10">
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-border-input bg-white md:hidden"
          >
            <MenuIcon />
          </button>
          <div className="relative flex flex-1 items-center md:w-[380px] md:flex-none">
            <span className="absolute left-3.5 text-text-secondary">
              <SearchIcon />
            </span>
            <input
              placeholder="Search members, posts, events"
              className="h-11 w-full rounded-[10px] border border-border-default bg-bg-admin pl-10 pr-3.5 text-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <button aria-label="Notifications" className="relative flex h-11 w-11 items-center justify-center rounded-[10px] border border-border-default bg-white">
              <BellIcon />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#B3541E]" />
            </button>
            <AdminUserMenu />
          </div>
        </div>

        <main className="flex flex-1 flex-col gap-7 p-5 md:p-10">{children}</main>
      </div>
    </div>
  );
}
