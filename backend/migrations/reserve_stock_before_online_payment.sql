-- Run this in Supabase SQL Editor before deploying the backend change.

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','return_requested','returned'));

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

  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, name VARCHAR, price DECIMAL, quantity INT, image VARCHAR)
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

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql;

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
