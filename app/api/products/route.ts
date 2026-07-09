import { NextResponse } from "next/server";
import { getProducts, getSwaps, hasSupabase } from "@/lib/db";

export const revalidate = 60;

export async function GET() {
  const [products, swaps] = await Promise.all([getProducts(), getSwaps()]);
  return NextResponse.json({ products, swaps, demo: !hasSupabase });
}
