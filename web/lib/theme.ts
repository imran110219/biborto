// Theme colours chosen in /admin/settings. The stylesheet (globals.css @theme) defines the
// default palette as CSS custom properties; the root layout overrides the brand and accent
// families on <html> from these helpers, so Tailwind classes like bg-brand-green and
// text-accent-amber pick up the committee's colours with no rebuild.

export const DEFAULT_BRAND = "#1e4a38";
export const DEFAULT_ACCENT = "#9a6414";

type Rgb = [number, number, number];

export function parseHex(value: string): Rgb | undefined {
  const m = /^#?([0-9a-f]{6})$/i.exec(value.trim());
  if (!m) return undefined;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const toHex = (c: Rgb) => "#" + c.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0")).join("");
const mix = (a: Rgb, b: Rgb, t: number): Rgb => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const WHITE: Rgb = [255, 255, 255];
const BLACK: Rgb = [0, 0, 0];

function luminance([r, g, b]: Rgb) {
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrastWithWhite(hex: string): number {
  const rgb = parseHex(hex);
  return rgb ? 1.05 / (luminance(rgb) + 0.05) : 0;
}

// Both colours are used for text and for backgrounds under white text, so they must stay
// readable on white (WCAG AA, 4.5:1). Returns an error message, or undefined when fine.
export function validateThemeColor(label: string, hex: string): string | undefined {
  if (!parseHex(hex)) return `${label} must be a hex colour like #1e4a38.`;
  if (contrastWithWhite(hex) < 4.5) return `${label} is too light — white text on it would be hard to read. Pick a darker colour.`;
  return undefined;
}

// Fall back to the default for a missing/invalid/low-contrast value instead of breaking the site.
const safe = (hex: string, fallback: string) => (validateThemeColor("", hex) ? fallback : hex.startsWith("#") ? hex : `#${hex}`);

// The derived shades reproduce the original palette closely (green → #153528 / #2c5a47 /
// #e4ece6, amber → #f0e8dc / #7b501a), so the default look is unchanged.
export function themeVars(brandHex: string, accentHex: string): Record<string, string> {
  const brand = parseHex(safe(brandHex, DEFAULT_BRAND))!;
  const accent = parseHex(safe(accentHex, DEFAULT_ACCENT))!;
  return {
    "--color-brand-green": toHex(brand),
    "--color-brand-green-dark": toHex(mix(brand, BLACK, 0.28)),
    "--color-brand-green-mid": toHex(mix(brand, WHITE, 0.07)),
    "--color-brand-green-tint": toHex(mix(brand, WHITE, 0.88)),
    "--color-accent-amber": toHex(accent),
    "--color-accent-amber-tint": toHex(mix(accent, WHITE, 0.85)),
    "--color-accent-amber-text": toHex(mix(accent, BLACK, 0.2)),
  };
}

export const themeColorOf = (hex: string) => toHex(parseHex(safe(hex, DEFAULT_BRAND))!);
