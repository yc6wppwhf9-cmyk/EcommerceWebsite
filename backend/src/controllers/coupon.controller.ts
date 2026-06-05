import { Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';

export const validateCoupon = async (req: AuthRequest, res: Response) => {
  const { code, cart_total } = req.body;
  if (!code) return res.status(400).json({ error: 'Coupon code is required' });

  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .eq('is_active', true)
    .single();

  if (error || !coupon) return res.status(404).json({ error: 'Invalid or expired coupon code' });

  const now = new Date();
  if (coupon.start_date && new Date(coupon.start_date) > now)
    return res.status(400).json({ error: 'This coupon is not active yet' });
  if (coupon.end_date && new Date(coupon.end_date) < now)
    return res.status(400).json({ error: 'This coupon has expired' });
  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses)
    return res.status(400).json({ error: 'This coupon has reached its usage limit' });
  if (coupon.min_cart_value && cart_total < coupon.min_cart_value)
    return res.status(400).json({ error: `Minimum cart value of ₹${coupon.min_cart_value} required` });

  // Check if user already used this coupon
  const { data: alreadyUsed } = await supabase
    .from('coupon_uses')
    .select('id')
    .eq('coupon_id', coupon.id)
    .eq('user_id', req.user!.id)
    .maybeSingle();

  if (alreadyUsed) return res.status(400).json({ error: 'You have already used this coupon' });

  const discount_amount = coupon.discount_type === 'percentage'
    ? Math.round((cart_total * coupon.discount_value) / 100)
    : Math.min(coupon.discount_value, cart_total);

  res.json({
    valid: true,
    coupon_id: coupon.id,
    code: coupon.code,
    discount_type: coupon.discount_type,
    discount_value: coupon.discount_value,
    discount_amount,
  });
};

export const createCoupon = async (req: AuthRequest, res: Response) => {
  const { code, discount_type, discount_value, max_uses, min_cart_value, start_date, end_date } = req.body;
  if (!code || !discount_type || discount_value == null)
    return res.status(400).json({ error: 'code, discount_type and discount_value are required' });

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
