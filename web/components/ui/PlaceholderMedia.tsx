export function PlaceholderMedia({
  label,
  className = "",
  rounded = "rounded-2xl",
}: {
  label: string;
  className?: string;
  rounded?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 bg-placeholder-media text-sm text-placeholder-media-text ${rounded} ${className}`}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="2" />
        <path d="m21 16-5-5-9 9" />
      </svg>
      <span>{label}</span>
    </div>
  );
}
