"use client";
import { useMemo, useState } from "react";
import { useApp } from "@/lib/app-context";
import ProductCard from "@/components/ProductCard";
import type { Category } from "@/lib/types";

const CATEGORIES: Category[] = ["Makeup", "Skincare", "Hair", "Body", "Oral Care", "Household"];
const CERTS = ["Leaping Bunny", "PETA", "Leaping Bunny + PETA"];
const SORTS = [
  { id: "top", label: "Top voted" },
  { id: "price-asc", label: "Price: low → high" },
  { id: "price-desc", label: "Price: high → low" },
  { id: "name", label: "Name A–Z" },
] as const;

export default function CataloguePage() {
  const { products, loading, country } = useApp();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("");
  const [cert, setCert] = useState<string>("");
  const [veganOnly, setVeganOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(50);
  const [sort, setSort] = useState<(typeof SORTS)[number]["id"]>("top");

  const filtered = useMemo(() => {
    const priceOf = (p: (typeof products)[number]) =>
      country === "CA" ? p.price_cad : p.price_usd;
    let list = products.filter((p) => (country === "CA" ? p.available_ca : p.available_us));
    if (q.trim()) {
      const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
      list = list.filter((p) => {
        const hay = `${p.name} ${p.brand} ${p.category} ${p.tags.join(" ")}`.toLowerCase();
        return terms.every((t) => hay.includes(t));
      });
    }
    if (category) list = list.filter((p) => p.category === category);
    if (cert) list = list.filter((p) => p.certification === cert);
    if (veganOnly) list = list.filter((p) => p.vegan);
    list = list.filter((p) => priceOf(p) <= maxPrice);
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => priceOf(a) - priceOf(b));
        break;
      case "price-desc":
        list.sort((a, b) => priceOf(b) - priceOf(a));
        break;
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        list.sort((a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes));
    }
    return list;
  }, [products, q, category, cert, veganOnly, maxPrice, sort, country]);

  const cur = country === "CA" ? "C$" : "$";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-brand-800">Cruelty-free catalogue</h1>
        <p className="text-gray-600 text-sm">
          {country === "CA" ? "Available in Canada" : "Available in the US"} · {filtered.length} product{filtered.length === 1 ? "" : "s"}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-brand-100 p-4 space-y-3">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products, brands, tags…"
          className="w-full rounded-full border border-brand-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
          aria-label="Search catalogue"
        />
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-full border border-brand-200 px-3 py-1.5 text-sm bg-white"
            aria-label="Category"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={cert}
            onChange={(e) => setCert(e.target.value)}
            className="rounded-full border border-brand-200 px-3 py-1.5 text-sm bg-white"
            aria-label="Certification"
          >
            <option value="">Any certification</option>
            {CERTS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="rounded-full border border-brand-200 px-3 py-1.5 text-sm bg-white"
            aria-label="Sort"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
          <label className="flex items-center gap-1.5 text-sm text-brand-800 px-3 py-1.5 rounded-full border border-brand-200 cursor-pointer bg-white">
            <input
              type="checkbox"
              checked={veganOnly}
              onChange={(e) => setVeganOnly(e.target.checked)}
              className="accent-brand-600"
            />
            🌱 Vegan only
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            Max {cur}{maxPrice}
            <input
              type="range"
              min={3}
              max={50}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="accent-brand-600 w-28 sm:w-40"
              aria-label="Maximum price"
            />
          </label>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading catalogue…</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-600 bg-white rounded-2xl border border-brand-100 p-6 text-center">
          No products match those filters. Try widening the price range or clearing a filter.
        </p>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
