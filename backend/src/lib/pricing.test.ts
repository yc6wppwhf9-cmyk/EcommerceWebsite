import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCheckoutTotals, calculateCouponDiscount } from './pricing';

test('percentage coupons are calculated from the server subtotal', () => {
  assert.equal(calculateCouponDiscount({ discount_type: 'percentage', discount_value: 20 }, 1500), 300);
});

test('percentage discounts cannot exceed the subtotal', () => {
  assert.equal(calculateCouponDiscount({ discount_type: 'percentage', discount_value: 250 }, 800), 800);
});

test('fixed discounts cannot make an order negative', () => {
  assert.deepEqual(
    calculateCheckoutTotals(500, 99, { discount_type: 'fixed', discount_value: 700 }),
    { subtotal: 500, shippingFee: 99, couponDiscount: 500, total: 99 },
  );
});

test('shipping remains part of the payable total after a coupon', () => {
  assert.deepEqual(
    calculateCheckoutTotals(1000, 99, { discount_type: 'percentage', discount_value: 10 }),
    { subtotal: 1000, shippingFee: 99, couponDiscount: 100, total: 999 },
  );
});

test('checkout totals are unchanged without a coupon', () => {
  assert.deepEqual(
    calculateCheckoutTotals(2000, 0, null),
    { subtotal: 2000, shippingFee: 0, couponDiscount: 0, total: 2000 },
  );
});
