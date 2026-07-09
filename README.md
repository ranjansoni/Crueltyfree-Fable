# 🐰 CrueltyFree Swap

Find affordable cruelty-free alternatives to everyday products — with expected prices, likely stores, community voting, and social sharing. Canada-first, with a one-tap switch to the US.

## Stack

Next.js 14 (App Router, TypeScript) · Tailwind CSS · Supabase (Postgres) · Vercel. All free tier.

## Features

- **Swap finder** (home): type a conventional product ("Maybelline mascara", "Tide") → cruelty-free alternative with expected price, savings, and likely stores
- **Catalogue** with filters: search, category, certification (Leaping Bunny / PETA), vegan-only, max price slider, sorting (top voted / price / name)
- **Country switcher** 🇨🇦/🇺🇸 in the header — swaps prices (CAD/USD), store lists, and availability. Defaults to Canada; choice persists
- **Voting**: anonymous up/down votes, one per device per product (no signup)
- **Sharing**: native share sheet on mobile, plus X, Facebook, WhatsApp, Reddit and copy-link
- **Mobile responsive** throughout
- **Demo mode**: runs fully without Supabase (bundled seed catalogue, votes stored in browser) — useful for local dev and instant preview

## Local development

```bash
npm install
npm run dev        # http://localhost:3000 — runs in demo mode
```

## Supabase setup (enables shared community votes)

1. Create a free project at [supabase.com](https://supabase.com)
2. In the SQL Editor, run `supabase/schema.sql`, then `supabase/seed.sql`
3. Copy `.env.example` to `.env.local` and fill in from **Settings → API**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Restart `npm run dev` — the demo-mode banner disappears

Security model: tables are read-only to the public (RLS); the only write path is the `cast_vote()` Postgres function, which enforces one vote per device per product.

## Deploy to Vercel

1. Push this folder to a GitHub repo
2. [vercel.com](https://vercel.com) → **Add New Project** → import the repo (Next.js auto-detected)
3. Add the two `NEXT_PUBLIC_SUPABASE_*` environment variables
4. Deploy — you get `your-app.vercel.app`

## Managing the catalogue

`lib/seed-data.ts` is the single source of truth. To add/edit products or swaps:

1. Edit `lib/seed-data.ts`
2. Run `npm run gen:seed` to regenerate `supabase/seed.sql`
3. Re-run the new inserts in the Supabase SQL Editor (inserts use `on conflict do nothing`, so re-running the whole file is safe)

Or insert rows directly in the Supabase Table Editor — the app reads from the database when connected.

## Adding more countries later

Country handling is centralized: `lib/types.ts` (`Country` type), price/store columns per country in the schema, and the switcher in `components/Header.tsx`. To add e.g. UK: add `price_gbp` / `stores_uk` / `available_uk` columns, extend the `Country` type, and add a case in `lib/app-context.tsx` (`price`, `stores`).

## Disclaimers

Prices are typical shelf prices (approximate, seeded mid-2026) and vary by store/region. Brand cruelty-free status can change — re-verify at [leapingbunny.org](https://www.leapingbunny.org) and [crueltyfree.peta.org](https://crueltyfree.peta.org) before major catalogue updates.
