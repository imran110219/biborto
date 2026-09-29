export function StatBar({
  stats,
}: {
  stats: { value: string; label: string }[];
}) {
  return (
    <section className="grid grid-cols-2 gap-8 bg-brand-green px-5 py-11 text-bg-public md:grid-cols-4 md:px-20">
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col gap-1.5">
          <span className="font-serif text-4xl font-medium md:text-[46px]">{s.value}</span>
          <span className="text-sm text-brand-green-tint">{s.label}</span>
        </div>
      ))}
    </section>
  );
}
