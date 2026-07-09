"use client";
import Link from "next/link";
import { useApp } from "@/lib/app-context";
import type { Product } from "@/lib/types";
import VoteButtons from "./VoteButtons";

export default function ProductCard({ product }: { product: Product }) {
  const { price, stores } = useApp();
  const storeList = stores(product);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block bg-white rounded-2xl border border-brand-100 shadow-sm hover:shadow-md hover:border-brand-300 transition overflow-hidden"
    >
      <div className="h-24 bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-5xl">
        <span aria-hidden>{product.emoji}</span>
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide">{product.brand}</p>
            <h3 className="font-semibold text-gray-900 leading-snug group-hover:text-brand-700">
              {product.name}
            </h3>
          </div>
          <span className="shrink-0 font-bold text-brand-700">{price(product)}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-100">
            🐰 {product.certification}
          </span>
          {product.vegan && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
              🌱 Vegan
            </span>
          )}
          <span className="px-2 py-0.5 rounded-full bg-gray-50 text-gray-600 border border-gray-100">
            {product.category}
          </span>
        </div>
        {storeList.length > 0 && (
          <p className="text-xs text-gray-500 truncate" title={storeList.join(", ")}>
            🏬 {storeList.slice(0, 2).join(", ")}
            {storeList.length > 2 ? ` +${storeList.length - 2}` : ""}
          </p>
        )}
        <VoteButtons product={product} />
      </div>
    </Link>
  );
}
