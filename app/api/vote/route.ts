import { NextRequest, NextResponse } from "next/server";
import { castVote, hasSupabase } from "@/lib/db";

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  const { productId, deviceId, vote } = body ?? {};
  if (!productId || !deviceId || (vote !== 1 && vote !== -1)) {
    return NextResponse.json({ error: "productId, deviceId and vote (1|-1) required" }, { status: 400 });
  }
  if (!hasSupabase) {
    return NextResponse.json({ demo: true }, { status: 200 });
  }
  try {
    const counts = await castVote(String(productId), String(deviceId).slice(0, 64), vote);
    return NextResponse.json({ ...counts, demo: false });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "vote failed" }, { status: 500 });
  }
}
