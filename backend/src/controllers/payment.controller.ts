import { Request, Response } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { supabase } from '../config/supabase';
import { config } from '../config/env';
import { AuthRequest } from '../middleware/auth';

const razorpay = new Razorpay({
  key_id: config.RAZORPAY_KEY_ID,
  key_secret: config.RAZORPAY_KEY_SECRET,
});

/**
 * POST /api/payments/create-order
 *
 * Creates a Razorpay "order" that the frontend checkout widget needs before it
 * can open the payment modal. The frontend sends the cart items so the server
 * can compute the authoritative total (including shipping) — never trust the
 * client-side amount.
 */
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const {
      items,
      receipt,
      currency = 'INR',
      shipping_name,
      shipping_phone,
      shipping_line1,
      shipping_line2,
      shipping_city,
      shipping_state,
      shipping_pincode,
      notes,
    } = req.body as {
      items: Array<{ product_id: string; quantity: number }>;
      receipt: string;
      currency?: string;
      shipping_name?: string;
      shipping_phone?: string;
      shipping_line1?: string;
      shipping_line2?: string;
      shipping_city?: string;
      shipping_state?: string;
      shipping_pincode?: string;
      notes?: string;
    };

    if (!items?.length) {
      return res.status(400).json({ error: 'At least one item is required' });
    }
    if (!shipping_name || !shipping_phone || !shipping_line1 || !shipping_city || !shipping_state || !shipping_pincode) {
      return res.status(400).json({ error: 'Delivery details are required before starting online payment' });
    }

    // Best-effort cleanup for abandoned online payment reservations.
    const { error: cleanupErr } = await supabase.rpc('release_expired_payment_reservations');
    if (cleanupErr) {
      console.warn('Payment reservation cleanup skipped:', cleanupErr.message);
    }

    // 1. Fetch products server-side to compute the authoritative total
    const productIds = items.map((i) => i.product_id);
    const { data: products, error: pErr } = await supabase
      .from('products')
      .select('id, name, price, image, stock')
      .in('id', productIds);

    if (pErr || !products) {
      return res.status(400).json({ error: 'Failed to fetch products' });
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const orderItems: Array<{ product_id: string; name: string; price: number; image: string | null; quantity: number }> = [];
    for (const item of items) {
      const product = productMap.get(item.product_id);
      if (!product) {
        return res.status(400).json({ error: `Product not found: ${item.product_id}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for product ${product.id}` });
      }
      subtotal += Number(product.price) * item.quantity;
      orderItems.push({
        product_id: item.product_id,
        name: product.name,
        price: Number(product.price),
        image: product.image,
        quantity: item.quantity,
      });
    }

    const shippingFee = subtotal >= config.SHIPPING_THRESHOLD ? 0 : config.SHIPPING_FEE;
    const total = subtotal + shippingFee;

    // 2. Create Razorpay order (amount in smallest currency unit — paise for INR)
    const rzOrder = await razorpay.orders.create({
      amount: Math.round(total * 100),
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: { user_id: req.user!.id },
    });

    // 3. Reserve stock by creating a pending online order. If stock disappears
    // between the pre-check and this call, payment never opens for the customer.
    const { data: appOrderId, error: rpcErr } = await supabase.rpc('create_order_v2', {
      p_user_id: req.user?.id,
      p_subtotal: subtotal,
      p_shipping_fee: shippingFee,
      p_total: total,
      p_shipping_name: shipping_name,
      p_shipping_phone: shipping_phone,
      p_shipping_line1: shipping_line1,
      p_shipping_line2: shipping_line2 || null,
      p_shipping_city: shipping_city,
      p_shipping_state: shipping_state,
      p_shipping_pincode: shipping_pincode,
      p_payment_method: 'online',
      p_payment_id: null,
      p_notes: notes || `razorpay_order_id:${rzOrder.id}`,
      p_items: orderItems,
    });

    if (rpcErr) {
      return res.status(400).json({ error: rpcErr.message || 'Unable to reserve stock for payment' });
    }

    const { error: reserveStateErr } = await supabase
      .from('orders')
      .update({
        status: 'pending',
        payment_status: 'pending',
        payment_id: null,
      })
      .eq('id', appOrderId)
      .eq('user_id', req.user?.id)
      .eq('payment_method', 'online');

    if (reserveStateErr) {
      return res.status(400).json({ error: 'Unable to prepare reserved order for payment' });
    }

    res.json({ ...rzOrder, app_order_id: appOrderId });
  } catch (err: any) {
    console.error('Payment create-order error:', err);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
};

/**
 * POST /api/payments/verify
 *
 * Verifies the Razorpay payment signature before the frontend proceeds to
 * create the actual order. This is a pre-check — the order controller also
 * re-verifies independently when the order is created.
 */
export const verifyPayment = async (req: AuthRequest, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body as {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    };

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment verification fields' });
    }

    // Verify HMAC-SHA256 signature: sha256(order_id + "|" + payment_id)
    const expectedSig = crypto
      .createHmac('sha256', config.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment signature verification failed' });
    }

    // Fetch payment from Razorpay to confirm it's in a successful state
    const payment = (await razorpay.payments.fetch(razorpay_payment_id)) as any;
    if (!['authorized', 'captured'].includes(payment.status)) {
      return res.status(400).json({ error: 'Payment is not in a successful state' });
    }

    res.json({ verified: true });
  } catch (err: any) {
    console.error('Payment verify error:', err);
    res.status(500).json({ error: 'Payment verification failed' });
  }
};
