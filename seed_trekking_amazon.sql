-- ═══════════════════════════════════════════════════════════════
-- Priority Bags — Seed Amazon Trekking & Adventure Rucksack Bags
-- Categories: Trekking Backpacks (Fortuner, Mount, Commando Series)
-- ═══════════════════════════════════════════════════════════════

-- 1. Ensure Categories Exist
INSERT INTO categories (id, slug, title, subtitle, bg_color, is_active)
VALUES 
  (uuid_generate_v4(), 'trekking-backpacks', 'Trekking Backpacks', 'Outdoor adventure rucksacks', '#ff7675', true),
  (uuid_generate_v4(), 'backpacks', 'Backpacks', 'Everyday, School, College & Travel Gear', '#ff7675', true)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  bg_color = EXCLUDED.bg_color,
  is_active = true;

INSERT INTO products (
  id, sku, slug, name, description, price, original_price, category_id,
  image, images, colors, features, specifications, rating, review_count,
  stock, is_new, is_highlighted, is_premium, gender, age_range, sub_category, amazon_url, is_active
) VALUES (
  uuid_generate_v4(),
  'INV27967',
  'priority-fortuner-001-trekking-bag-dgr-inv27967',
  'Priority Fortuner 001 Trekking Bag  DGR',
  'The Priority Fortuner 001 Trekking Bag  DGR is a premium Heavy-duty Trekking & Adventure Rucksack from Priority. Crafted with durable materials and ergonomic styling, it delivers comfort, reliable performance, and great everyday style.',
  0,
  0,
  (SELECT id FROM categories WHERE slug = 'trekking-backpacks' LIMIT 1),
  'https://m.media-amazon.com/images/I/61j9QOeH3ZL.jpg',
  '["https://m.media-amazon.com/images/I/61j9QOeH3ZL.jpg"]'::jsonb,
  '[{"name": "Fortuner", "code": "#111111", "images": ["https://m.media-amazon.com/images/I/61j9QOeH3ZL.jpg"]}]'::jsonb,
  '["Ergonomic padded shoulder straps and adjustable sternum buckle", "High-capacity multi-compartment storage with gear loops", "Water-resistant rugged exterior fabric", "Reinforced load-bearing seams & heavy-duty hardware"]'::jsonb,
  '{"Brand": "Priority", "Category": "Trekking Rucksack", "Material": "Water-Resistant High-Density Polyester", "Closure": "Zipper & Quick-Release Buckles", "Ideal For": "Trekking, Hiking, Camping, Adventure Travel", "Warranty": "1 Year Manufacturer Warranty", "SKU": "INV27967", "Family": "Fortuner", "ASIN": "B0H688YRHD"}'::jsonb,
  4.5,
  12,
  100,
  false,
  false,
  false,
  'unisex',
  '11 Years & Above',
  'trekking-backpacks',
  'https://www.amazon.in/dp/B0H688YRHD',
  true
)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  category_id = EXCLUDED.category_id,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  colors = EXCLUDED.colors,
  features = EXCLUDED.features,
  specifications = EXCLUDED.specifications,
  gender = EXCLUDED.gender,
  age_range = EXCLUDED.age_range,
  sub_category = EXCLUDED.sub_category,
  amazon_url = EXCLUDED.amazon_url,
  is_active = true;

