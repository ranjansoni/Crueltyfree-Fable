"use client";
import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useApp } from "@/lib/app-context";
import VoteButtons from "@/components/VoteButtons";
import ShareButtons from "@/components/ShareButtons";
import ProductCard from "@/components/ProductCard";

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const { products, swaps, loading, price, stores, country } = useApp();

  const product = useMemo(
    () => products.find((p) => p.slug === params.slug),
    [products, params.slug]
  );
  const relatedSwaps = useMemo(
    () => swaps.filter((s) => s.product_slug === params.slug),
    [swaps, params.slug]
  );
  const similar = useMemo(() => {
    if (!product) return [];
    return products
      .filter(
        (p) =>
          p.id !== product.id &&
          p.category === product.category &&
          (country === "CA" ? p.available_ca : p.available_us)
      )
      .sort((a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes))
      .slice(0, 4);
  }, [products, product, country]);

  if (loading) return <p className="text-gray-500">Loading…</p>;
  if (!product)
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-4xl" aria-hidden>🔍</p>
        <p className="text-gray-600">Product not found.</p>
        <Link href="/catalogue" className="text-brand-700 underline font-medium">
          Back to catalogue
        </Link>
      </div>
    );

  const storeList = stores(product);
  const cur = country === "CA" ? "C$" : "$";

  return (
    <div className="space-y-8">
      <nav className="text-sm text-gray-500">
        <Link href="/catalogue" className="hover:underline text-brand-700">Catalogue</Link>{" "}
        / {product.category} / <span className="text-gray-700">{product.name}</span>
      </nav>

      <div className="bg-white rounded-3xl border border-brand-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr]">
          <div className="bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-8xl py-10 md:py-0">
            <span aria-hidden>{product.emoji}</span>
          </div>
          <div className="p-5 sm:p-7 space-y-4">
            <div>
              <p className="text-sm font-semibold text-brand-600 uppercase tracking-wide">
                {product.brand}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{product.name}</h1>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-100 font-medium">
                🐰 {product.certification}
              </span>
              {product.vegan && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium">
                  🌱 Vegan
                </span>
              )}
              <span className="px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 border border-gray-200">
                {product.category}
              </span>
              {product.tags.includes("canadian") && (
                <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-100 font-medium">
                  🇨🇦 Canadian brand
                </span>
              )}
            </div>
            <p className="text-gray-700">{product.description}</p>
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
              <p>
                <span className="text-3xl font-bold text-brand-700">{price(product)}</span>{" "}
                <span className="text-sm text-gray-500">expected price</span>
              </p>
              <p className="text-sm text-gray-500">
                ({country === "CA" ? `$${product.price_usd.toFixed(2)} in the US` : `C$${product.price_cad.toFixed(2)} in Canada`})
              </p>
            </div>
            {storeList.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1.5">
                  🏬 Likely stores in {country === "CA" ? "Canada" : "the US"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {storeList.map((s) => (
                    <span key={s} className="px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-sm text-brand-800">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-brand-50">
              <div>
                <p className="text-xs text-gray-500 mb-1">Was this a good suggestion?</p>
                <VoteButtons product={product} size="lg" />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">Share this find</p>
              <ShareButtons product={product} />
            </div>
          </div>
        </div>
      </div>

      {relatedSwaps.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold text-gray-800">Replaces</h2>
          <div className="space-y-2">
            {relatedSwaps.map((s) => {
              const conv = country === "CA" ? s.conventional_price_cad : s.conventional_price_usd;
              const mine = country === "CA" ? product.price_cad : product.price_usd;
              const saving = conv - mine;
              return (
                <div key={s.id} className="bg-white rounded-2xl border border-brand-100 p-4 text-sm">
                  <p>
                    <span className="line-through decoration-rose-300 text-gray-500">
                      {s.conventional_brand} {s.conventional_name} (~{cur}{conv.toFixed(2)})
                    </span>{" "}
                    {saving > 0.5 && (
                      <span className="text-emerald-600 font-semibold">save ~{cur}{saving.toFixed(2)}</span>
                    )}
                  </p>
                  {s.note && <p className="text-gray-600 mt-1">💡 {s.note}</p>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {similar.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold text-gray-800">More in {product.category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {similar.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
