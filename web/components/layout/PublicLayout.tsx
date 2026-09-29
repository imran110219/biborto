import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg-public">
      <Header />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </div>
  );
}