INSERT INTO products (
  id, sku, slug, name, description, price, original_price, category_id,
  image, images, colors, features, specifications, rating, review_count,
  stock, is_new, is_highlighted, is_premium, gender, age_range, sub_category, amazon_url, is_active
) VALUES (
  uuid_generate_v4(),
  'INV27969',
  'priority-fortuner-001-trekking-bag-nbl-inv27969',
  'Priority Fortuner 001 Trekking Bag  NBL',
  'The Priority Fortuner 001 Trekking Bag  NBL is a premium Heavy-duty Trekking & Adventure Rucksack from Priority. Crafted with durable materials and ergonomic styling, it delivers comfort, reliable performance, and great everyday style.',
  0,
  0,
  (SELECT id FROM categories WHERE slug = 'trekking-backpacks' LIMIT 1),
  'https://m.media-amazon.com/images/I/716bSWb8dUL.jpg',
  '["https://m.media-amazon.com/images/I/716bSWb8dUL.jpg", "https://m.media-amazon.com/images/I/71e8Aq-44qL.jpg", "https://m.media-amazon.com/images/I/7117UlGAniL.jpg", "https://m.media-amazon.com/images/I/71wbguWUhzL.jpg", "https://m.media-amazon.com/images/I/71ZSh1BEFKL.jpg", "https://m.media-amazon.com/images/I/61wdUtp9HzL.jpg", "https://m.media-amazon.com/images/I/71sPflFoAWL.jpg"]'::jsonb,
  '[{"name": "Fortuner", "code": "#111111", "images": ["https://m.media-amazon.com/images/I/716bSWb8dUL.jpg", "https://m.media-amazon.com/images/I/71e8Aq-44qL.jpg", "https://m.media-amazon.com/images/I/7117UlGAniL.jpg", "https://m.media-amazon.com/images/I/71wbguWUhzL.jpg", "https://m.media-amazon.com/images/I/71ZSh1BEFKL.jpg", "https://m.media-amazon.com/images/I/61wdUtp9HzL.jpg", "https://m.media-amazon.com/images/I/71sPflFoAWL.jpg"]}]'::jsonb,
  '["Ergonomic padded shoulder straps and adjustable sternum buckle", "High-capacity multi-compartment storage with gear loops", "Water-resistant rugged exterior fabric", "Reinforced load-bearing seams & heavy-duty hardware"]'::jsonb,
  '{"Brand": "Priority", "Category": "Trekking Rucksack", "Material": "Water-Resistant High-Density Polyester", "Closure": "Zipper & Quick-Release Buckles", "Ideal For": "Trekking, Hiking, Camping, Adventure Travel", "Warranty": "1 Year Manufacturer Warranty", "SKU": "INV27969", "Family": "Fortuner", "ASIN": "B0H681K9VC"}'::jsonb,
  4.5,
  12,
  100,
  false,
  false,
  false,
  'unisex',
  '11 Years & Above',
  'trekking-backpacks',
  'https://www.amazon.in/dp/B0H681K9VC',
  true
)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  category_id = EXCLUDED.category_id,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  colors = EXCLUDED.colors,
  features = EXCLUDED.features,
  specifications = EXCLUDED.specifications,
  gender = EXCLUDED.gender,
  age_range = EXCLUDED.age_range,
  sub_category = EXCLUDED.sub_category,
  amazon_url = EXCLUDED.amazon_url,
  is_active = true;

