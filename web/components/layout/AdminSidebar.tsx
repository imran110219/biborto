"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  DashboardIcon,
  MembersIcon,
  DocumentIcon,
  CalendarIcon,
  PhotoIcon,
  VideoIcon,
  SettingsIcon,
  StarIcon,
  BriefcaseIcon,
  EyeIcon,
  LogoutIcon,
} from "@/components/ui/icons";
import { initialsOf } from "@/lib/db/format";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: DashboardIcon },
  { label: "Members", href: "/admin/members", icon: MembersIcon },
  { label: "Businesses", href: "/admin/businesses", icon: BriefcaseIcon },
  { label: "Sponsors", href: "/admin/sponsors", icon: StarIcon },
  { label: "Blog posts", href: "/admin/edit-post", icon: DocumentIcon },
  { label: "Events", href: "/admin/events", icon: CalendarIcon },
  { label: "Photos", href: "/admin/photos", icon: PhotoIcon },
  { label: "Videos", href: "/admin/videos", icon: VideoIcon },
  { label: "Settings", href: "/admin/settings", icon: SettingsIcon },
];

const ROLE_LABELS = { member: "Member", admin: "Admin", superadmin: "Superadmin" };

export function AdminSidebar({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const name = session?.user?.name ?? "…";
  const role = session?.user?.platformRole;

  return (
    <aside className={`flex flex-col gap-9 bg-brand-green-dark p-5 text-bg-public ${className}`}>
      <div className="flex items-center gap-3 px-1.5">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-bg-public font-serif text-lg font-semibold text-brand-green">
          11
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-base font-bold">Batch 11</span>
          <span className="text-sm text-brand-green-tint">Khulna University</span>
        </div>
      </div>

      <nav aria-label="Admin" className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex h-[46px] items-center gap-3 rounded-[10px] px-3.5 text-[15px] ${
                active ? "bg-brand-green-mid font-semibold text-white" : "font-medium text-brand-green-tint"
              }`}
            >
              <Icon />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        <Link href="/" className="flex h-11 items-center gap-3 rounded-[10px] px-3.5 text-sm text-brand-green-tint">
          <EyeIcon />
          View public site
        </Link>
        <div className="flex items-center gap-3 rounded-xl bg-brand-green p-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-amber-tint text-sm font-bold text-accent-amber-text">
            {initialsOf(name)}
          </div>
          <div className="flex flex-1 flex-col">
            <span className="text-sm font-semibold text-white">{name}</span>
            <span className="text-xs text-brand-green-tint">{role ? ROLE_LABELS[role] : ""}</span>
          </div>
          <button
            type="button"
            aria-label="Sign out"
            onClick={() => signOut({ redirectTo: "/" })}
            className="text-brand-green-tint"
          >
            <LogoutIcon />
          </button>
        </div>
      </div>
    </aside>
  );
}
