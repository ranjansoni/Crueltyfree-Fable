-- Cruelty-Free Swap: run this in Supabase SQL Editor FIRST, then run seed.sql.

create extension if not exists "pgcrypto";

create table if not exists products (
  id text primary key,               -- slug used as id for simplicity
  slug text unique not null,
  name text not null,
  brand text not null,
  category text not null,
  description text default '',
  price_cad numeric(8,2) not null,
  price_usd numeric(8,2) not null,
  certification text not null,
  vegan boolean default false,
  emoji text default '🛍️',
  stores_ca text[] default '{}',
  stores_us text[] default '{}',
  available_ca boolean default true,
  available_us boolean default true,
  tags text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists swaps (
  id text primary key,
  conventional_name text not null,
  conventional_brand text not null,
  conventional_price_cad numeric(8,2) not null,
  conventional_price_usd numeric(8,2) not null,
  product_slug text not null references products(slug) on delete cascade,
  note text default ''
);

create table if not exists votes (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references products(id) on delete cascade,
  device_id text not null,
  vote smallint not null check (vote in (-1, 1)),
  created_at timestamptz default now(),
  unique (product_id, device_id)
);

-- Aggregated vote counts view
create or replace view product_votes as
select
  p.id as product_id,
  coalesce(sum(case when v.vote = 1 then 1 else 0 end), 0)::int as upvotes,
  coalesce(sum(case when v.vote = -1 then 1 else 0 end), 0)::int as downvotes
from products p
left join votes v on v.product_id = p.id
group by p.id;

-- Cast or change a vote atomically; returns new counts.
create or replace function cast_vote(p_product_id text, p_device_id text, p_vote smallint)
returns table (upvotes int, downvotes int)
language plpgsql
security definer
as $$
begin
  if p_vote not in (-1, 1) then
    raise exception 'invalid vote';
  end if;
  insert into votes (product_id, device_id, vote)
  values (p_product_id, p_device_id, p_vote)
  on conflict (product_id, device_id)
  do update set vote = excluded.vote, created_at = now();

  return query
  select
    coalesce(sum(case when v.vote = 1 then 1 else 0 end), 0)::int,
    coalesce(sum(case when v.vote = -1 then 1 else 0 end), 0)::int
  from votes v where v.product_id = p_product_id;
end;
$$;

-- Row Level Security: public read; writes only via cast_vote()
alter table products enable row level security;
alter table swaps enable row level security;
alter table votes enable row level security;

drop policy if exists "public read products" on products;
create policy "public read products" on products for select using (true);

drop policy if exists "public read swaps" on swaps;
create policy "public read swaps" on swaps for select using (true);

drop policy if exists "public read votes" on votes;
create policy "public read votes" on votes for select using (true);

grant execute on function cast_vote(text, text, smallint) to anon;
