"use client";
import { useApp } from "@/lib/app-context";
import type { Product } from "@/lib/types";

export default function VoteButtons({ product, size = "sm" }: { product: Product; size?: "sm" | "lg" }) {
  const { vote, myVotes } = useApp();
  const mine = myVotes[product.id];
  const base =
    size === "lg"
      ? "px-4 py-2 text-base gap-2"
      : "px-2.5 py-1 text-sm gap-1.5";

  return (
    <div className="flex items-center gap-2" onClick={(e) => e.preventDefault()}>
      <button
        aria-label="Upvote"
        onClick={(e) => {
          e.stopPropagation();
          vote(product.id, 1);
        }}
        className={`flex items-center rounded-full border font-medium transition ${base} ${
          mine === 1
            ? "bg-brand-600 text-white border-brand-600"
            : "bg-white text-brand-700 border-brand-200 hover:bg-brand-50"
        }`}
      >
        <span aria-hidden>👍</span> {product.upvotes}
      </button>
      <button
        aria-label="Downvote"
        onClick={(e) => {
          e.stopPropagation();
          vote(product.id, -1);
        }}
        className={`flex items-center rounded-full border font-medium transition ${base} ${
          mine === -1
            ? "bg-rose-500 text-white border-rose-500"
            : "bg-white text-rose-600 border-rose-200 hover:bg-rose-50"
        }`}
      >
        <span aria-hidden>👎</span> {product.downvotes}
      </button>
    </div>
  );
}
