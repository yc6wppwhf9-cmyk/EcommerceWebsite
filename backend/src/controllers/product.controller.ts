import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { readSheet } from 'read-excel-file/node';
import cloudinary from '../config/cloudinary';
import { AuthRequest } from '../middleware/auth';

const getPublishIssues = (product: Record<string, any>): string[] => {
  const images = [product.image, ...(Array.isArray(product.images) ? product.images : [])]
    .filter((value) => typeof value === 'string' && value.trim());
  const features = Array.isArray(product.features)
    ? product.features.filter((value) => typeof value === 'string' && value.trim())
    : [];
  const issues: string[] = [];
  if (!String(product.description || '').trim() || String(product.description).trim().length < 40) {
    issues.push('a meaningful description of at least 40 characters');
  }
  if (!images.length) issues.push('at least one product image');
  if (!features.length) issues.push('at least one product feature');
  if (!product.category_id) issues.push('a valid category');
  if (!product.sku) issues.push('a SKU');
  return issues;
};

export const getProducts = async (req: AuthRequest, res: Response) => {
  const { category, sub_category, gender, isPremium, junior_style, age_range, sort, min_price, max_price, search, page = '1', limit = '20' } = req.query;

  try {
    let query = supabase
      .from('products')
      .select('*, categories(slug, title)');

    const includeInactive = req.user?.role === 'admin' && req.query.include_inactive === 'true';
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    if (category && category !== 'premium') {
      const { data: cat } = await supabase.from('categories').select('id').eq('slug', category).maybeSingle();
      if (cat) {
        // Match by direct category_id OR by sub_category (handles subcategory tab pages
        // where products are stored under the parent category_id but tagged via sub_category)
        query = query.or(`category_id.eq.${cat.id},sub_category.eq.${category}`);
      } else {
        query = query.eq('sub_category', category);
      }
    }

    if (sub_category) {
      query = query.eq('sub_category', sub_category);
    }

    if (gender) {
      query = query.eq('gender', gender);
    }

    if (age_range) {
      query = query.eq('age_range', age_range);
    }

    if (isPremium === 'true' || category === 'premium') {
      query = query.eq('is_premium', true);
    } else if (isPremium === 'false') {
      query = query.eq('is_premium', false);
    }

    if (junior_style) {
      query = query.eq('junior_style', junior_style).eq('is_active', true);
    }
    if (min_price) query = query.gte('price', Number(min_price));
    if (max_price) query = query.lte('price', Number(max_price));
    if (search) {
      // Escape ILIKE metacharacters so user input is treated as a literal string
      const escaped = (search as string).replace(/[%_\\]/g, '\\$&');
      query = query.ilike('name', `%${escaped}%`);
    }

    const sortMap: Record<string, { column: string; ascending: boolean }> = {
      'price-asc': { column: 'price', ascending: true },
      'price-desc': { column: 'price', ascending: false },
      'rating': { column: 'rating', ascending: false },
      'newest': { column: 'created_at', ascending: false },
      // total_clicks is a generated column (amazon + flipkart + myntra + ajio clicks combined) — see migration.
      'bestseller': { column: 'total_clicks', ascending: false },
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
  const slug = req.params.slug;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

  const base = supabase
    .from('products')
    .select('*, categories!inner(slug)')
    .eq('is_active', true);

  const { data, error } = await (isUuid
    ? base.or(`slug.eq.${slug},id.eq.${slug}`)
    : base.eq('slug', slug)
  ).single();

  if (error || !data) return res.status(404).json({ error: 'Product not found' });
  res.json(data);
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const body = { ...req.body };
    const catName = body.category || 'backpacks';

    // 1. Resolve Category ID — try slug first (exact), then name (case-insensitive)
    let catData: { id: string } | null = null;
    const bySlug = await supabase.from('categories').select('id').eq('slug', catName).maybeSingle();
    if (bySlug.data) {
      catData = bySlug.data;
    } else {
      const byName = await supabase.from('categories').select('id').ilike('name', catName).maybeSingle();
      catData = byName.data;
    }

    // 2. Clean up & Map
    const productData = {
      sku: body.sku || 'PB-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      slug: body.slug || (body.name || '').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
      name: body.name,
      description: body.description || '',
      price: body.price,
      original_price: body.originalPrice || body.original_price || body.price,
      category_id: catData?.id || body.category_id,
      image: (Array.isArray(body.images) && body.images[0]) ? body.images[0] : (body.image || ''),
      images: body.images || [],
      colors: body.colors || [],
      features: body.features || [],
      stock: body.stock || 0,
      is_new: body.isNew || body.is_new || false,
      is_highlighted: body.highlighted || body.is_highlighted || false,
      is_premium: body.isPremium || body.is_premium || false,
      gender: body.gender || 'unisex',
      size: body.size || '',
      age_range: body.ageRange || body.age_range || '',
      sub_category: body.sub_category || '',
      junior_style: body.junior_style || null,
      is_active: body.is_active !== undefined ? body.is_active : true,
      amazon_url: body.amazon_url || null,
      flipkart_url: body.flipkart_url || null,
      myntra_url: body.myntra_url || null,
      ajio_url: body.ajio_url || null
    };

    if (!productData.category_id) {
      const { data: fallback } = await supabase.from('categories').select('id').limit(1).single();
      if (fallback) productData.category_id = fallback.id;
    }

    if (productData.is_active) {
      const publishIssues = getPublishIssues(productData);
      if (publishIssues.length) {
        return res.status(400).json({
          error: `Product cannot be published until it has ${publishIssues.join(', ')}.`,
          code: 'PRODUCT_NOT_READY',
          issues: publishIssues,
        });
      }
    }

    const { data, error } = await supabase.from('products').insert(productData).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    console.error('❌ Create Error:', err);
    res.status(400).json({ error: err.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const allowed = [
    'name', 'slug', 'description', 'price', 'original_price', 'stock',
    'is_active', 'is_new', 'is_highlighted', 'image', 'images',
    'colors', 'features', 'category_id', 'is_premium', 'gender',
    'size', 'age_range', 'sub_category', 'junior_style', 'amazon_url',
    'flipkart_url', 'myntra_url', 'ajio_url'
  ];
  
  const updates: any = {};
  
  // 1. Resolve Category Slug to ID if provided
  if (req.body.category) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', req.body.category).maybeSingle();
    if (cat) updates.category_id = cat.id;
  }

  // 2. Map fields and handle both camelCase and snake_case
  allowed.forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
    
    // Explicit mappings for frontend camelCase fields
    if (f === 'original_price' && req.body.originalPrice !== undefined) updates[f] = req.body.originalPrice;
    if (f === 'is_premium' && req.body.isPremium !== undefined) updates[f] = req.body.isPremium;
    if (f === 'age_range' && req.body.ageRange !== undefined) updates[f] = req.body.ageRange;
    if (f === 'is_new' && req.body.isNew !== undefined) updates[f] = req.body.isNew;
    if (f === 'is_highlighted' && req.body.highlighted !== undefined) updates[f] = req.body.highlighted;
  });

  if (!Object.keys(updates).length) return res.status(400).json({ error: 'No valid fields provided for update' });

  if (updates.is_active === true) {
    const { data: current, error: currentError } = await supabase
      .from('products')
      .select('name, description, image, images, features, category_id, sku')
      .eq('id', req.params.id)
      .maybeSingle();
    if (currentError) return res.status(400).json({ error: currentError.message });
    if (!current) return res.status(404).json({ error: 'Product not found' });
    const publishIssues = getPublishIssues({ ...current, ...updates });
    if (publishIssues.length) {
      return res.status(400).json({
        error: `Product cannot be published until it has ${publishIssues.join(', ')}.`,
        code: 'PRODUCT_NOT_READY',
        issues: publishIssues,
      });
    }
  }

  const { data, error } = await supabase.from('products').update(updates).eq('id', req.params.id).select().single();
  if (error) {
    console.error('❌ Update DB Error:', error);
    return res.status(400).json({ error: error.message });
  }
  if (!data) return res.status(404).json({ error: 'Product not found' });
  res.json(data);
};

type MulterRequest = Request & { file?: { buffer: Buffer; fieldname: string; originalname: string; mimetype: string; size: number } };

const uploadBufferToCloudinary = (buffer: Buffer) => new Promise<string>((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    {
      folder: 'priority-bags/products',
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    },
    (error, result) => {
      if (error || !result?.secure_url) {
        reject(error || new Error('Cloudinary did not return an image URL'));
        return;
      }
      resolve(result.secure_url);
    },
  );
  stream.end(buffer);
});

