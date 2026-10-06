"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

// Signing in through a Server Action ends in a soft (client-side) redirect, so
// SessionProvider keeps the "unauthenticated" state it fetched on the sign-in
// page — the header would say "Member login" and the admin menu "…" until a
// full reload. While signed out, re-fetch the session whenever the route
// changes so the client catches up the moment a login lands.
export function SessionSync() {
  const { status, update } = useSession();
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    if (status === "unauthenticated") void update();
  });

  return null;
}
