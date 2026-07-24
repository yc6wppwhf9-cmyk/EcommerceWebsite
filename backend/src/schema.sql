-- ═══════════════════════════════════════════════════════════════
-- Priority Bags — PostgreSQL Production Schema
-- Run: psql -U postgres -d priority_bags -f schema.sql
-- ═══════════════════════════════════════════════════════════════

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fuzzy text search

-- ─── Users ───────────────────────────────────────────────────
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  phone       VARCHAR(20),
  password    VARCHAR(255) NOT NULL,  -- bcrypt hash
  role        VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  is_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(255),
  reset_token VARCHAR(255),
  reset_token_expires TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ─── Addresses ───────────────────────────────────────────────
CREATE TABLE addresses (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label       VARCHAR(50) DEFAULT 'Home',
  line1       VARCHAR(255) NOT NULL,
  line2       VARCHAR(255),
  city        VARCHAR(100) NOT NULL,
  state       VARCHAR(100) NOT NULL,
  pincode     VARCHAR(10) NOT NULL,
  phone       VARCHAR(20) NOT NULL,
  is_default  BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_addresses_user ON addresses(user_id);

-- ─── Categories ──────────────────────────────────────────────
CREATE TABLE categories (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug            VARCHAR(100) UNIQUE NOT NULL,
  title           VARCHAR(100) NOT NULL,
  subtitle        VARCHAR(100) NOT NULL,
  description     TEXT,
  image           VARCHAR(500),
  bg_color        VARCHAR(20) DEFAULT '#f2c94c',
  parent_id       UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order      INT DEFAULT 0,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- ─── Products ────────────────────────────────────────────────
CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku             VARCHAR(50) UNIQUE NOT NULL,
  slug            VARCHAR(255) UNIQUE NOT NULL,
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  price           DECIMAL(10,2) NOT NULL,
  original_price  DECIMAL(10,2) NOT NULL,
  category_id     UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  image           VARCHAR(500) NOT NULL,
  images          JSONB DEFAULT '[]',
  colors          JSONB DEFAULT '[]',
  features        JSONB DEFAULT '[]',
  specifications  JSONB DEFAULT '{}',
  rating          DECIMAL(2,1) DEFAULT 0.0,
  review_count    INT DEFAULT 0,
  stock           INT DEFAULT 0,
  is_new          BOOLEAN DEFAULT false,
  is_highlighted  BOOLEAN DEFAULT false,
  is_premium      BOOLEAN DEFAULT false,
  gender          VARCHAR(20) DEFAULT 'unisex',
  size            VARCHAR(50),
  age_range       VARCHAR(50),
  sub_category    VARCHAR(100),
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_rating ON products(rating DESC);
CREATE INDEX idx_products_name_trgm ON products USING gin (name gin_trgm_ops);
CREATE INDEX idx_products_active_created ON products(is_active, created_at DESC);
CREATE INDEX idx_products_active_category_created ON products(is_active, category_id, created_at DESC);
CREATE INDEX idx_products_active_sub_category_created ON products(is_active, sub_category, created_at DESC);
CREATE INDEX idx_products_active_premium_created ON products(is_active, is_premium, created_at DESC);
CREATE INDEX idx_products_active_gender_created ON products(is_active, gender, created_at DESC);
CREATE INDEX idx_products_active_size_created ON products(is_active, size, created_at DESC);
CREATE INDEX idx_products_active_popular ON products(is_active, review_count DESC, rating DESC);

-- ─── Product Reviews ─────────────────────────────────────────
CREATE TABLE reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating      INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title       VARCHAR(255),
  body        TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (product_id, user_id)  -- one review per user per product
);

CREATE INDEX idx_reviews_product ON reviews(product_id);

-- ─── Orders ──────────────────────────────────────────────────
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status          VARCHAR(30) DEFAULT 'pending'
                    CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','return_requested','returned')),
  subtotal        DECIMAL(10,2) NOT NULL,
  shipping_fee    DECIMAL(10,2) DEFAULT 0,
  total           DECIMAL(10,2) NOT NULL,
  shipping_name   VARCHAR(255) NOT NULL,
  shipping_phone  VARCHAR(20) NOT NULL,
  shipping_line1  VARCHAR(255) NOT NULL,
  shipping_line2  VARCHAR(255),
  shipping_city   VARCHAR(100) NOT NULL,
  shipping_state  VARCHAR(100) NOT NULL,
  shipping_pincode VARCHAR(10) NOT NULL,
  payment_method  VARCHAR(50),
  payment_id      VARCHAR(255),  -- Razorpay payment ID
  payment_status  VARCHAR(30) DEFAULT 'pending'
                    CHECK (payment_status IN ('pending','paid','failed','refunded')),
  notes           TEXT,
  invoice_url     VARCHAR(500),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- ─── Order Items ─────────────────────────────────────────────
CREATE TABLE order_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  name        VARCHAR(255) NOT NULL,
  price       DECIMAL(10,2) NOT NULL,
  quantity    INT NOT NULL CHECK (quantity > 0),
  image       VARCHAR(500)
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ─── Wishlist ────────────────────────────────────────────────
CREATE TABLE wishlists (
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, product_id)
);

