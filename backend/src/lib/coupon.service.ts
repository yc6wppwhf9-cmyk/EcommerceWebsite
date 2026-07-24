import { supabase } from '../config/supabase';
import { calculateCouponDiscount } from './pricing';

export interface EligibleCoupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  discount_amount: number;
}

interface ResolveCouponInput {
  couponId?: string;
  code?: string;
  userId: string;
  subtotal: number;
}

export async function resolveEligibleCoupon({
  couponId,
  code,
  userId,
  subtotal,
}: ResolveCouponInput): Promise<EligibleCoupon | null> {
  if (!couponId && !code) return null;

  let query = supabase.from('coupons').select('*').eq('is_active', true);
  query = couponId
    ? query.eq('id', couponId)
    : query.eq('code', code!.toUpperCase().trim());

  const { data: coupon, error } = await query.maybeSingle();
  if (error || !coupon) throw new Error('Invalid or expired coupon code');

  const now = new Date();
  if (coupon.start_date && new Date(coupon.start_date) > now) {
    throw new Error('This coupon is not active yet');
  }
  if (coupon.end_date && new Date(coupon.end_date) < now) {
    throw new Error('This coupon has expired');
  }
  if (coupon.max_uses !== null && Number(coupon.used_count) >= Number(coupon.max_uses)) {
    throw new Error('This coupon has reached its usage limit');
  }
  if (coupon.min_cart_value && subtotal < Number(coupon.min_cart_value)) {
    throw new Error(`Minimum cart value of ₹${Number(coupon.min_cart_value).toLocaleString('en-IN')} required`);
  }

  const { data: alreadyUsed, error: usageError } = await supabase
    .from('coupon_uses')
    .select('id')
    .eq('coupon_id', coupon.id)
    .eq('user_id', userId)
    .maybeSingle();

  if (usageError) throw new Error('Unable to validate coupon usage');
  if (alreadyUsed) throw new Error('You have already used this coupon');

  const discountType = coupon.discount_type as 'percentage' | 'fixed';
  const discountValue = Number(coupon.discount_value);

  return {
    id: coupon.id,
    code: coupon.code,
    discount_type: discountType,
    discount_value: discountValue,
    discount_amount: calculateCouponDiscount(
      { discount_type: discountType, discount_value: discountValue },
      subtotal,
    ),
  };
}