INSERT INTO products (
  id, sku, slug, name, description, price, original_price, category_id,
  image, images, colors, features, specifications, rating, review_count,
  stock, is_new, is_highlighted, is_premium, gender, age_range, sub_category, amazon_url, is_active
) VALUES (
  uuid_generate_v4(),
  'INV28000',
  'priority-mount-001-trekking-bag-dgr-inv28000',
  'Priority Mount 001 Trekking Bag  DGR',
  'The Priority Mount 001 Trekking Bag  DGR is a premium Heavy-duty Trekking & Adventure Rucksack from Priority. Crafted with durable materials and ergonomic styling, it delivers comfort, reliable performance, and great everyday style.',
  0,
  0,
  (SELECT id FROM categories WHERE slug = 'trekking-backpacks' LIMIT 1),
  'https://m.media-amazon.com/images/I/81s3QBSkoUL.jpg',
  '["https://m.media-amazon.com/images/I/81s3QBSkoUL.jpg", "https://m.media-amazon.com/images/I/71645DD0OuL.jpg", "https://m.media-amazon.com/images/I/71irvftU6tL.jpg", "https://m.media-amazon.com/images/I/81gDNbnkWLL.jpg", "https://m.media-amazon.com/images/I/71+2oXoui0L.jpg", "https://m.media-amazon.com/images/I/61P6wY8suPL.jpg", "https://m.media-amazon.com/images/I/71ywjRB6TTL.jpg"]'::jsonb,
  '[{"name": "Mount", "code": "#111111", "images": ["https://m.media-amazon.com/images/I/81s3QBSkoUL.jpg", "https://m.media-amazon.com/images/I/71645DD0OuL.jpg", "https://m.media-amazon.com/images/I/71irvftU6tL.jpg", "https://m.media-amazon.com/images/I/81gDNbnkWLL.jpg", "https://m.media-amazon.com/images/I/71+2oXoui0L.jpg", "https://m.media-amazon.com/images/I/61P6wY8suPL.jpg", "https://m.media-amazon.com/images/I/71ywjRB6TTL.jpg"]}]'::jsonb,
  '["Ergonomic padded shoulder straps and adjustable sternum buckle", "High-capacity multi-compartment storage with gear loops", "Water-resistant rugged exterior fabric", "Reinforced load-bearing seams & heavy-duty hardware"]'::jsonb,
  '{"Brand": "Priority", "Category": "Trekking Rucksack", "Material": "Water-Resistant High-Density Polyester", "Closure": "Zipper & Quick-Release Buckles", "Ideal For": "Trekking, Hiking, Camping, Adventure Travel", "Warranty": "1 Year Manufacturer Warranty", "SKU": "INV28000", "Family": "Mount", "ASIN": "B0H62KNXX5"}'::jsonb,
  4.5,
  12,
  100,
  false,
  false,
  false,
  'unisex',
  '11 Years & Above',
  'trekking-backpacks',
  'https://www.amazon.in/dp/B0H62KNXX5',
  true
)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  category_id = EXCLUDED.category_id,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  colors = EXCLUDED.colors,
  features = EXCLUDED.features,
  specifications = EXCLUDED.specifications,
  gender = EXCLUDED.gender,
  age_range = EXCLUDED.age_range,
  sub_category = EXCLUDED.sub_category,
  amazon_url = EXCLUDED.amazon_url,
  is_active = true;

