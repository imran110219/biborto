"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useBrand } from "@/components/BrandContext";
import { BrandMark } from "@/components/layout/BrandMark";
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
  BellIcon,
} from "@/components/ui/icons";

const NAV_ITEMS: { label: string; href: string; icon: typeof DashboardIcon; superadminOnly?: boolean }[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: DashboardIcon },
  { label: "Members", href: "/admin/members", icon: MembersIcon },
  { label: "Businesses", href: "/admin/businesses", icon: BriefcaseIcon },
  { label: "Sponsors", href: "/admin/sponsors", icon: StarIcon },
  { label: "Blog posts", href: "/admin/edit-post", icon: DocumentIcon },
  { label: "Events", href: "/admin/events", icon: CalendarIcon },
  { label: "Gallery", href: "/admin/gallery", icon: PhotoIcon },
  { label: "Videos", href: "/admin/videos", icon: VideoIcon },
  { label: "Popups", href: "/admin/popups", icon: BellIcon, superadminOnly: true },
  { label: "Settings", href: "/admin/settings", icon: SettingsIcon },
];

export function AdminSidebar({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const brand = useBrand();
  const role = session?.user?.platformRole;

  return (
    <aside className={`flex flex-col gap-9 overflow-y-auto bg-brand-green-dark p-5 text-bg-public ${className}`}>
      <div className="flex items-center gap-3 px-1.5">
        <BrandMark brand={brand} tone="dark" />
      </div>

      <nav aria-label="Admin" className="flex flex-col gap-1">
        {NAV_ITEMS.filter((item) => !item.superadminOnly || role === "superadmin").map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
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
    </aside>
  );
}
