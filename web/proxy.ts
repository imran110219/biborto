import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Runs on the Edge runtime — reads role from the already-decoded JWT
// (see auth.ts's jwt callback), never queries Postgres directly here.
export default auth((req) => {
  const role = req.auth?.user?.platformRole;
  const isAdmin = role === "admin" || role === "superadmin";

  if (!isAdmin) {
    const signInUrl = new URL("/signin", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
