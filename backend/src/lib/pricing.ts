export interface CouponPricingRule {
  discount_type: 'percentage' | 'fixed';
  discount_value: number | string;
}

export interface CheckoutTotals {
  subtotal: number;
  shippingFee: number;
  couponDiscount: number;
  total: number;
}

const money = (value: number) => Math.round(value * 100) / 100;

export function calculateCouponDiscount(coupon: CouponPricingRule | null, subtotal: number): number {
  if (!coupon || subtotal <= 0) return 0;

  const value = Number(coupon.discount_value);
  if (!Number.isFinite(value) || value <= 0) return 0;

  const rawDiscount = coupon.discount_type === 'percentage'
    ? subtotal * (Math.min(value, 100) / 100)
    : value;

  return money(Math.min(subtotal, Math.max(0, rawDiscount)));
}

export function calculateCheckoutTotals(
  subtotal: number,
  shippingFee: number,
  coupon: CouponPricingRule | null,
): CheckoutTotals {
  const safeSubtotal = money(Math.max(0, subtotal));
  const safeShippingFee = money(Math.max(0, shippingFee));
  const couponDiscount = calculateCouponDiscount(coupon, safeSubtotal);

  return {
    subtotal: safeSubtotal,
    shippingFee: safeShippingFee,
    couponDiscount,
    total: money(Math.max(0, safeSubtotal + safeShippingFee - couponDiscount)),
  };
}
