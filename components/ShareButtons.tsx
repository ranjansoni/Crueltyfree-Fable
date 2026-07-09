"use client";
import { useState } from "react";
import { useApp } from "@/lib/app-context";
import type { Product } from "@/lib/types";

export default function ShareButtons({ product }: { product: Product }) {
  const { price } = useApp();
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined" ? `${window.location.origin}/product/${product.slug}` : "";
  const text = `Cruelty-free find: ${product.brand} ${product.name} (~${price(product)}) 🐰 #CrueltyFree`;

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, text, url });
        return;
      } catch {}
    }
    copy();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const enc = encodeURIComponent;
  const links = [
    { label: "X", href: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}&quote=${enc(text)}` },
    { label: "WhatsApp", href: `https://wa.me/?text=${enc(`${text} ${url}`)}` },
    { label: "Reddit", href: `https://www.reddit.com/submit?url=${enc(url)}&title=${enc(text)}` },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={nativeShare}
        className="px-3 py-1.5 rounded-full bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition"
      >
        📤 Share
      </button>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-full border border-brand-200 text-brand-700 text-sm hover:bg-brand-50 transition"
        >
          {l.label}
        </a>
      ))}
      <button
        onClick={copy}
        className="px-3 py-1.5 rounded-full border border-brand-200 text-brand-700 text-sm hover:bg-brand-50 transition"
      >
        {copied ? "✅ Copied" : "🔗 Copy link"}
      </button>
    </div>
  );
}
