-- ── Enable RLS on all public tables ──────────────────────────────────────

-- Cards table: public read-only (anyone can browse cards)
alter table cards enable row level security;

create policy "Public read cards"
  on cards for select
  using (true);

-- Listings table: public read-only for active listings only
alter table listings enable row level security;

create policy "Public read active listings"
  on listings for select
  using (is_active = true);

-- Orders table: already has RLS — service role only (no changes needed)
-- (already set in stripe_setup.sql)

-- ── Block all writes from anon/authenticated roles ────────────────────────
-- Cards and listings are managed via the Supabase dashboard (service role only).
-- No insert/update/delete policies = blocked for public.
