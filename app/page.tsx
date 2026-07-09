"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/app-context";
import type { Product, Swap } from "@/lib/types";
import VoteButtons from "@/components/VoteButtons";
import ShareButtons from "@/components/ShareButtons";

function matchScore(q: string, s: Swap, p?: Product): number {
  const hay = [
    s.conventional_name,
    s.conventional_brand,
    p?.name ?? "",
    p?.brand ?? "",
    p?.category ?? "",
    ...(p?.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return 0;
  let score = 0;
  for (const t of terms) if (hay.includes(t)) score++;
  return score / terms.length;
}

export default function HomePage() {
  const { swaps, products, loading, price, stores, country } = useApp();
  const [query, setQuery] = useState("");

  const productsBySlug = useMemo(
    () => new Map(products.map((p) => [p.slug, p])),
    [products]
  );

  const results = useMemo(() => {
    const list = swaps
      .map((s) => ({ swap: s, product: productsBySlug.get(s.product_slug) }))
      .filter((r): r is { swap: Swap; product: Product } => Boolean(r.product))
      .filter((r) => (country === "CA" ? r.product.available_ca : r.product.available_us));
    if (!query.trim()) return list.slice(0, 6);
    return list
      .map((r) => ({ ...r, score: matchScore(query, r.swap, r.product) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, [query, swaps, productsBySlug, country]);

  const convPrice = (s: Swap) =>
    country === "CA" ? s.conventional_price_cad : s.conventional_price_usd;
  const cfPrice = (p: Product) => (country === "CA" ? p.price_cad : p.price_usd);
  const cur = country === "CA" ? "C$" : "$";

  return (
    <div className="space-y-8">
      <section className="text-center pt-6 sm:pt-10 space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-800">
          Swap it cruelty-free 🐰
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Type an everyday product — mascara, shampoo, dish soap — and get an affordable
          cruelty-free alternative with its expected price and where to find it in{" "}
          {country === "CA" ? "Canada" : "the US"}.
        </p>
        <div className="max-w-xl mx-auto">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Maybelline mascara, Tide detergent, Dove body wash…"
            className="w-full rounded-full border border-brand-200 px-5 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-400 text-base"
            aria-label="Search for a product to swap"
          />
        </div>
        <div className="flex flex-wrap justify-center gap-2 text-sm">
          {["mascara", "shampoo", "deodorant", "laundry", "toothpaste"].map((t) => (
            <button
              key={t}
              onClick={() => setQuery(t)}
              className="px-3 py-1 rounded-full bg-white border border-brand-200 text-brand-700 hover:bg-brand-50 transition"
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold text-gray-700">
          {query.trim() ? `Swaps for “${query}”` : "Popular swaps"}
        </h2>
        {loading && <p className="text-gray-500 text-sm">Loading catalogue…</p>}
        {!loading && results.length === 0 && (
          <div className="bg-white rounded-2xl border border-brand-100 p-6 text-center text-gray-600">
            No direct swap found yet. Browse the{" "}
            <Link href="/catalogue" className="text-brand-700 underline font-medium">
              full catalogue
            </Link>{" "}
            — new swaps are added regularly.
          </div>
        )}
        <div className="space-y-4">
          {results.map(({ swap, product }) => {
            const saving = convPrice(swap) - cfPrice(product);
            const storeList = stores(product);
            return (
              <div
                key={swap.id}
                className="bg-white rounded-2xl border border-brand-100 shadow-sm p-4 sm:p-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-center">
                  <div className="text-gray-500">
                    <p className="text-xs uppercase tracking-wide font-semibold">Instead of</p>
                    <p className="font-medium text-gray-700 line-through decoration-rose-300">
                      {swap.conventional_brand} {swap.conventional_name}
                    </p>
                    <p className="text-sm">~{cur}{convPrice(swap).toFixed(2)}</p>
                  </div>
                  <div className="text-center text-2xl text-brand-500 hidden sm:block" aria-hidden>
                    →
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide font-semibold text-brand-600">
                      Try instead
                    </p>
                    <Link
                      href={`/product/${product.slug}`}
                      className="font-semibold text-brand-800 hover:underline"
                    >
                      {product.emoji} {product.brand} {product.name}
                    </Link>
                    <p className="text-sm text-gray-700">
                      ~{price(product)}{" "}
                      {saving > 0.5 && (
                        <span className="text-emerald-600 font-semibold">
                          (save ~{cur}{saving.toFixed(2)})
                        </span>
                      )}
                      {saving < -0.5 && (
                        <span className="text-amber-600">
                          (+{cur}{Math.abs(saving).toFixed(2)} for cruelty-free)
                        </span>
                      )}
                    </p>
                    {storeList.length > 0 && (
                      <p className="text-xs text-gray-500">🏬 Likely at: {storeList.join(", ")}</p>
                    )}
                  </div>
                </div>
                {swap.note && <p className="mt-3 text-sm text-gray-600 bg-brand-50 rounded-xl px-3 py-2">💡 {swap.note}</p>}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <VoteButtons product={product} />
                  <ShareButtons product={product} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
