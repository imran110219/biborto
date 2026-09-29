import { ArrowRightIcon } from "@/components/ui/icons";

export function Pagination({ pages = 3 }: { pages?: number }) {
  return (
    <nav aria-label="Pagination" className="flex justify-center gap-2 py-10">
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <a
          key={p}
          href="#"
          className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-semibold ${
            p === 1 ? "bg-brand-green text-white" : "border border-border-default bg-white"
          }`}
        >
          {p}
        </a>
      ))}
      <a
        href="#"
        className="flex h-11 items-center gap-2 rounded-xl border border-border-default bg-white px-4 text-sm font-semibold"
      >
        Next <ArrowRightIcon />
      </a>
    </nav>
  );
}
