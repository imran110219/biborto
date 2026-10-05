const sizes = {
  sm: "w-10 h-10 text-sm",
  md: "w-11 h-11 text-lg",
  lg: "w-24 h-24 text-3xl",
};

interface AvatarProps {
  initials: string;
  imageUrl?: string;
  size?: keyof typeof sizes;
  variant?: "green" | "cream" | "diamond" | "amber";
}

const variants = {
  green: "bg-brand-green-tint text-brand-green",
  cream: "bg-bg-public text-brand-green",
  diamond: "bg-diamond-tint text-diamond",
  amber: "bg-accent-amber-tint text-accent-amber-text",
};

export function Avatar({ initials, imageUrl, size = "md", variant = "green" }: AvatarProps) {
  return (
    <div
      role={imageUrl ? "img" : undefined}
      aria-label={imageUrl ? `${initials} profile photo` : undefined}
      className={`flex shrink-0 items-center justify-center rounded-full font-serif font-semibold ${sizes[size]} ${variants[variant]}`}
      style={imageUrl ? { backgroundImage: `url("${imageUrl}")`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
    >
      {!imageUrl && initials}
    </div>
  );
}
