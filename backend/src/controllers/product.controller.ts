import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import * as xlsx from 'xlsx';

export const getProducts = async (req: Request, res: Response) => {
    const { category, sub_category, gender, isPremium, sort, min_price, max_price, search, page = '1', limit = '20' } = req.query;

    try {
      let query = supabase
        .from('products')
        .select(`*, categories${category ? '!inner' : ''}(name, slug)`)
        .eq('is_active', true);

      if (category && category !== 'premium') {
        query = query.eq('categories.slug', category);
      }
      
      if (sub_category) {
        query = query.eq('sub_category', sub_category);
      }
      
      if (gender) {
        query = query.eq('gender', gender);
      }

      if (isPremium === 'true' || category === 'premium') {
        query = query.eq('is_premium', true);
      }
    if (min_price) query = query.gte('price', Number(min_price));
    if (max_price) query = query.lte('price', Number(max_price));
    if (search) {
      // Escape ILIKE metacharacters so user input is treated as a literal string
      const escaped = (search as string).replace(/[%_\\]/g, '\\$&');
      query = query.ilike('name', `%${escaped}%`);
    }

    const sortMap: Record<string, { column: string; ascending: boolean }> = {
      'price-asc':  { column: 'price', ascending: true },
      'price-desc': { column: 'price', ascending: false },
      'rating':     { column: 'rating', ascending: false },
      'newest':     { column: 'created_at', ascending: false },
    };
    const s = sortMap[sort as string] || { column: 'created_at', ascending: false };
    query = query.order(s.column, { ascending: s.ascending });

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const offset = (pageNum - 1) * limitNum;
    query = query.range(offset, offset + limitNum - 1);

    const { data, error } = await query;
    if (error) {
      console.error('❌ Supabase View Error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }
    res.json({ products: data, page: pageNum, limit: limitNum });
  } catch (err: any) {
    console.error('❌ Products List Controller Exception:', err);
    res.status(500).json({ 
      error: 'Database error', 
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { details: err })
    });
  }
};

export const getProductBySlug = async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories!inner(slug)')
    .eq('is_active', true)
    .or(`slug.eq."${req.params.slug}",id.eq."${req.params.slug}"`)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Product not found' });
  res.json(data);
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const body = { ...req.body };
    const catName = body.category || 'backpacks';

    // 1. Resolve Category ID
    const { data: catData } = await supabase
      .from('categories')
      .select('id')
      .or(`name.ilike.${catName},slug.eq.${catName}`)
      .maybeSingle();
    
    // 2. Clean up & Map
    const productData = {
      sku: body.sku || 'PB-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      slug: body.slug || (body.name || '').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
      name: body.name,
      description: body.description || '',
      price: body.price,
      original_price: body.originalPrice || body.original_price || body.price,
      category_id: catData?.id || body.category_id,
      image: Array.isArray(body.images) ? body.images[0] : (body.image || ''),
      images: body.images || [],
      colors: body.colors || [],
      features: body.features || [],
      stock: body.stock || 0,
      is_new: body.isNew || body.is_new || false,
      is_highlighted: body.highlighted || body.is_highlighted || false,
    };

    if (!productData.category_id) {
       // fallback to a default if not found
       const { data: defaultCat } = await supabase.from('categories').select('id').limit(1).single();
       productData.category_id = defaultCat?.id;
    }

    const { data, error } = await supabase.from('products').insert(productData).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    console.error('Create Product Error:', err);
    res.status(400).json({ error: err.message });
  }
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
    const rows: any[] = xlsx.utils.sheet_to_json(sheet);

    if (!rows.length) return res.status(400).json({ error: 'Excel sheet is empty' });

    const valid: any[] = [];
    const skipped: { row: number; reason: string }[] = [];

    rows.forEach((p, idx) => {
      const rowNum = idx + 2; // +2 because row 1 is the header
      const name = (p.name || p.Name || '').toString().trim();
      const sku = (p.sku || p.SKU || '').toString().trim();
      const price = Number(p.price || p.Price);
      const originalPrice = Number(p.original_price || p.Original_Price || p.Price || p.price);
      const stock = Number(p.stock || p.Stock || 0);
      const categoryId = (p.category_id || p.Category_ID || '').toString().trim();

      if (!name) { skipped.push({ row: rowNum, reason: 'Missing name' }); return; }
      if (!sku) { skipped.push({ row: rowNum, reason: 'Missing SKU' }); return; }
      if (isNaN(price) || price <= 0) { skipped.push({ row: rowNum, reason: `Invalid price: ${p.price}` }); return; }
      if (isNaN(originalPrice) || originalPrice <= 0) { skipped.push({ row: rowNum, reason: `Invalid original_price` }); return; }
      if (isNaN(stock) || stock < 0) { skipped.push({ row: rowNum, reason: `Invalid stock: ${p.stock}` }); return; }

      valid.push({
        name,
        description: (p.description || p.Description || '').toString().trim(),
        price,
        original_price: originalPrice,
        category_id: categoryId || null,
        stock: Math.floor(stock),
        image: (p.image || p.Image || p.image_url || p.Image_URL || '').toString().trim(),
        sku,
        is_active: true,
      });
    });

    if (!valid.length) {
      return res.status(400).json({ error: 'No valid rows to import', skipped });
    }

    const { data, error } = await supabase.from('products').insert(valid).select();
    if (error) throw error;

    res.status(201).json({
      success: true,
      inserted: data.length,
      skipped_count: skipped.length,
      skipped,
    });
  } catch (err: any) {
    console.error('Bulk upload error:', err);
    res.status(500).json({ error: 'Failed to process Excel file', details: err.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Product deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete product', message: err.message });
  }
};
