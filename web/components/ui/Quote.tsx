import { QuoteIcon } from "@/components/ui/icons";

export function Quote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="flex items-start gap-[18px] py-2">
      <span className="shrink-0 text-accent-amber">
        <QuoteIcon />
      </span>
      <span className="font-serif text-2xl leading-snug text-brand-green md:text-[30px]">{children}</span>
    </blockquote>
  );
}