INSERT INTO products (
  id, sku, slug, name, description, price, original_price, category_id,
  image, images, colors, features, specifications, rating, review_count,
  stock, is_new, is_highlighted, is_premium, gender, age_range, sub_category, amazon_url, is_active
) VALUES (
  uuid_generate_v4(),
  'INV27999',
  'priority-mount-001-trekking-bag-dgrn-inv27999',
  'Priority Mount 001 Trekking Bag  DGRN',
  'The Priority Mount 001 Trekking Bag  DGRN is a premium Heavy-duty Trekking & Adventure Rucksack from Priority. Crafted with durable materials and ergonomic styling, it delivers comfort, reliable performance, and great everyday style.',
  0,
  0,
  (SELECT id FROM categories WHERE slug = 'trekking-backpacks' LIMIT 1),
  'https://m.media-amazon.com/images/I/81SlrFUVzbL.jpg',
  '["https://m.media-amazon.com/images/I/81SlrFUVzbL.jpg", "https://m.media-amazon.com/images/I/716u8SIvY1L.jpg", "https://m.media-amazon.com/images/I/71IHeyUWgeL.jpg", "https://m.media-amazon.com/images/I/71VSfoGSYZL.jpg", "https://m.media-amazon.com/images/I/710D8oQIHhL.jpg", "https://m.media-amazon.com/images/I/61Zbj6uoBDL.jpg", "https://m.media-amazon.com/images/I/71fvag315-L.jpg"]'::jsonb,
  '[{"name": "Mount", "code": "#111111", "images": ["https://m.media-amazon.com/images/I/81SlrFUVzbL.jpg", "https://m.media-amazon.com/images/I/716u8SIvY1L.jpg", "https://m.media-amazon.com/images/I/71IHeyUWgeL.jpg", "https://m.media-amazon.com/images/I/71VSfoGSYZL.jpg", "https://m.media-amazon.com/images/I/710D8oQIHhL.jpg", "https://m.media-amazon.com/images/I/61Zbj6uoBDL.jpg", "https://m.media-amazon.com/images/I/71fvag315-L.jpg"]}]'::jsonb,
  '["Ergonomic padded shoulder straps and adjustable sternum buckle", "High-capacity multi-compartment storage with gear loops", "Water-resistant rugged exterior fabric", "Reinforced load-bearing seams & heavy-duty hardware"]'::jsonb,
  '{"Brand": "Priority", "Category": "Trekking Rucksack", "Material": "Water-Resistant High-Density Polyester", "Closure": "Zipper & Quick-Release Buckles", "Ideal For": "Trekking, Hiking, Camping, Adventure Travel", "Warranty": "1 Year Manufacturer Warranty", "SKU": "INV27999", "Family": "Mount", "ASIN": "B0H62R61XT"}'::jsonb,
  4.5,
  12,
  100,
  false,
  false,
  false,
  'unisex',
  '11 Years & Above',
  'trekking-backpacks',
  'https://www.amazon.in/dp/B0H62R61XT',
  true
)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  category_id = EXCLUDED.category_id,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  colors = EXCLUDED.colors,
  features = EXCLUDED.features,
  specifications = EXCLUDED.specifications,
  gender = EXCLUDED.gender,
  age_range = EXCLUDED.age_range,
  sub_category = EXCLUDED.sub_category,
  amazon_url = EXCLUDED.amazon_url,
  is_active = true;

