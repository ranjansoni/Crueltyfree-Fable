"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/app-context";

export default function Header() {
  const { country, setCountry, demo } = useApp();
  const pathname = usePathname();

  const nav = [
    { href: "/", label: "Find a Swap" },
    { href: "/catalogue", label: "Catalogue" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-brand-100">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 font-bold text-brand-700 text-lg">
            <span className="text-2xl" aria-hidden>🐰</span>
            <span className="hidden sm:inline">CrueltyFree Swap</span>
            <span className="sm:hidden">CF Swap</span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                  pathname === n.href
                    ? "bg-brand-600 text-white"
                    : "text-brand-800 hover:bg-brand-100"
                }`}
              >
                {n.label}
              </Link>
            ))}
            <div className="ml-1 sm:ml-3 flex rounded-full border border-brand-200 overflow-hidden text-sm">
              {(["CA", "US"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCountry(c)}
                  aria-pressed={country === c}
                  className={`px-2.5 py-1.5 font-semibold transition ${
                    country === c ? "bg-brand-600 text-white" : "bg-white text-brand-700 hover:bg-brand-50"
                  }`}
                >
                  {c === "CA" ? "🇨🇦 CA" : "🇺🇸 US"}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </div>
      {demo && (
        <div className="bg-amber-50 border-t border-amber-200 text-amber-800 text-xs text-center py-1 px-2">
          Demo mode — connect Supabase to enable shared community votes (see README).
        </div>
      )}
    </header>
  );
}
