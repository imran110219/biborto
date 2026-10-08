import type { Brand } from "@/lib/settings";

// Round logo + batch/institution names. `tone` picks the colours for a light or a dark
// (green) background. Pure markup, so it works from server and client components alike.
export function BrandMark({ brand, tone = "light" }: { brand: Brand; tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <>
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-full font-serif text-lg font-semibold ${
          dark ? "bg-bg-public text-brand-green" : "bg-brand-green text-bg-public"
        }`}
      >
        {brand.logoText}
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-base font-bold">{brand.batchName}</span>
        <span className={`text-sm ${dark ? "text-brand-green-tint" : "text-text-secondary"}`}>{brand.institution}</span>
      </div>
    </>
  );
}
