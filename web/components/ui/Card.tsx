import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-[18px] border border-border-default bg-white ${className}`}>
      {children}
    </div>
  );
}
