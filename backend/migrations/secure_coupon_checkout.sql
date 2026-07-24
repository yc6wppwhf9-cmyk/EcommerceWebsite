-- Run this in Supabase SQL Editor before deploying the matching backend.
-- It makes coupon validation, coupon usage, stock reservation, and final totals
-- part of the same database transaction.

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
    SELECT * INTO v_coupon
    FROM coupons
    WHERE id = p_coupon_id
    FOR UPDATE;

    IF NOT FOUND OR NOT v_coupon.is_active THEN
      RAISE EXCEPTION 'Invalid or expired coupon code';
    END IF;
    IF v_coupon.start_date IS NOT NULL AND v_coupon.start_date > NOW() THEN
      RAISE EXCEPTION 'This coupon is not active yet';
    END IF;
    IF v_coupon.end_date IS NOT NULL AND v_coupon.end_date < NOW() THEN
      RAISE EXCEPTION 'This coupon has expired';
    END IF;
    IF v_coupon.max_uses IS NOT NULL AND v_coupon.used_count >= v_coupon.max_uses THEN
      RAISE EXCEPTION 'This coupon has reached its usage limit';
    END IF;
    IF v_coupon.min_cart_value IS NOT NULL AND p_subtotal < v_coupon.min_cart_value THEN
      RAISE EXCEPTION 'Minimum cart value of ₹% required', v_coupon.min_cart_value;
    END IF;
    IF EXISTS (
      SELECT 1 FROM coupon_uses
      WHERE coupon_id = p_coupon_id AND user_id = p_user_id
    ) THEN
      RAISE EXCEPTION 'You have already used this coupon';
    END IF;

    v_discount := CASE
      WHEN v_coupon.discount_type = 'percentage'
        THEN LEAST(p_subtotal, ROUND(p_subtotal * LEAST(v_coupon.discount_value, 100) / 100, 2))
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

  FOR v_item IN
    SELECT * FROM jsonb_to_recordset(p_items)
      AS x(product_id UUID, name VARCHAR, price DECIMAL, quantity INT, image VARCHAR)
  LOOP
    INSERT INTO order_items (order_id, product_id, name, price, quantity, image)
    VALUES (v_order_id, v_item.product_id, v_item.name, v_item.price, v_item.quantity, v_item.image);

    UPDATE products
    SET stock = stock - v_item.quantity,
        updated_at = NOW()
    WHERE id = v_item.product_id AND stock >= v_item.quantity;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Insufficient stock for product %', v_item.product_id;
    END IF;
  END LOOP;

  IF p_coupon_id IS NOT NULL THEN
    INSERT INTO coupon_uses (coupon_id, user_id, order_id)
    VALUES (p_coupon_id, p_user_id, v_order_id);

    UPDATE coupons
    SET used_count = used_count + 1,
        updated_at = NOW()
    WHERE id = p_coupon_id;
  END IF;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'subtotal', p_subtotal,
    'shipping_fee', p_shipping_fee,
    'coupon_discount', v_discount,
    'total', v_total
  );
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
    SELECT id, coupon_id
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

    IF v_order.coupon_id IS NOT NULL THEN
      DELETE FROM coupon_uses
      WHERE order_id = v_order.id AND coupon_id = v_order.coupon_id;
      GET DIAGNOSTICS v_coupon_rows = ROW_COUNT;

      IF v_coupon_rows > 0 THEN
        UPDATE coupons
        SET used_count = GREATEST(used_count - 1, 0),
            updated_at = NOW()
        WHERE id = v_order.coupon_id;
      END IF;
    END IF;

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
