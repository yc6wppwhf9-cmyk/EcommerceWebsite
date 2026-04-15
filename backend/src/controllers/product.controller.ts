import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import * as xlsx from 'xlsx';

export const getProducts = async (req: Request, res: Response) => {
  const { category, sort, min_price, max_price, search, page = '1', limit = '20' } = req.query as any;

  try {
    let query = supabase
      .from('products')
      .select('*, categories!inner(slug)')
      .eq('is_active', true);

    if (category)  query = query.eq('categories.slug', category);
    if (min_price) query = query.gte('price', Number(min_price));
    if (max_price) query = query.lte('price', Number(max_price));
    if (search)    query = query.ilike('name', `%${search}%`);

    const sortMap: Record<string, { column: string; ascending: boolean }> = {
      'price-asc':  { column: 'price', ascending: true },
      'price-desc': { column: 'price', ascending: false },
      'rating':     { column: 'rating', ascending: false },
      'newest':     { column: 'created_at', ascending: false },
    };
    const s = sortMap[sort] || { column: 'created_at', ascending: false };
    query = query.order(s.column, { ascending: s.ascending });

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const offset = (pageNum - 1) * limitNum;
    query = query.range(offset, offset + limitNum - 1);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ products: data, page: pageNum, limit: limitNum });
  } catch (err) {
    console.error('products list error', err);
    res.status(500).json({ error: 'Database error' });
  }
};

export const getProductBySlug = async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories!inner(slug)')
    .eq('is_active', true)
    .eq('slug', req.params.slug)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Product not found' });
  res.json(data);
};

export const createProduct = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('products').insert(req.body).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
};

export const updateProduct = async (req: Request, res: Response) => {
  const allowed = ['name', 'description', 'price', 'original_price', 'stock', 'is_active', 'is_new', 'is_highlighted'];
  const updates: any = {};
  allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  if (!Object.keys(updates).length) return res.status(400).json({ error: 'No fields to update' });

  const { data, error } = await supabase.from('products').update(updates).eq('id', req.params.id).select().single();
  if (error || !data) return res.status(404).json({ error: 'Product not found' });
  res.json(data);
};

export const uploadImage = async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: req.file.path });
};

export const bulkUpload = async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No Excel file uploaded' });

  try {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const products: any[] = xlsx.utils.sheet_to_json(sheet);

    if (!products.length) return res.status(400).json({ error: 'Excel sheet is empty' });

    // Format data for Supabase (handle common column name variations)
    const formatted = products.map(p => ({
      name: p.name || p.Name,
      description: p.description || p.Description || '',
      price: Number(p.price || p.Price),
      original_price: Number(p.original_price || p.Price || p.price),
      category_id: p.category_id || p.Category,
      stock: Number(p.stock || p.Stock || 0),
      image_url: p.image_url || p.Image || '',
      sku: p.sku || p.SKU || '',
      is_premium: Boolean(p.is_premium || p.Premium),
    }));

    const { data, error } = await supabase.from('products').insert(formatted).select();
    if (error) throw error;

    res.status(201).json({ success: true, count: data.length });
  } catch (err: any) {
    console.error('Bulk upload error:', err);
    res.status(500).json({ error: 'Failed to process Excel file' });
  }
};
