// Server-side data layer. Uses Supabase when configured; otherwise falls back
// to the bundled seed catalogue ("demo mode") so the app works out of the box.
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { seedProducts, seedSwaps } from "./seed-data";
import type { Product, Swap } from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const hasSupabase = Boolean(url && anonKey);

let _client: SupabaseClient | null = null;
export function supabase(): SupabaseClient {
  if (!_client) _client = createClient(url!, anonKey!);
  return _client;
}

export async function getProducts(): Promise<Product[]> {
  if (!hasSupabase) return seedProducts;
  const { data: products, error } = await supabase().from("products").select("*");
  if (error || !products) return seedProducts;
  const { data: voteRows } = await supabase().from("product_votes").select("*");
  const votes = new Map<string, { upvotes: number; downvotes: number }>(
    (voteRows ?? []).map((v: any) => [v.product_id, { upvotes: v.upvotes, downvotes: v.downvotes }])
  );
  return products.map((p: any) => ({
    ...p,
    upvotes: votes.get(p.id)?.upvotes ?? 0,
    downvotes: votes.get(p.id)?.downvotes ?? 0,
  })) as Product[];
}

export async function getSwaps(): Promise<Swap[]> {
  if (!hasSupabase) return seedSwaps;
  const { data, error } = await supabase().from("swaps").select("*");
  if (error || !data) return seedSwaps;
  return data as Swap[];
}

export async function castVote(productId: string, deviceId: string, vote: 1 | -1) {
  if (!hasSupabase) return null; // demo mode: client keeps votes in localStorage
  const { data, error } = await supabase().rpc("cast_vote", {
    p_product_id: productId,
    p_device_id: deviceId,
    p_vote: vote,
  });
  if (error) throw new Error(error.message);
  const row = Array.isArray(data) ? data[0] : data;
  return { upvotes: row?.upvotes ?? 0, downvotes: row?.downvotes ?? 0 };
}
