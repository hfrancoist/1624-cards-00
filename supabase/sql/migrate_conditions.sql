-- Migrate card conditions: (NM, EX, GD, LP, DMG) -> (NM, LP, MP, HP, DMG)
--
-- Mapping:
--   NM  -> NM  (unchanged)
--   EX  -> LP
--   GD  -> MP
--   LP  -> HP
--   DMG -> DMG (unchanged)

-- Step 1: Migrate listings.condition
-- Order matters: LP->HP first to avoid overwriting EX->LP
update listings set condition = 'HP'  where condition = 'LP';
update listings set condition = 'MP'  where condition = 'GD';
update listings set condition = 'LP'  where condition = 'EX';

-- Step 2: Migrate wishlist_entries.condition_min
update wishlist_entries set condition_min = 'HP'  where condition_min = 'LP';
update wishlist_entries set condition_min = 'MP'  where condition_min = 'GD';
update wishlist_entries set condition_min = 'LP'  where condition_min = 'EX';

-- Step 3: Drop old check constraints and add new ones
-- (run each alter separately if one table does not have a constraint)
alter table listings
  drop constraint if exists listings_condition_check;

alter table listings
  add constraint listings_condition_check
  check (condition in ('NM', 'LP', 'MP', 'HP', 'DMG'));

alter table wishlist_entries
  drop constraint if exists wishlist_entries_condition_check;

alter table wishlist_entries
  add constraint wishlist_entries_condition_check
  check (condition_min in ('NM', 'LP', 'MP', 'HP', 'DMG'));
