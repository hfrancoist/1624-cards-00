-- ═══════════════════════════════════════════════════════════════════════════
-- 1624 Cards — Initial Schema
-- Run once in the Supabase SQL Editor to bootstrap the database.
-- After this: run enable_rls.sql, then stripe_setup.sql.
-- ═══════════════════════════════════════════════════════════════════════════


-- ── Enum ─────────────────────────────────────────────────────────────────

do $$ begin
  create type condition_type as enum ('NM', 'LP', 'MP', 'HP', 'DMG');
exception when duplicate_object then null;
end $$;


-- ── cards ─────────────────────────────────────────────────────────────────
-- One row per unique card identity.
-- The same physical card printed in different languages = separate rows.

create table if not exists cards (
  id           uuid        primary key default gen_random_uuid(),
  game         text        not null check (game in ('pokemon', 'one_piece')),
  set_code     text        not null,          -- e.g. 'SV4', 'OP-01'
  set_name     text        not null,          -- e.g. 'Paradox Rift', 'Romance Dawn'
  card_number  text        not null,          -- e.g. '025/182', 'OP01-001'
  name_en      text        not null,
  rarity       text        not null,
  language     text        not null default 'EN',
  edition      text,                          -- e.g. '1st Edition', null = unlimited
  image_url    text,                          -- official art reference (optional)
  created_at   timestamptz not null default now(),

  unique (game, set_code, card_number, language)
);

create index if not exists cards_game_idx      on cards (game);
create index if not exists cards_set_code_idx  on cards (set_code);
create index if not exists cards_name_en_idx   on cards using gin (to_tsvector('english', name_en));


-- ── listings ──────────────────────────────────────────────────────────────
-- One row per physical copy of a card available for sale.

create table if not exists listings (
  id             uuid           primary key default gen_random_uuid(),
  card_id        uuid           not null references cards (id) on delete cascade,
  condition      condition_type not null,
  price_chf      numeric(10,2)  not null check (price_chf > 0),
  quantity       int            not null default 1 check (quantity >= 0),
  scan_front     text           not null,  -- Supabase Storage public URL
  scan_back      text,
  scan_preview   text,
  condition_note text,
  is_active      boolean        not null default true,
  is_new_arrival boolean        not null default false,
  created_at     timestamptz    not null default now()
);

create index if not exists listings_card_id_idx  on listings (card_id);
create index if not exists listings_is_active_idx on listings (is_active) where is_active = true;
create index if not exists listings_game_idx on listings (card_id) include (price_chf, condition, is_active);


-- ── wishlist_entries ──────────────────────────────────────────────────────
-- Buyers subscribe to be notified when a card they want is listed.

create table if not exists wishlist_entries (
  id             uuid           primary key default gen_random_uuid(),
  card_id        uuid           not null references cards (id) on delete cascade,
  buyer_email    text           not null,
  condition_min  condition_type not null default 'LP',
  max_price_chf  numeric(10,2),
  notified_at    timestamptz,
  created_at     timestamptz    not null default now(),

  unique (card_id, buyer_email)
);


-- ═══════════════════════════════════════════════════════════════════════════
-- Storage bucket
-- ─────────────────────────────────────────────────────────────────────────
-- Create manually in Supabase dashboard → Storage → New bucket:
--   Name:   card-scans
--   Public: true (scans are displayed publicly on the storefront)
--
-- File naming convention:
--   {listing_id}-front.webp
--   {listing_id}-back.webp
--   {listing_id}-preview.webp
--
-- Public URL pattern:
--   https://<project>.supabase.co/storage/v1/object/public/card-scans/{filename}
-- ═══════════════════════════════════════════════════════════════════════════
