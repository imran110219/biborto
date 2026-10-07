"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Profile", href: "/account" },
  { label: "Submissions & events", href: "/account/submissions" },
  { label: "Security", href: "/account/security" },
];

export function AccountTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Account" className="flex gap-1 overflow-x-auto border-b border-border-default">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`-mb-px whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold ${
              active ? "border-brand-green text-brand-green" : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
