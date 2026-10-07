import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { securityHeaders } from "@/lib/security/csp";

// Runs on the Node.js runtime (the Next 16 default for proxy), so the jwt callback in
// auth.ts can re-check the member row on every request. Two jobs:
//  1. Per-request CSP nonce + security headers on every page response.
//  2. Gate /admin/** to admin/superadmin sessions.
export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    const role = req.auth?.user?.platformRole;
    if (role !== "admin" && role !== "superadmin") {
      const signInUrl = new URL("/signin", req.nextUrl.origin);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  const nonce = btoa(crypto.randomUUID());
  const headers = securityHeaders(nonce);

  // Next reads the nonce from the request's CSP header and applies it to its own scripts.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", headers["Content-Security-Policy"]);

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  for (const [k, v] of Object.entries(headers)) res.headers.set(k, v);
  return res;
});

export const config = {
  // Everything except static assets, API routes (JSON, no HTML) and the popup frame,
  // which sets its own policy.
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico|popup-frame|robots.txt|sitemap.xml).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
