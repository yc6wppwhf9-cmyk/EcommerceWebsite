-- Run this in Supabase SQL Editor
ALTER TABLE orders ADD COLUMN IF NOT EXISTS return_reason TEXT;

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','return_requested','returned'));
