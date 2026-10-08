import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { connection } from "next/server";
import { SessionProvider } from "next-auth/react";
import { SessionSync } from "@/components/SessionSync";
import { AnalyticsConsent } from "@/components/AnalyticsConsent";
import { BrandProvider } from "@/components/BrandContext";
import { brandOf, getSiteSettings } from "@/lib/settings";
import { themeColorOf, themeVars } from "@/lib/theme";
import { fraunces, instrumentSans } from "@/lib/fonts";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const settings = await getSiteSettings();
  const { batchName, institution } = brandOf(settings);
  return {
    // Pages set a plain title ("Members") and the template adds the batch name.
    title: { default: `${batchName} — ${institution}`, template: `%s — ${batchName}` },
    description: `The home of ${institution} ${batchName}. ${settings.motto}.`,
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
      : {}),
  };
}

// Colours the mobile browser bar with the brand colour.
export async function generateViewport(): Promise<Viewport> {
  await connection();
  return { themeColor: themeColorOf((await getSiteSettings()).theme_color) };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  await connection();
  const nonce = (await headers()).get("x-nonce") ?? undefined; // set per request by proxy.ts for the CSP
  const settings = await getSiteSettings();
  const brand = brandOf(settings);

  return (
    <html lang="en" style={themeVars(settings.theme_color, settings.accent_color)} className={`${fraunces.variable} ${instrumentSans.variable}`}>
      <body className="min-h-screen bg-bg-public font-sans text-text-primary antialiased">
        <BrandProvider value={brand}>
          <SessionProvider>
            <SessionSync />
            {children}
          </SessionProvider>
        </BrandProvider>
        <AnalyticsConsent measurementId={process.env.GA_MEASUREMENT_ID} nonce={nonce} />
      </body>
    </html>
  );
}
