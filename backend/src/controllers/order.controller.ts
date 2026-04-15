import { Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const isAdmin = req.user?.role === 'admin';
    let query = supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
    if (!isAdmin) query = query.eq('user_id', req.user?.id);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
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
    shipping_city, shipping_state, shipping_pincode, payment_method, notes,
  } = req.body;

  if (!items?.length || !shipping_name || !shipping_phone || !shipping_line1 || !shipping_city || !shipping_state || !shipping_pincode)
    return res.status(400).json({ error: 'Missing required order fields' });

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
      if (!product) throw new Error('Product not found');
      if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);
      subtotal += product.price * item.quantity;
      orderItems.push({ product_id: item.product_id, name: product.name, price: product.price, image: product.image, quantity: item.quantity });
    }

    const shipping_fee = subtotal >= 1499 ? 0 : 99;
    const total = subtotal + shipping_fee;

    const { data: order, error: oErr } = await supabase
      .from('orders')
      .insert({
        user_id: req.user?.id, subtotal, shipping_fee, total,
        shipping_name, shipping_phone, shipping_line1, shipping_line2: shipping_line2 || null,
        shipping_city, shipping_state, shipping_pincode,
        payment_method: payment_method || 'cod', notes: notes || null,
        status: 'confirmed', payment_status: 'pending',
      })
      .select()
      .single();

    if (oErr || !order) throw new Error('Failed to create order');

    const { error: iErr } = await supabase
      .from('order_items')
      .insert(orderItems.map((i) => ({ ...i, order_id: order.id })));

    if (iErr) throw new Error('Failed to create order items');

    for (const item of orderItems) {
      await supabase.rpc('decrement_stock', { product_id: item.product_id, qty: item.quantity });
    }

    const { data: finalOrder } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', order.id)
      .single();

    res.status(201).json(finalOrder);
  } catch (err: any) {
    console.error('create order error', err);
    res.status(400).json({ error: err.message || 'Order creation failed' });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  const valid = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error || !data) return res.status(404).json({ error: 'Order not found' });
  res.json(data);
};
