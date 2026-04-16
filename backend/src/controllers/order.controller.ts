import { Response } from 'express';
import { supabase } from '../config/supabase';
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
    shipping_city, shipping_state, shipping_pincode, payment_method, payment_id, notes,
  } = req.body;

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

    const shipping_fee = subtotal >= 1499 ? 0 : 99;
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
  const valid = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  try {
    const { data: order, error } = await supabase
      .from('orders')
      .update({ status, invoice_url })
      .eq('id', req.params.id)
      .select('*, users(name, email)')
      .single();

    if (error || !order) return res.status(404).json({ error: 'Order not found' });

    // Send Shipping Email if status is 'shipped'
    if (status === 'shipped') {
      await Mailer.sendEmail(
        (order as any).users.email,
        'Your Order has been Shipped! - Priority Bags',
        Mailer.getOrderShippedTemplate((order as any).users.name, order.id, invoice_url)
      );
    }

    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
};
