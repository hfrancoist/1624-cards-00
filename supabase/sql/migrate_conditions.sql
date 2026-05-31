-- Migrate card conditions: (NM, EX, LP, DMG) -> (NM, LP, MP, HP, DMG)
-- condition column is a Postgres enum type (condition_type)
--
-- Mapping:
--   NM  -> NM  (unchanged)
--   EX  -> LP
--   LP  -> HP
--   DMG -> DMG (unchanged)
-- Note: MP is added as a new enum value (no existing data maps to it)

-- Step 1: Add new enum values (can only add, not remove, in Postgres)
ALTER TYPE condition_type ADD VALUE IF NOT EXISTS 'MP';
ALTER TYPE condition_type ADD VALUE IF NOT EXISTS 'HP';

-- Step 2: Migrate data (LP -> HP first, then EX -> LP)
UPDATE listings SET condition = 'HP' WHERE condition = 'LP';
UPDATE listings SET condition = 'LP' WHERE condition = 'EX';

-- Step 3: Same for wishlist_entries
UPDATE wishlist_entries SET condition_min = 'HP' WHERE condition_min = 'LP';
UPDATE wishlist_entries SET condition_min = 'LP' WHERE condition_min = 'EX';
