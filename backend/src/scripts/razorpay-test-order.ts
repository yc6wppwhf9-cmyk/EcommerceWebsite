import dotenv from 'dotenv';
import Razorpay from 'razorpay';

dotenv.config();

const keyId = process.env.RAZORPAY_KEY_ID || '';
const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

if (!keyId || !keySecret) {
  throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required');
}
if (!keyId.startsWith('rzp_test_')) {
  throw new Error('Refusing to run: test:razorpay only accepts an rzp_test_* key');
}

const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
const order = await razorpay.orders.create({
  amount: 100,
  currency: 'INR',
  receipt: `launch-check-${Date.now()}`,
  notes: { purpose: 'Priority Bags pre-launch test order' },
});

console.log(JSON.stringify({
  ok: true,
  mode: 'test',
  order_id: order.id,
  amount: order.amount,
  currency: order.currency,
  status: order.status,
}, null, 2));
