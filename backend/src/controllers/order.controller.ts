import { Response } from 'express';
import crypto from 'crypto';
import { supabase } from '../config/supabase';
import { config } from '../config/env';
import { AuthRequest } from '../middleware/auth';
import * as Mailer from '../lib/mail';

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const isAdmin = req.user?.role === 'admin';
    let query = supabase
      .from('orders')
      .select('*, order_items(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (!isAdmin) query = query.eq('user_id', req.user?.id);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', req.params.id)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Order not found' });
  if (data.user_id !== req.user?.id && req.user?.role !== 'admin')
    return res.status(403).json({ error: 'Access denied' });
  res.json(data);
};

export const createOrder = async (req: AuthRequest, res: Response) => {
  const {
    items, shipping_name, shipping_phone, shipping_line1, shipping_line2,
    shipping_city, shipping_state, shipping_pincode, payment_method, payment_id,
    razorpay_order_id, razorpay_payment_id, razorpay_signature, notes,
  } = req.body;

  // For online payments, verify the Razorpay signature server-side before creating
  // the order. This prevents a malicious client from skipping payment and sending
  // payment_method: 'online' with no valid payment.
  if (payment_method === 'online') {
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification fields are required for online orders' });
    }
    const expectedSig = crypto
      .createHmac('sha256', config.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment signature verification failed' });
    }
  }

  try {
    const productIds = items.map((i: any) => i.product_id);
    const { data: products, error: pErr } = await supabase
      .from('products')
      .select('id, name, price, image, stock')
      .in('id', productIds);

    if (pErr || !products) throw new Error('Failed to fetch products');

    const productMap: Record<string, any> = {};
    products.forEach((p) => { productMap[p.id] = p; });

    let subtotal = 0;
    const orderItems: any[] = [];

    for (const item of items) {
      const product = productMap[item.product_id];
      if (!product) throw new Error(`Product not found: ${item.product_id}`);
      if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);
      
      subtotal += product.price * item.quantity;
      orderItems.push({
        product_id: item.product_id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: item.quantity
      });
    }

    const shipping_fee = subtotal >= config.SHIPPING_THRESHOLD ? 0 : config.SHIPPING_FEE;
    const total = subtotal + shipping_fee;

    // Use RPC for atomic transaction
    const { data: orderId, error: rpcErr } = await supabase.rpc('create_order_v2', {
      p_user_id: req.user?.id,
      p_subtotal: subtotal,
      p_shipping_fee: shipping_fee,
      p_total: total,
      p_shipping_name: shipping_name,
      p_shipping_phone: shipping_phone,
      p_shipping_line1: shipping_line1,
      p_shipping_line2: shipping_line2 || null,
      p_shipping_city: shipping_city,
      p_shipping_state: shipping_state,
      p_shipping_pincode: shipping_pincode,
      p_payment_method: payment_method || 'cod',
      p_payment_id: payment_id || null,
      p_notes: notes || null,
      p_items: orderItems
    });

    if (rpcErr) throw rpcErr;

    // Fetch and Return Final Order
    const { data: finalOrder } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single();

    res.status(201).json(finalOrder);
  } catch (err: any) {
    console.error('❌ Create Order Exception:', err);
    res.status(400).json({ 
      error: err.message || 'Order creation failed',
      details: err.details 
    });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  const { status, invoice_url } = req.body;
  const valid = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'return_requested', 'returned'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  try {
    const updatePayload: any = { status, invoice_url };
    if (status === 'returned') updatePayload.payment_status = 'refunded';

    const { data: order, error } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', req.params.id)
      .select('*, users(name, email)')
      .single();

    if (error || !order) return res.status(404).json({ error: 'Order not found' });

    if (status === 'shipped') {
      await Mailer.sendEmail(
        (order as any).users.email,
        'Your Order has been Shipped! - Priority Bags',
        Mailer.getOrderShippedTemplate((order as any).users.name, order.id, invoice_url)
      );
    }

    if (status === 'returned') {
      await Mailer.sendEmail(
        (order as any).users.email,
        'Your Refund has been Processed - Priority Bags',
        Mailer.getReturnApprovedTemplate((order as any).users.name, order.id)
      );
    }

    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
};

export const requestReturn = async (req: AuthRequest, res: Response) => {
  const { reason } = req.body;
  if (!reason?.trim()) return res.status(400).json({ error: 'Return reason is required' });

  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*, users(name, email)')
      .eq('id', req.params.id)
      .single();

    if (error || !order) return res.status(404).json({ error: 'Order not found' });
    if (order.user_id !== req.user?.id) return res.status(403).json({ error: 'Access denied' });
    if (order.status !== 'delivered') return res.status(400).json({ error: 'Only delivered orders can be returned' });

    const deliveredAt = new Date(order.updated_at).getTime();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - deliveredAt > sevenDays) {
      return res.status(400).json({ error: 'Return window has expired (7 days from delivery)' });
    }

    const { data: updated, error: updateErr } = await supabase
      .from('orders')
      .update({ status: 'return_requested', return_reason: reason.trim() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    await Mailer.sendEmail(
      (order as any).users.email,
      'Return Request Received - Priority Bags',
      Mailer.getReturnRequestedTemplate((order as any).users.name, order.id, reason.trim())
    );

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
};