-- ─── Cart (server-side, optional) ────────────────────────────
CREATE TABLE cart_items (
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity    INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, product_id)
);

-- ─── Function: Atomic Order Creation ───────────────────────
CREATE OR REPLACE FUNCTION create_order_v2(
  p_user_id UUID,
  p_subtotal DECIMAL,
  p_shipping_fee DECIMAL,
  p_total DECIMAL,
  p_shipping_name VARCHAR,
  p_shipping_phone VARCHAR,
  p_shipping_line1 VARCHAR,
  p_shipping_line2 VARCHAR,
  p_shipping_city VARCHAR,
  p_shipping_state VARCHAR,
  p_shipping_pincode VARCHAR,
  p_payment_method VARCHAR,
  p_payment_id VARCHAR,
  p_notes TEXT,
  p_items JSONB
) RETURNS UUID AS $$
DECLARE
  v_order_id UUID;
  v_item RECORD;
BEGIN
  -- 1. Insert Order
  INSERT INTO orders (
    user_id, subtotal, shipping_fee, total,
    shipping_name, shipping_phone, shipping_line1, shipping_line2,
    shipping_city, shipping_state, shipping_pincode,
    payment_method, payment_id, notes, status, payment_status
  ) VALUES (
    p_user_id, p_subtotal, p_shipping_fee, p_total,
    p_shipping_name, p_shipping_phone, p_shipping_line1, p_shipping_line2,
    p_shipping_city, p_shipping_state, p_shipping_pincode,
    p_payment_method, p_payment_id, p_notes,
    CASE WHEN p_payment_method = 'online' THEN 'pending' ELSE 'confirmed' END,
    'pending'
  ) RETURNING id INTO v_order_id;

  -- 2. Insert Items and Decrement Stock
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, name VARCHAR, price DECIMAL, quantity INT, image VARCHAR)
  LOOP
    INSERT INTO order_items (order_id, product_id, name, price, quantity, image)
    VALUES (v_order_id, v_item.product_id, v_item.name, v_item.price, v_item.quantity, v_item.image);

    -- Atomic decrement (reuse logic or inline)
    UPDATE products
    SET stock = stock - v_item.quantity,
        updated_at = NOW()
    WHERE id = v_item.product_id AND stock >= v_item.quantity;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Insufficient stock for product %', v_item.product_id;
    END IF;
  END LOOP;

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql;

-- ─── Function: Atomic Stock Decrement ───────────────────────
CREATE OR REPLACE FUNCTION release_expired_payment_reservations(
  p_older_than INTERVAL DEFAULT INTERVAL '20 minutes'
) RETURNS INT AS $$
DECLARE
  v_order RECORD;
  v_item RECORD;
  v_released INT := 0;
BEGIN
  FOR v_order IN
    SELECT id
    FROM orders
    WHERE payment_method = 'online'
      AND status = 'pending'
      AND payment_status = 'pending'
      AND created_at < NOW() - p_older_than
    FOR UPDATE SKIP LOCKED
  LOOP
    FOR v_item IN
      SELECT product_id, quantity
      FROM order_items
      WHERE order_id = v_order.id
    LOOP
      UPDATE products
      SET stock = stock + v_item.quantity,
          updated_at = NOW()
      WHERE id = v_item.product_id;
    END LOOP;

    UPDATE orders
    SET status = 'cancelled',
        payment_status = 'failed',
        updated_at = NOW()
    WHERE id = v_order.id;

    v_released := v_released + 1;
  END LOOP;

  RETURN v_released;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_stock(product_id UUID, qty INT)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET stock = stock - qty,
      updated_at = NOW()
  WHERE id = product_id AND stock >= qty;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for product %', product_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ─── Trigger: update product rating on review change ─────────
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products SET
    rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)), 0),
    review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- ─── Trigger: auto-update updated_at ─────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated    BEFORE UPDATE ON users    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_orders_updated   BEFORE UPDATE ON orders   FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Jobs ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        VARCHAR(255) NOT NULL,
  description  TEXT NOT NULL,
  location     VARCHAR(100) NOT NULL,
  department   VARCHAR(100),
  job_type     VARCHAR(50) CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship')),
  salary_min   DECIMAL(10,2),
  salary_max   DECIMAL(10,2),
  requirements TEXT,
  status       VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('open', 'closed', 'draft')),
  posted_by    UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);

