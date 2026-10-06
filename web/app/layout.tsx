import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { SessionSync } from "@/components/SessionSync";
import { fraunces, instrumentSans } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Batch 11 — Khulna University",
  description: "The home of Khulna University Batch 11.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fraunces.variable} ${instrumentSans.variable}`}>
      <body className="min-h-screen bg-bg-public font-sans text-text-primary antialiased">
        <SessionProvider>
          <SessionSync />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
