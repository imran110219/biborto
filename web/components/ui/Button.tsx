import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "dark" | "ghost" | "onDark";
type Size = "md" | "sm";

const base = "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors";

const variants: Record<Variant, string> = {
  primary: "bg-brand-green text-white border border-brand-green hover:bg-brand-green-dark",
  secondary: "bg-transparent text-text-primary border border-text-primary hover:bg-black/5",
  dark: "bg-text-primary text-bg-public hover:bg-black",
  ghost: "border border-border-default bg-white text-text-primary hover:bg-black/5",
  onDark: "bg-bg-public text-brand-green hover:bg-white",
};

const sizes: Record<Size, string> = {
  md: "h-[52px] px-6 text-base",
  sm: "h-11 px-5 text-sm",
};

interface ButtonProps {
  children: ReactNode;
  href?: string;
  variant?: Variant;
  size?: Size;
  type?: "button" | "submit";
  className?: string;
  onClick?: () => void;
}

export function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  type = "button",
  className = "",
  onClick,
}: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick}>
      {children}
    </button>
  );
}