-- ─── Applications ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id           UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_name   VARCHAR(255) NOT NULL,
  applicant_email  VARCHAR(255) NOT NULL,
  applicant_phone  VARCHAR(30),
  cover_letter     TEXT,
  resume_url       VARCHAR(500),
  status           VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'shortlisted', 'rejected', 'hired')),
  applied_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_job    ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_email  ON applications(applicant_email);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

CREATE TRIGGER trg_jobs_updated         BEFORE UPDATE ON jobs         FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_applications_updated BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Site Settings ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default premium editorial banner config
INSERT INTO site_settings (key, value) VALUES
  ('premium_editorial_banner', '{"category": "luggage", "label": "Luggage", "url": "/luggage?theme=premium"}')
ON CONFLICT (key) DO NOTHING;

CREATE TRIGGER trg_site_settings_updated BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Coupons ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupons (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            VARCHAR(50) UNIQUE NOT NULL,
  discount_type   VARCHAR(10) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value  DECIMAL(10,2) NOT NULL,
  max_uses        INT,
  used_count      INT DEFAULT 0,
  min_cart_value  DECIMAL(10,2),
  start_date      TIMESTAMPTZ,
  end_date        TIMESTAMPTZ,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coupon_uses (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id   UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id    UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupon_uses_user   ON coupon_uses(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_uses_coupon ON coupon_uses(coupon_id);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_id       UUID REFERENCES coupons(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_discount DECIMAL(10,2) DEFAULT 0;

ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS abandoned_email_sent_at TIMESTAMPTZ;

CREATE TRIGGER trg_coupons_updated BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Support tickets ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS support_tickets (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number     VARCHAR(32) UNIQUE NOT NULL,
  type              VARCHAR(20) NOT NULL CHECK (type IN ('contact', 'warranty')),
  name              VARCHAR(120) NOT NULL,
  email             VARCHAR(254) NOT NULL,
  phone             VARCHAR(20),
  order_reference   VARCHAR(100),
  product_name      VARCHAR(200),
  purchase_date     DATE,
  subject           VARCHAR(200) NOT NULL,
  message           TEXT NOT NULL,
  status            VARCHAR(30) NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open', 'in_review', 'waiting_customer', 'resolved', 'closed')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_email ON support_tickets (email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets (status, created_at DESC);
CREATE TRIGGER trg_support_tickets_updated BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Coupon-aware atomic order creation ──────────────────────
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR;
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_unique_razorpay_order_id
  ON orders(razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_unique_payment_id
  ON orders(payment_id) WHERE payment_id IS NOT NULL;

DROP FUNCTION IF EXISTS create_order_v3(
  UUID, DECIMAL, DECIMAL, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR,
  VARCHAR, VARCHAR, VARCHAR, VARCHAR, TEXT, JSONB, UUID
);

CREATE OR REPLACE FUNCTION create_order_v3(
  p_user_id UUID,
  p_subtotal DECIMAL,
  p_shipping_fee DECIMAL,
  p_shipping_name VARCHAR,
  p_shipping_phone VARCHAR,
  p_shipping_line1 VARCHAR,
  p_shipping_line2 VARCHAR,
  p_shipping_city VARCHAR,
  p_shipping_state VARCHAR,
  p_shipping_pincode VARCHAR,
  p_payment_method VARCHAR,
  p_payment_id VARCHAR,
  p_razorpay_order_id VARCHAR,
  p_notes TEXT,
  p_items JSONB,
  p_coupon_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_order_id UUID;
  v_item RECORD;
  v_coupon coupons%ROWTYPE;
  v_discount DECIMAL(10,2) := 0;
  v_total DECIMAL(10,2);
BEGIN
  IF p_coupon_id IS NOT NULL THEN
    SELECT * INTO v_coupon FROM coupons WHERE id = p_coupon_id FOR UPDATE;

    IF NOT FOUND OR NOT v_coupon.is_active THEN RAISE EXCEPTION 'Invalid or expired coupon code'; END IF;
    IF v_coupon.start_date IS NOT NULL AND v_coupon.start_date > NOW() THEN RAISE EXCEPTION 'This coupon is not active yet'; END IF;
    IF v_coupon.end_date IS NOT NULL AND v_coupon.end_date < NOW() THEN RAISE EXCEPTION 'This coupon has expired'; END IF;
    IF v_coupon.max_uses IS NOT NULL AND v_coupon.used_count >= v_coupon.max_uses THEN RAISE EXCEPTION 'This coupon has reached its usage limit'; END IF;
    IF v_coupon.min_cart_value IS NOT NULL AND p_subtotal < v_coupon.min_cart_value THEN RAISE EXCEPTION 'Minimum cart value of ₹% required', v_coupon.min_cart_value; END IF;
    IF EXISTS (SELECT 1 FROM coupon_uses WHERE coupon_id = p_coupon_id AND user_id = p_user_id) THEN RAISE EXCEPTION 'You have already used this coupon'; END IF;

    v_discount := CASE
      WHEN v_coupon.discount_type = 'percentage' THEN LEAST(p_subtotal, ROUND(p_subtotal * LEAST(v_coupon.discount_value, 100) / 100, 2))
      ELSE LEAST(p_subtotal, v_coupon.discount_value)
    END;
  END IF;

  v_total := GREATEST(0, p_subtotal + p_shipping_fee - v_discount);

  INSERT INTO orders (
    user_id, subtotal, shipping_fee, coupon_id, coupon_discount, total,
    shipping_name, shipping_phone, shipping_line1, shipping_line2,
    shipping_city, shipping_state, shipping_pincode,
    payment_method, payment_id, razorpay_order_id, notes, status, payment_status
  ) VALUES (
    p_user_id, p_subtotal, p_shipping_fee, p_coupon_id, v_discount, v_total,
    p_shipping_name, p_shipping_phone, p_shipping_line1, p_shipping_line2,
    p_shipping_city, p_shipping_state, p_shipping_pincode,
    p_payment_method, p_payment_id, p_razorpay_order_id, p_notes,
    CASE WHEN p_payment_method = 'online' THEN 'pending' ELSE 'confirmed' END,
    'pending'
  ) RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, name VARCHAR, price DECIMAL, quantity INT, image VARCHAR)
  LOOP
    INSERT INTO order_items (order_id, product_id, name, price, quantity, image)
    VALUES (v_order_id, v_item.product_id, v_item.name, v_item.price, v_item.quantity, v_item.image);

    UPDATE products SET stock = stock - v_item.quantity, updated_at = NOW()
    WHERE id = v_item.product_id AND stock >= v_item.quantity;
    IF NOT FOUND THEN RAISE EXCEPTION 'Insufficient stock for product %', v_item.product_id; END IF;
  END LOOP;

  IF p_coupon_id IS NOT NULL THEN
    INSERT INTO coupon_uses (coupon_id, user_id, order_id) VALUES (p_coupon_id, p_user_id, v_order_id);
    UPDATE coupons SET used_count = used_count + 1, updated_at = NOW() WHERE id = p_coupon_id;
  END IF;

  RETURN jsonb_build_object('order_id', v_order_id, 'subtotal', p_subtotal, 'shipping_fee', p_shipping_fee, 'coupon_discount', v_discount, 'total', v_total);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION release_expired_payment_reservations(
  p_older_than INTERVAL DEFAULT INTERVAL '20 minutes'
) RETURNS INT AS $$
DECLARE
  v_order RECORD;
  v_item RECORD;
  v_released INT := 0;
  v_coupon_rows INT := 0;
BEGIN
  FOR v_order IN
    SELECT id, coupon_id FROM orders
    WHERE payment_method = 'online' AND status = 'pending' AND payment_status = 'pending'
      AND created_at < NOW() - p_older_than
    FOR UPDATE SKIP LOCKED
  LOOP
    FOR v_item IN SELECT product_id, quantity FROM order_items WHERE order_id = v_order.id
    LOOP
      UPDATE products SET stock = stock + v_item.quantity, updated_at = NOW() WHERE id = v_item.product_id;
    END LOOP;

    IF v_order.coupon_id IS NOT NULL THEN
      DELETE FROM coupon_uses WHERE order_id = v_order.id AND coupon_id = v_order.coupon_id;
      GET DIAGNOSTICS v_coupon_rows = ROW_COUNT;
      IF v_coupon_rows > 0 THEN
        UPDATE coupons SET used_count = GREATEST(used_count - 1, 0), updated_at = NOW() WHERE id = v_order.coupon_id;
      END IF;
    END IF;

    UPDATE orders SET status = 'cancelled', payment_status = 'failed', updated_at = NOW() WHERE id = v_order.id;
    v_released := v_released + 1;
  END LOOP;
  RETURN v_released;
END;
$$ LANGUAGE plpgsql;
