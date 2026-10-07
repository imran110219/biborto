// The site-wide Content Security Policy and companion security headers, built per
// request by proxy.ts (the nonce must be fresh every time — see Next's CSP guide).
//
// Design notes
//  • script-src uses a nonce + 'strict-dynamic': only scripts Next.js (and the consented
//    Google Analytics tag) render with this request's nonce may run, and anything they
//    load. An injected <script> or inline handler is refused. No 'unsafe-inline' for scripts.
//  • style-src allows 'unsafe-inline' because the app renders style="…" attributes
//    (cover images, sizes) that a nonce can't cover. Styles are a far smaller risk than scripts.
//  • Allowed image/media origins come from the environment at request time (the R2 public
//    URL), so the policy matches whichever bucket a deployment uses.
//  • Custom popup HTML does NOT run under this policy: it is served from /popup-frame/<id>
//    in a sandboxed frame with its own policy (app/popup-frame/[id]/route.ts).

const originOf = (value?: string) => {
  try {
    return value ? new URL(value).origin : undefined;
  } catch {
    return undefined;
  }
};

export function buildCsp(nonce: string): string {
  const dev = process.env.NODE_ENV === "development";
  const r2 = originOf(process.env.R2_PUBLIC_URL);
  const analytics = !!process.env.GA_MEASUREMENT_ID;
  const https = process.env.NODE_ENV === "production" && (process.env.APP_URL?.startsWith("https://") ?? false);

  const gaImg = analytics ? ["https://*.google-analytics.com", "https://*.googletagmanager.com"] : [];
  const gaConnect = analytics ? ["https://*.google-analytics.com", "https://*.analytics.google.com", "https://*.googletagmanager.com"] : [];

  const directives: Record<string, (string | undefined)[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", dev ? "'unsafe-eval'" : undefined],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", r2, "https://i.ytimg.com", ...gaImg],
    "font-src": ["'self'"],
    "connect-src": ["'self'", ...gaConnect, dev ? "ws:" : undefined, dev ? "wss:" : undefined],
    "frame-src": ["'self'", "https://www.youtube-nocookie.com"],
    "media-src": ["'self'", r2],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'", "https://accounts.google.com"],
    "frame-ancestors": ["'none'"],
  };

  const policy = Object.entries(directives).map(([name, values]) => `${name} ${values.filter(Boolean).join(" ")}`);
  if (https) policy.push("upgrade-insecure-requests");
  return policy.join("; ");
}

export function securityHeaders(nonce: string): Record<string, string> {
  const https = process.env.NODE_ENV === "production" && (process.env.APP_URL?.startsWith("https://") ?? false);
  return {
    "Content-Security-Policy": buildCsp(nonce),
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
    ...(https ? { "Strict-Transport-Security": "max-age=31536000; includeSubDomains" } : {}),
  };
}

// Policy for the popup frame document itself: scripts and styles inline are the
// point of a custom-HTML popup, so they're allowed — but only inside a frame
// sandboxed to an opaque origin, with no network access for scripts (connect-src
// 'none'), no forms, and no way out except links the visitor clicks.
export const POPUP_FRAME_CSP = [
  "sandbox allow-scripts allow-popups allow-popups-to-escape-sandbox",
  "default-src 'none'",
  "script-src 'unsafe-inline' https:",
  "style-src 'unsafe-inline' https:",
  "img-src https: data:",
  "font-src https: data:",
  "media-src https:",
  "connect-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'self'",
].join("; ");
