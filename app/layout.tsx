import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/app-context";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "CrueltyFree Swap — Affordable cruelty-free alternatives",
  description:
    "Find low-cost cruelty-free alternatives to everyday products in Canada and the US. Expected prices, likely stores, community-voted.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <Header />
          <main className="mx-auto max-w-6xl px-4 py-6 min-h-[80vh]">{children}</main>
          <footer className="border-t border-brand-100 py-6 text-center text-xs text-gray-500 px-4">
            <p>
              🐰 Prices are typical shelf prices and may vary by store and region. Certifications
              should be re-verified at{" "}
              <a href="https://www.leapingbunny.org" className="underline" target="_blank" rel="noopener noreferrer">
                leapingbunny.org
              </a>{" "}
              and{" "}
              <a href="https://crueltyfree.peta.org" className="underline" target="_blank" rel="noopener noreferrer">
                crueltyfree.peta.org
              </a>
              .
            </p>
          </footer>
        </AppProvider>
      </body>
    </html>
  );
}