const parseCsv = (input: string): Record<string, string>[] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    const next = input[index + 1];
    if (character === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && next === '\n') index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += character;
    }
  }

  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  const headers = (rows.shift() || []).map((value) => value.trim());
  return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ''])));
};

const parseCatalogueFile = async (file: NonNullable<MulterRequest['file']>): Promise<Record<string, unknown>[]> => {
  if (file.originalname.toLowerCase().endsWith('.csv')) {
    return parseCsv(file.buffer.toString('utf8'));
  }

  const worksheet = await readSheet(file.buffer);
  const headers = (worksheet.shift() || []).map((value) => String(value || '').trim());
  return worksheet
    .filter((values) => values.some((value) => value !== null && String(value).trim()))
    .map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index]])));
};

export const uploadImage = async (req: MulterRequest, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const url = await uploadBufferToCloudinary(req.file.buffer);
    res.json({ url });
  } catch (err: any) {
    console.error('Image upload error:', err);
    res.status(502).json({ error: 'Failed to upload image' });
  }
};

export const bulkUpload = async (req: MulterRequest, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No Excel file uploaded' });

  try {
    const rows = await parseCatalogueFile(req.file);

    if (!rows.length) return res.status(400).json({ error: 'Excel sheet is empty' });

    const valid: any[] = [];
    const skipped: { row: number; reason: string }[] = [];

    rows.forEach((p: any, idx) => {
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
        features: (p.features || p.Features || '').toString().split('|').map((value: string) => value.trim()).filter(Boolean),
        amazon_url: (p.amazon_url || p.Amazon_URL || '').toString().trim() || null,
        flipkart_url: (p.flipkart_url || p.Flipkart_URL || '').toString().trim() || null,
        myntra_url: (p.myntra_url || p.Myntra_URL || '').toString().trim() || null,
        ajio_url: (p.ajio_url || p.Ajio_URL || '').toString().trim() || null,
        // Imported products remain drafts until their content and links are reviewed.
        is_active: false,
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
      count: data.length,
      status: 'draft',
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
