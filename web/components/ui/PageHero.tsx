export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="flex flex-col gap-4 px-5 pb-10 pt-16 md:px-20">
      <span className="text-xs font-bold tracking-[0.1em] text-accent-amber uppercase">{eyebrow}</span>
      <h1 className="font-serif text-5xl font-medium leading-[1.05] tracking-tight md:text-6xl">{title}</h1>
      <p className="max-w-[640px] text-lg leading-relaxed text-text-secondary">{description}</p>
    </section>
  );
}
