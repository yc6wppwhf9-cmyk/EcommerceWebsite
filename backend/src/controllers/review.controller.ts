import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';

export const getReviewsByProduct = async (req: Request, res: Response) => {
  const { productId } = req.params;
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, users(name)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch reviews', message: err.message });
  }
};

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const { product_id, rating, title, body } = req.body;
    
    // Check if user has already reviewed this product
    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('product_id', product_id)
      .eq('user_id', req.user?.id)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }

    // A review is "verified purchase" only if the user has a delivered order for this product
    const { data: purchaseCheck } = await supabase
      .from('order_items')
      .select('id, orders!inner(user_id, status)')
      .eq('product_id', product_id)
      .eq('orders.user_id', req.user!.id)
      .eq('orders.status', 'delivered')
      .limit(1)
      .single();

    const is_verified = !!purchaseCheck;

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id,
        user_id: req.user?.id,
        rating,
        title,
        body,
        is_verified,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create review', message: err.message });
  }
};

export const deleteReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const isAdmin = req.user!.role === 'admin';

    // Fetch the review first to confirm it exists and check ownership
    const { data: review, error: fetchErr } = await supabase
      .from('reviews')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (fetchErr || !review) return res.status(404).json({ error: 'Review not found' });
    if (!isAdmin && review.user_id !== userId)
      return res.status(403).json({ error: 'You can only delete your own reviews' });

    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) throw error;

    res.json({ message: 'Review deleted' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete review', message: err.message });
  }
};
