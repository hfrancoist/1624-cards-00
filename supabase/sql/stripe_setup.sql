-- ── Orders table ──────────────────────────────────────────────────────────

create table if not exists orders (
  id                    uuid primary key default gen_random_uuid(),
  stripe_session_id     text unique not null,
  stripe_payment_intent text,
  status                text not null default 'pending', -- pending | paid | refunded
  total_chf             numeric(10,2) not null,
  shipping_chf          numeric(10,2) not null default 0,
  customer_email        text,
  items                 jsonb not null default '[]',
  created_at            timestamptz not null default now()
);

-- RLS: service role only for writes; anyone can read their own order by session_id
alter table orders enable row level security;

create policy "Service role full access"
  on orders for all
  using (auth.role() = 'service_role');

-- No public read access — orders are only readable via service role (webhook + edge functions)

-- ── Helper: decrement listing quantity atomically ──────────────────────────

create or replace function decrement_listing_quantity(p_listing_id uuid, p_qty int)
returns void
language plpgsql
security definer
as $$
begin
  update listings
  set quantity = greatest(0, quantity - p_qty)
  where id = p_listing_id;
end;
$$;
