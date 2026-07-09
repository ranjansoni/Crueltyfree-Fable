"use client";
// Global client state: country (CA/US), catalogue data, votes (incl. demo mode).
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import type { Country, Product, Swap } from "./types";

interface AppState {
  country: Country;
  setCountry: (c: Country) => void;
  products: Product[];
  swaps: Swap[];
  loading: boolean;
  demo: boolean;
  myVotes: Record<string, 1 | -1>;
  vote: (productId: string, v: 1 | -1) => Promise<void>;
  price: (p: Product) => string;
  stores: (p: Product) => string[];
}

const Ctx = createContext<AppState | null>(null);

function getDeviceId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem("cf_device_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("cf_device_id", id);
  }
  return id;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [country, setCountryState] = useState<Country>("CA"); // Phase 1 default: Canada
  const [products, setProducts] = useState<Product[]>([]);
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(true);
  const [myVotes, setMyVotes] = useState<Record<string, 1 | -1>>({});

  useEffect(() => {
    const saved = localStorage.getItem("cf_country");
    if (saved === "CA" || saved === "US") setCountryState(saved);
    try {
      setMyVotes(JSON.parse(localStorage.getItem("cf_my_votes") ?? "{}"));
    } catch {}
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        let prods: Product[] = d.products ?? [];
        setDemo(Boolean(d.demo));
        // In demo mode, overlay locally-stored vote tallies
        if (d.demo) {
          try {
            const tallies = JSON.parse(localStorage.getItem("cf_demo_tallies") ?? "{}");
            prods = prods.map((p) => ({
              ...p,
              upvotes: tallies[p.id]?.up ?? p.upvotes,
              downvotes: tallies[p.id]?.down ?? p.downvotes,
            }));
          } catch {}
        }
        setProducts(prods);
        setSwaps(d.swaps ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const setCountry = useCallback((c: Country) => {
    setCountryState(c);
    localStorage.setItem("cf_country", c);
  }, []);

  const vote = useCallback(
    async (productId: string, v: 1 | -1) => {
      const prev = myVotes[productId];
      if (prev === v) return; // already voted this way

      // optimistic update
      setProducts((ps) =>
        ps.map((p) => {
          if (p.id !== productId) return p;
          let { upvotes, downvotes } = p;
          if (prev === 1) upvotes--;
          if (prev === -1) downvotes--;
          if (v === 1) upvotes++;
          else downvotes++;
          return { ...p, upvotes, downvotes };
        })
      );
      const nextVotes: Record<string, 1 | -1> = { ...myVotes, [productId]: v };
      setMyVotes(nextVotes);
      localStorage.setItem("cf_my_votes", JSON.stringify(nextVotes));

      try {
        const res = await fetch("/api/vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, deviceId: getDeviceId(), vote: v }),
        });
        const d = await res.json();
        if (d.demo) {
          // persist demo tallies locally
          const tallies = JSON.parse(localStorage.getItem("cf_demo_tallies") ?? "{}");
          const p = productsRef.current.find((x) => x.id === productId);
          if (p) tallies[productId] = { up: p.upvotes, down: p.downvotes };
          localStorage.setItem("cf_demo_tallies", JSON.stringify(tallies));
        } else if (typeof d.upvotes === "number") {
          setProducts((ps) =>
            ps.map((p) => (p.id === productId ? { ...p, upvotes: d.upvotes, downvotes: d.downvotes } : p))
          );
        }
      } catch {
        /* keep optimistic state */
      }
    },
    [myVotes]
  );

  // ref so demo tally persistence sees latest products
  const productsRef = React.useRef(products);
  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  const price = useCallback(
    (p: Product) =>
      country === "CA" ? `C$${p.price_cad.toFixed(2)}` : `$${p.price_usd.toFixed(2)}`,
    [country]
  );
  const stores = useCallback(
    (p: Product) => (country === "CA" ? p.stores_ca : p.stores_us),
    [country]
  );

  const value = useMemo(
    () => ({ country, setCountry, products, swaps, loading, demo, myVotes, vote, price, stores }),
    [country, setCountry, products, swaps, loading, demo, myVotes, vote, price, stores]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
