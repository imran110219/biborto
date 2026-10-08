"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

// Google Analytics, but only with the visitor's say-so and never on private pages.
//
//  • Nothing is loaded — no script, no cookie, no request to Google — until the visitor
//    presses "Accept". "Decline" is remembered too. The footer's "Cookie settings" link
//    lets them change their mind.
//  • It never runs on account, admin, sign-in, sign-up or password pages. Those URLs can
//    carry one-time tokens (/reset-password?token=…) and member emails, which must not be
//    sent to a third party.
//  • Page views are sent by hand with the *path only* — no query string — instead of
//    letting gtag report location.href, so a search term or token in a URL never leaves.

const STORAGE_KEY = "analytics-consent";
const OPEN_EVENT = "analytics:open-settings";

const PRIVATE_PREFIXES = [
  "/admin",
  "/account",
  "/welcome",
  "/signin",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/blog/submit",
  "/business/submit",
];
const isPrivate = (pathname: string) => PRIVATE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

type Decision = "granted" | "denied";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function readDecision(): Decision | null {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null; // storage blocked: ask each visit, remember nothing
  }
}

export function AnalyticsConsent({ measurementId, nonce }: { measurementId?: string; nonce?: string }) {
  const enabled = !!measurementId && /^G-[A-Z0-9]+$/.test(measurementId);
  const pathname = usePathname();
  const [decision, setDecision] = useState<Decision | null | undefined>(undefined); // undefined = not read yet
  const [reopened, setReopened] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    // Reads localStorage, which only exists in the browser — hence an effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDecision(readDecision());
    document.documentElement.dataset.analytics = "on"; // tells the footer link to show itself
    const reopen = () => setReopened(true);
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, [enabled]);

  // One page view per navigation, path only, and only where analytics is allowed.
  useEffect(() => {
    if (decision !== "granted" || !loaded || isPrivate(pathname) || !window.gtag) return;
    window.gtag("event", "page_view", {
      page_location: `${window.location.origin}${pathname}`,
      page_path: pathname,
      page_title: document.title,
    });
  }, [decision, loaded, pathname]);

  if (!enabled || isPrivate(pathname)) return null;

  const choose = (value: Decision) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* not persisted — will ask again next visit */
    }
    setDecision(value);
    setReopened(false);
  };

  const showBanner = decision === null || reopened;

  return (
    <>
      {decision === "granted" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId!)}`} strategy="afterInteractive" nonce={nonce} onLoad={() => setLoaded(true)} />
          <Script id="google-analytics" strategy="afterInteractive" nonce={nonce}>
            {`window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${measurementId}', { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false });`}
          </Script>
        </>
      )}

      {showBanner && (
        <div
          role="dialog"
          aria-label="Analytics cookies"
          className="fixed inset-x-3 bottom-3 z-[90] mx-auto flex max-w-xl flex-col gap-3 rounded-2xl border border-border-default bg-white p-4 shadow-xl sm:flex-row sm:items-center sm:p-5"
        >
          <p className="flex-1 text-sm text-text-secondary">
            We&apos;d like to use Google Analytics to see which pages are useful. It only runs if you accept, and never on sign-in or account pages.
          </p>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={() => choose("denied")} className="h-10 rounded-full border border-border-input px-4 text-sm font-semibold">
              Decline
            </button>
            <button type="button" onClick={() => choose("granted")} className="h-10 rounded-full bg-brand-green px-4 text-sm font-semibold text-white">
              Accept
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// Footer control: re-opens the choice. It only appears when analytics is configured.
export function CookieSettingsLink() {
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAvailable(document.documentElement.dataset.analytics === "on");
  }, []);
  if (!available) return null;
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))} className="text-left text-sm text-bg-public hover:underline">
      Cookie settings
    </button>
  );
}
