-- Run this in Supabase SQL Editor
-- Adds Flipkart/Myntra/Ajio redirect links + click counters alongside the existing
-- (already out-of-band) amazon_url/amazon_clicks columns, and a combined total_clicks
-- column that the "bestseller" sort now orders by.

ALTER TABLE products ADD COLUMN IF NOT EXISTS flipkart_url VARCHAR(500);
ALTER TABLE products ADD COLUMN IF NOT EXISTS myntra_url VARCHAR(500);
ALTER TABLE products ADD COLUMN IF NOT EXISTS ajio_url VARCHAR(500);

ALTER TABLE products ADD COLUMN IF NOT EXISTS flipkart_clicks INT DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS myntra_clicks INT DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS ajio_clicks INT DEFAULT 0;

-- amazon_clicks already exists on this table (added out-of-band); default it defensively
-- in case any row still has it null, since the generated column below sums it.
ALTER TABLE products ALTER COLUMN amazon_clicks SET DEFAULT 0;
UPDATE products SET amazon_clicks = 0 WHERE amazon_clicks IS NULL;

ALTER TABLE products DROP COLUMN IF EXISTS total_clicks;
ALTER TABLE products ADD COLUMN total_clicks INT GENERATED ALWAYS AS (
  COALESCE(amazon_clicks, 0) + COALESCE(flipkart_clicks, 0) + COALESCE(myntra_clicks, 0) + COALESCE(ajio_clicks, 0)
) STORED;

CREATE INDEX IF NOT EXISTS idx_products_active_total_clicks ON products(is_active, total_clicks DESC);
