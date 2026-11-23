-- Extra context for each marketplace click, used by the admin "Product Click Report".
-- Run once in Supabase -> SQL Editor. Safe to run again.
-- session_id is a random per-visit id created in the browser; no personal data is stored.
ALTER TABLE public.marketplace_clicks
  ADD COLUMN IF NOT EXISTS page_path   TEXT,
  ADD COLUMN IF NOT EXISTS campaign    TEXT,
  ADD COLUMN IF NOT EXISTS device_type TEXT,
  ADD COLUMN IF NOT EXISTS session_id  TEXT;
