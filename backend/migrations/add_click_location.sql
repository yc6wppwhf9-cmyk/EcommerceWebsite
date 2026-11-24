-- Approximate visitor location for each marketplace click (from Vercel's IP lookup),
-- used for the City / State / Zone filters and report columns. Run once in Supabase -> SQL Editor.
ALTER TABLE public.marketplace_clicks
  ADD COLUMN IF NOT EXISTS city        TEXT,
  ADD COLUMN IF NOT EXISTS region_code TEXT,
  ADD COLUMN IF NOT EXISTS country     TEXT;