INSERT INTO products (
  id, sku, slug, name, description, price, original_price, category_id,
  image, images, colors, features, specifications, rating, review_count,
  stock, is_new, is_highlighted, is_premium, gender, sub_category, myntra_url, is_active
) VALUES (
  uuid_generate_v4(),
  'INV28622',
  'priority-commando-001-trekking-bag-dgrn-inv28622',
  'Priority Commando 001 Trekking Bag  DGRN',
  'Priority Commando 001 Trekking Bag  DGRN',
  1499,
  2099,
  (SELECT id FROM categories WHERE slug = 'trekking-backpacks' LIMIT 1),
  '/products/INV28622/INV28622 - 01 - Front View.jpg',
  '["/products/INV28622/INV28622 - 01 - Front View.jpg", "/products/INV28622/INV28622 - 02 - Side View.jpg", "/products/INV28622/INV28622 - 03 - Back & Straps.jpg", "/products/INV28622/INV28622 - 04 - Main Compartment.jpg", "/products/INV28622/INV28622 - 05 - Detail & Pockets.jpg", "/products/INV28622/INV28622 - 06 - Zippers & Hardware.jpg", "/products/INV28622/INV28622 - 07 - Bottom Base.jpg", "/products/INV28622/INV28622 - 08 - Alternate Angle.jpg"]'::jsonb,
  '[{"name": "Commando", "code": "#111111", "images": ["/products/INV28622/INV28622 - 01 - Front View.jpg", "/products/INV28622/INV28622 - 02 - Side View.jpg", "/products/INV28622/INV28622 - 03 - Back & Straps.jpg", "/products/INV28622/INV28622 - 04 - Main Compartment.jpg", "/products/INV28622/INV28622 - 05 - Detail & Pockets.jpg", "/products/INV28622/INV28622 - 06 - Zippers & Hardware.jpg", "/products/INV28622/INV28622 - 07 - Bottom Base.jpg", "/products/INV28622/INV28622 - 08 - Alternate Angle.jpg"]}]'::jsonb,
  '["Ergonomic padded shoulder straps with breathable mesh","Multi-compartment organization with dedicated sleeves","Water-resistant heavy-duty exterior fabric","Reinforced load-bearing seams & premium smooth zippers"]'::jsonb,
  '{"Brand":"Priority","Model":"Priority Commando 001 Trekking Bag  DGRN","SKU":"INV28622","Family":"Commando","Material":"Durable High-Grade Polyester / Polycarbonate","Warranty":"1 Year Manufacturer Warranty","Country of Origin":"India","Closure":"Zipper"}'::jsonb,
  4.5,
  18,
  50,
  false,
  false,
  false,
  'unisex',
  'trekking-backpacks',
  'https://www.myntra.com/40246561',
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
  sub_category = EXCLUDED.sub_category,
  is_premium = EXCLUDED.is_premium,
  gender = EXCLUDED.gender,
  myntra_url = EXCLUDED.myntra_url,
  is_active = true,
  updated_at = NOW();

INSERT INTO products (
  id, sku, slug, name, description, price, original_price, category_id,
  image, images, colors, features, specifications, rating, review_count,
  stock, is_new, is_highlighted, is_premium, gender, sub_category, myntra_url, is_active
) VALUES (
  uuid_generate_v4(),
  'INV28623',
  'priority-commando-001-trekking-bag-blk-inv28623',
  'Priority Commando 001 Trekking Bag  BLK',
  'Priority Unisex Camouflage Printed Backpack with Hip Strap & Rain Cover',
  899,
  899,
  (SELECT id FROM categories WHERE slug = 'trekking-backpacks' LIMIT 1),
  '/products/INV28623/INV28623 - 01 - Front View.jpg',
  '["/products/INV28623/INV28623 - 01 - Front View.jpg", "/products/INV28623/INV28623 - 02 - Side View.jpg", "/products/INV28623/INV28623 - 03 - Back & Straps.jpg", "/products/INV28623/INV28623 - 04 - Main Compartment.jpg", "/products/INV28623/INV28623 - 05 - Detail & Pockets.jpg", "/products/INV28623/INV28623 - 06 - Zippers & Hardware.jpg", "/products/INV28623/INV28623 - 07 - Bottom Base.jpg", "/products/INV28623/INV28623 - 08 - Alternate Angle.jpg"]'::jsonb,
  '[{"name": "Commando", "code": "#111111", "images": ["/products/INV28623/INV28623 - 01 - Front View.jpg", "/products/INV28623/INV28623 - 02 - Side View.jpg", "/products/INV28623/INV28623 - 03 - Back & Straps.jpg", "/products/INV28623/INV28623 - 04 - Main Compartment.jpg", "/products/INV28623/INV28623 - 05 - Detail & Pockets.jpg", "/products/INV28623/INV28623 - 06 - Zippers & Hardware.jpg", "/products/INV28623/INV28623 - 07 - Bottom Base.jpg", "/products/INV28623/INV28623 - 08 - Alternate Angle.jpg"]}]'::jsonb,
  '["Ergonomic padded shoulder straps with breathable mesh","Multi-compartment organization with dedicated sleeves","Water-resistant heavy-duty exterior fabric","Reinforced load-bearing seams & premium smooth zippers"]'::jsonb,
  '{"Brand":"Priority","Model":"Priority Commando 001 Trekking Bag  BLK","SKU":"INV28623","Family":"Commando","Material":"Durable High-Grade Polyester / Polycarbonate","Warranty":"1 Year Manufacturer Warranty","Country of Origin":"India","Closure":"Zipper"}'::jsonb,
  4.5,
  18,
  50,
  false,
  false,
  false,
  'unisex',
  'trekking-backpacks',
  'https://www.myntra.com/40246563',
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
  sub_category = EXCLUDED.sub_category,
  is_premium = EXCLUDED.is_premium,
  gender = EXCLUDED.gender,
  myntra_url = EXCLUDED.myntra_url,
  is_active = true,
  updated_at = NOW();

