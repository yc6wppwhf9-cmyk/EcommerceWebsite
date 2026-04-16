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

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id,
        user_id: req.user?.id,
        rating,
        title,
        body,
        is_verified: true, // In a real app, you might verify this
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
    const isAdmin = req.user?.role === 'admin';
    
    let query = supabase.from('reviews').delete().eq('id', id);
    if (!isAdmin) query = query.eq('user_id', req.user?.id);

    const { error } = await query;
    if (error) throw error;

    res.json({ message: 'Review deleted' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete review', message: err.message });
  }
};
