import type { ReactNode } from "react";
import { SearchIcon } from "@/components/ui/icons";

export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-stretch gap-4 rounded-[18px] border border-border-default bg-white p-5 md:flex-row md:items-end">
      {children}
    </div>
  );
}

export function SearchField({
  id,
  label,
  placeholder,
}: {
  id: string;
  label: string;
  placeholder: string;
}) {
  return (
    <div className="flex flex-1 flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-text-secondary">
        {label}
      </label>
      <div className="relative flex items-center">
        <span className="absolute left-3.5 text-text-secondary">
          <SearchIcon />
        </span>
        <input
          id={id}
          type="search"
          placeholder={placeholder}
          className="h-12 w-full rounded-xl border border-border-input pl-10 pr-3.5 text-sm"
        />
      </div>
    </div>
  );
}

export function SelectField({
  id,
  label,
  options,
  width = "md:w-[220px]",
}: {
  id: string;
  label: string;
  options: string[];
  width?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${width}`}>
      <label htmlFor={id} className="text-xs font-semibold text-text-secondary">
        {label}
      </label>
      <select id={id} className="h-12 rounded-xl border border-border-input bg-white px-3.5 text-sm">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
