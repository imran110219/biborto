import type { Metadata } from "next";
import { connection } from "next/server";
import { SessionProvider } from "next-auth/react";
import { SessionSync } from "@/components/SessionSync";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { fraunces, instrumentSans } from "@/lib/fonts";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  return {
    title: "Batch 11 — Khulna University",
    description: "The home of Khulna University Batch 11.",
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
      : {}),
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  await connection();

  return (
    <html lang="en" className={`${fraunces.variable} ${instrumentSans.variable}`}>
      <body className="min-h-screen bg-bg-public font-sans text-text-primary antialiased">
        <SessionProvider>
          <SessionSync />
          {children}
        </SessionProvider>
        <GoogleAnalytics measurementId={process.env.GA_MEASUREMENT_ID} />
      </body>
    </html>
  );
}
