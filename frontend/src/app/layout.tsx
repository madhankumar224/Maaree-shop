import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import LayoutShell from "@/components/LayoutShell";

export const metadata: Metadata = {
  title: "MAAREE - Modern E-Commerce",
  description: "Shop with intention. Thoughtfully curated products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-warm-bg text-warm-text">
        <Providers>
          <LayoutShell>{children}</LayoutShell>
        </Providers>
      </body>
    </html>
  );
}
