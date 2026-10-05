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
  name,
  defaultValue,
}: {
  id: string;
  label: string;
  placeholder: string;
  name?: string;
  defaultValue?: string;
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
          name={name}
          defaultValue={defaultValue}
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
  name,
  defaultValue,
}: {
  id: string;
  label: string;
  // Plain strings, or {value,label} when the submitted value differs from the
  // shown text (e.g. "" for "All categories").
  options: (string | { value: string; label: string })[];
  width?: string;
  name?: string;
  defaultValue?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${width}`}>
      <label htmlFor={id} className="text-xs font-semibold text-text-secondary">
        {label}
      </label>
      <select id={id} name={name} defaultValue={defaultValue} className="h-12 rounded-xl border border-border-input bg-white px-3.5 text-sm">
        {options.map((o) =>
          typeof o === "string" ? (
            <option key={o}>{o}</option>
          ) : (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ),
        )}
      </select>
    </div>
  );
}
