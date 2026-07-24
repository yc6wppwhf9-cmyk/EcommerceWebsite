import { Response } from 'express';
import { supabase } from '../config/supabase';
import { resolveEligibleCoupon } from '../lib/coupon.service';
import { AuthRequest } from '../middleware/auth';

export const validateCoupon = async (req: AuthRequest, res: Response) => {
  const { code, items } = req.body as {
    code?: string;
    items?: Array<{ product_id: string; quantity: number }>;
  };
  if (!code) return res.status(400).json({ error: 'Coupon code is required' });
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart items are required to validate a coupon' });
  }

  try {
    const normalizedItems = items.map((item) => ({
      product_id: item.product_id,
      quantity: Number(item.quantity),
    }));
    if (normalizedItems.some((item) => !item.product_id || !Number.isInteger(item.quantity) || item.quantity <= 0)) {
      return res.status(400).json({ error: 'Cart contains an invalid quantity' });
    }

    const productIds = [...new Set(normalizedItems.map((item) => item.product_id))];
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, price, is_active')
      .in('id', productIds)
      .eq('is_active', true);

    if (productError || !products || products.length !== productIds.length) {
      return res.status(400).json({ error: 'Cart contains an unavailable product' });
    }

    const prices = new Map(products.map((product) => [product.id, Number(product.price)]));
    const subtotal = normalizedItems.reduce(
      (sum, item) => sum + (prices.get(item.product_id) || 0) * item.quantity,
      0,
    );

    const coupon = await resolveEligibleCoupon({
      code,
      userId: req.user!.id,
      subtotal,
    });

    res.json({
      valid: true,
      coupon_id: coupon!.id,
      code: coupon!.code,
      discount_type: coupon!.discount_type,
      discount_value: coupon!.discount_value,
      discount_amount: coupon!.discount_amount,
      cart_subtotal: subtotal,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Unable to validate coupon' });
  }
};

export const createCoupon = async (req: AuthRequest, res: Response) => {
  const { code, discount_type, discount_value, max_uses, min_cart_value, start_date, end_date } = req.body;
  if (!code || !discount_type || discount_value == null) {
    return res.status(400).json({ error: 'code, discount_type and discount_value are required' });
  }
  if (!['percentage', 'fixed'].includes(discount_type) || Number(discount_value) <= 0) {
    return res.status(400).json({ error: 'Coupon discount must be a positive percentage or fixed amount' });
  }
  if (discount_type === 'percentage' && Number(discount_value) > 100) {
    return res.status(400).json({ error: 'Percentage discount cannot exceed 100' });
  }

  const { data, error } = await supabase
    .from('coupons')
    .insert({
      code: code.toUpperCase().trim(),
      discount_type,
      discount_value,
      max_uses: max_uses || null,
      min_cart_value: min_cart_value || null,
      start_date: start_date || null,
      end_date: end_date || null,
    })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
};

export const listCoupons = async (_req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const toggleCoupon = async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('coupons')
    .update({ is_active: req.body.is_active })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error || !data) return res.status(404).json({ error: 'Coupon not found' });
  res.json(data);
};
