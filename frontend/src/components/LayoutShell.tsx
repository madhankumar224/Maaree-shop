"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

const authPages = ["/login", "/register"];

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = authPages.includes(pathname);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <footer className="border-t border-warm-border py-6 mt-16">
        <div className="max-w-[1360px] mx-auto px-7 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-[Georgia] text-sm font-bold tracking-[0.28em] text-warm-text uppercase">MAAREE</span>
          <p className="text-xs text-warm-muted">
            &copy; {new Date().getFullYear()} MAAREE. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-warm-muted">
            <span className="hover:text-warm-text cursor-pointer transition">Privacy</span>
            <span className="hover:text-warm-text cursor-pointer transition">Terms</span>
            <span className="hover:text-warm-text cursor-pointer transition">Support</span>
          </div>
        </div>
      </footer>
    </>
  );
}
