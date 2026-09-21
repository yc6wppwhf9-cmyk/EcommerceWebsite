-- ═════════════════════════════════════════════════════════════════════════════════
-- Migration: Add / Update Priority Solo Bags in Normal (Standard) Duffle Section
-- Run this in your Supabase SQL Editor or PostgreSQL database
-- ═════════════════════════════════════════════════════════════════════════════════

-- 1. If Priority Solo products already exist in the database, update them to normal Duffle
UPDATE products
SET is_premium = false,
    sub_category = 'duffle',
    category_id = (SELECT id FROM categories WHERE slug = 'duffle' LIMIT 1),
    is_active = true,
    updated_at = NOW()
WHERE sku IN ('INV30691', 'INV30692')
   OR LOWER(name) LIKE '%solo%';

-- 2. Upsert Priority Solo 001 Travelling Bag (Black - INV30691)
INSERT INTO products (
  id, sku, slug, name, description, price, original_price, category_id,
  image, images, colors, features, specifications, rating, review_count,
  stock, is_new, is_highlighted, is_premium, gender, sub_category, myntra_url, is_active
) VALUES (
  uuid_generate_v4(),
  'INV30691',
  'priority-solo-001-travelling-bag-blk-inv30691',
  'Priority Solo 001 Travelling Bag BLK',
  'Priority Solo 001 Travelling Bag BLK - Lightweight, durable and spacious duffle bag engineered for versatile travel.',
  1499,
  2099,
  (SELECT id FROM categories WHERE slug = 'duffle' LIMIT 1),
  '/products/INV30691/INV30691 - 01 - Front View.jpg',
  '["/products/INV30691/INV30691 - 01 - Front View.jpg", "/products/INV30691/INV30691 - 02 - Side View.jpg", "/products/INV30691/INV30691 - 03 - Back & Straps.jpg", "/products/INV30691/INV30691 - 04 - Main Compartment.jpg", "/products/INV30691/INV30691 - 05 - Detail & Pockets.jpg", "/products/INV30691/INV30691 - 06 - Zippers & Hardware.jpg", "/products/INV30691/INV30691 - 07 - Bottom Base.jpg"]'::jsonb,
  '[{"name": "Black", "code": "#111111", "images": ["/products/INV30691/INV30691 - 01 - Front View.jpg", "/products/INV30691/INV30691 - 02 - Side View.jpg", "/products/INV30691/INV30691 - 03 - Back & Straps.jpg", "/products/INV30691/INV30691 - 04 - Main Compartment.jpg", "/products/INV30691/INV30691 - 05 - Detail & Pockets.jpg", "/products/INV30691/INV30691 - 06 - Zippers & Hardware.jpg", "/products/INV30691/INV30691 - 07 - Bottom Base.jpg"]}]'::jsonb,
  '["Ergonomic padded shoulder straps with breathable mesh","Multi-compartment organization with dedicated sleeves","Water-resistant heavy-duty exterior fabric","Reinforced load-bearing seams & premium smooth zippers"]'::jsonb,
  '{"Brand":"Priority","Model":"Priority Solo 001 Travelling Bag BLK","SKU":"INV30691","Family":"Solo","Material":"Durable High-Grade Polyester","Warranty":"1 Year Manufacturer Warranty","Country of Origin":"India","Closure":"Zipper"}'::jsonb,
  4.5,
  18,
  50,
  false,
  false,
  false,
  'unisex',
  'duffle',
  'https://www.myntra.com/38073647',
  true
)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  category_id = EXCLUDED.category_id,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  colors = EXCLUDED.colors,
  features = EXCLUDED.features,
  specifications = EXCLUDED.specifications,
  sub_category = 'duffle',
  is_premium = false,
  gender = EXCLUDED.gender,
  myntra_url = EXCLUDED.myntra_url,
  is_active = true,
  updated_at = NOW();

-- 3. Upsert Priority Solo 001 Travelling Bag (Navy Blue - INV30692)
INSERT INTO products (
  id, sku, slug, name, description, price, original_price, category_id,
  image, images, colors, features, specifications, rating, review_count,
  stock, is_new, is_highlighted, is_premium, gender, sub_category, myntra_url, is_active
) VALUES (
  uuid_generate_v4(),
  'INV30692',
  'priority-solo-001-travelling-bag-nbl-inv30692',
  'Priority Solo 001 Travelling Bag NBL',
  'Priority Solo 001 Travelling Bag NBL - Lightweight, durable and spacious duffle bag engineered for versatile travel.',
  1499,
  2099,
  (SELECT id FROM categories WHERE slug = 'duffle' LIMIT 1),
  '/products/INV30692/INV30692 - 01 - Front View.jpg',
  '["/products/INV30692/INV30692 - 01 - Front View.jpg", "/products/INV30692/INV30692 - 02 - Side View.jpg", "/products/INV30692/INV30692 - 03 - Back & Straps.jpg", "/products/INV30692/INV30692 - 04 - Main Compartment.jpg", "/products/INV30692/INV30692 - 05 - Detail & Pockets.jpg", "/products/INV30692/INV30692 - 06 - Zippers & Hardware.jpg", "/products/INV30692/INV30692 - 07 - Bottom Base.jpg"]'::jsonb,
  '[{"name": "Navy Blue", "code": "#1a2a44", "images": ["/products/INV30692/INV30692 - 01 - Front View.jpg", "/products/INV30692/INV30692 - 02 - Side View.jpg", "/products/INV30692/INV30692 - 03 - Back & Straps.jpg", "/products/INV30692/INV30692 - 04 - Main Compartment.jpg", "/products/INV30692/INV30692 - 05 - Detail & Pockets.jpg", "/products/INV30692/INV30692 - 06 - Zippers & Hardware.jpg", "/products/INV30692/INV30692 - 07 - Bottom Base.jpg"]}]'::jsonb,
  '["Ergonomic padded shoulder straps with breathable mesh","Multi-compartment organization with dedicated sleeves","Water-resistant heavy-duty exterior fabric","Reinforced load-bearing seams & premium smooth zippers"]'::jsonb,
  '{"Brand":"Priority","Model":"Priority Solo 001 Travelling Bag NBL","SKU":"INV30692","Family":"Solo","Material":"Durable High-Grade Polyester","Warranty":"1 Year Manufacturer Warranty","Country of Origin":"India","Closure":"Zipper"}'::jsonb,
  4.5,
  18,
  50,
  false,
  false,
  false,
  'unisex',
  'duffle',
  'https://www.myntra.com/38073648',
  true
)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  category_id = EXCLUDED.category_id,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  colors = EXCLUDED.colors,
  features = EXCLUDED.features,
  specifications = EXCLUDED.specifications,
  sub_category = 'duffle',
  is_premium = false,
  gender = EXCLUDED.gender,
  myntra_url = EXCLUDED.myntra_url,
  is_active = true,
  updated_at = NOW();
