import type { ReactNode } from "react";

export function AdminStatCard({
  label,
  value,
  caption,
  icon,
}: {
  label: string;
  value: string;
  caption: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border-default bg-white p-[22px]">
      <div className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-text-secondary">{label}</span>
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-brand-green-tint text-brand-green">
            {icon}
          </span>
        </div>
        <span className="font-serif text-[40px] font-medium">{value}</span>
        <span className="text-sm text-text-secondary">{caption}</span>
      </div>
    </div>
  );
}
