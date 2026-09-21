import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { readSheet } from 'read-excel-file/node';
import cloudinary from '../config/cloudinary';
import { AuthRequest } from '../middleware/auth';

const getPublishIssues = (product: Record<string, any>): string[] => {
  const images = [product.image, ...(Array.isArray(product.images) ? product.images : [])]
    .filter((value) => typeof value === 'string' && value.trim());
  const issues: string[] = [];
  if (!images.length) issues.push('at least one product image');
  if (!product.category_id && !product.category) issues.push('a valid category');
  if (!product.sku) issues.push('a SKU');
  if (!product.name) issues.push('a product name');
  return issues;
};

const PARENT_CATEGORY_MAP: Record<string, string[]> = {
  backpacks: ['backpacks', 'college-backpacks', 'school-backpacks', 'laptop-backpacks', 'trekking-backpacks'],
  travel: ['travel', 'luggage', 'duffle', 'trolley-bags'],
  accessories: ['accessories', 'pouch', 'lunch-bag', 'daypack', 'tote-bag'],
  junior: ['junior', 'school-backpacks', 'trolley-backpacks', 'kids-trolley', 'combo-set', 'pouches', 'lunch-bags', 'kids-accessories'],
  premium: ['premium', 'premium-backpacks', 'premium-luggage', 'premium-accessories', 'premium-duffle'],
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
      const catSlug = String(category).trim();
      const subSlugs = PARENT_CATEGORY_MAP[catSlug] || [catSlug];
      
      const { data: matchedCats } = await supabase
        .from('categories')
        .select('id, slug')
        .in('slug', subSlugs);

      const catIds = (matchedCats || []).map((c) => c.id);
      
      if (catSlug === 'junior') {
        // Strict Junior filter: only Junior / Kids bags; never match laptop, college, or trekking
        query = query.not('sub_category', 'in', '("laptop-backpacks","college-backpacks","trekking-backpacks")');
        const orConditions: string[] = ['gender.eq.kids'];
        if (catIds.length > 0) {
          orConditions.push(`category_id.in.(${catIds.join(',')})`);
        }
        if (subSlugs.length > 0) {
          orConditions.push(`sub_category.in.(${subSlugs.join(',')})`);
        }
        query = query.or(orConditions.join(','));
      } else {
        const orConditions: string[] = [];
        if (catIds.length > 0) {
          orConditions.push(`category_id.in.(${catIds.join(',')})`);
        }
        if (subSlugs.length > 0) {
          orConditions.push(`sub_category.in.(${subSlugs.join(',')})`);
        }
        if (orConditions.length > 0) {
          query = query.or(orConditions.join(','));
        } else {
          query = query.eq('sub_category', catSlug);
        }
      }
    }

    if (sub_category) {
      const subCatStr = String(sub_category).trim();
      query = query.eq('sub_category', subCatStr);
    }

    if (gender) {
      query = query.eq('gender', gender);
    }

    if (age_range) {
      query = query.eq('age_range', age_range);
    }

    const isDuffleCategory = category === 'duffle' || category === 'premium-duffle' || sub_category === 'duffle';

    if (isPremium === 'true' || category === 'premium') {
      if (isDuffleCategory) {
        query = query.or('is_premium.eq.true,name.ilike.%Cult%,sku.in.("INV29561","INV29562","INV29563")');
      } else {
        query = query.eq('is_premium', true);
      }
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
      'bestseller': { column: 'rating', ascending: false },
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
    // Public catalogue queries are identical for every shopper and are safe to
    // cache at the Vercel edge. Admin inventory views remain private.
    if (!includeInactive) {
      res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    }
    res.json({ products: data, page: pageNum, limit: limitNum });
  } catch (err: any) {
    console.error('❌ Products List Controller Exception:', err);
    res.status(500).json({
      error: 'Database error',
      message: 'Failed to fetch products. Please try again.',
      ...(process.env.NODE_ENV === 'development' && { details: err.message })
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
    const subSlug = (body.sub_category || body.subcategory || '').trim();
    const mainSlug = (body.category || 'backpacks').trim();

    // 1. Resolve Category ID — try sub_category slug first, then category slug, then name
    let catData: { id: string } | null = null;
    if (subSlug) {
      const bySubSlug = await supabase.from('categories').select('id').eq('slug', subSlug).maybeSingle();
      if (bySubSlug.data) catData = bySubSlug.data;
    }
    if (!catData && mainSlug) {
      const bySlug = await supabase.from('categories').select('id').eq('slug', mainSlug).maybeSingle();
      if (bySlug.data) {
        catData = bySlug.data;
      } else {
        const byName = await supabase.from('categories').select('id').ilike('name', mainSlug).maybeSingle();
        catData = byName.data;
      }
    }

    const isPrem = body.isPremium ?? body.is_premium ?? (mainSlug === 'premium' || subSlug.startsWith('premium-'));

    // 2. Clean up & Map
    const productData = {
      sku: body.sku || 'PB-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      slug: body.slug || (body.name || '').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
      name: body.name,
      description: body.description || '',
      price: Number(body.price),
      original_price: Number(body.originalPrice || body.original_price || body.price),
      category_id: catData?.id || body.category_id,
      image: (Array.isArray(body.images) && body.images[0]) ? body.images[0] : (body.image || ''),
      images: Array.isArray(body.images) ? body.images.filter(Boolean) : (body.image ? [body.image] : []),
      colors: body.colors || [],
      features: body.features || [],
      stock: body.stock !== undefined ? Number(body.stock) : 0,
      is_new: body.isNew ?? body.is_new ?? false,
      is_highlighted: body.highlighted ?? body.is_highlighted ?? false,
      is_premium: !!isPrem,
      gender: body.gender || 'unisex',
      size: body.size || '',
      age_range: body.ageRange || body.age_range || '',
      sub_category: subSlug || '',
      junior_style: body.junior_style || body.juniorStyle || null,
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

    const { data, error } = await supabase.from('products').insert(productData).select('*, categories(slug, title)').single();
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
  const subSlug = (req.body.sub_category || req.body.subcategory || '').trim();
  const mainSlug = (req.body.category || '').trim();
  
  if (subSlug || mainSlug) {
    let catData: { id: string } | null = null;
    if (subSlug) {
      const bySubSlug = await supabase.from('categories').select('id').eq('slug', subSlug).maybeSingle();
      if (bySubSlug.data) catData = bySubSlug.data;
    }
    if (!catData && mainSlug) {
      const bySlug = await supabase.from('categories').select('id').eq('slug', mainSlug).maybeSingle();
      if (bySlug.data) {
        catData = bySlug.data;
      } else {
        const byName = await supabase.from('categories').select('id').ilike('name', mainSlug).maybeSingle();
        catData = byName.data;
      }
    }
    if (catData) updates.category_id = catData.id;
    if (req.body.sub_category !== undefined || req.body.subcategory !== undefined) {
      updates.sub_category = subSlug || '';
    }
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
    if (f === 'junior_style' && req.body.juniorStyle !== undefined) updates[f] = req.body.juniorStyle;
  });

  if (mainSlug === 'premium' || subSlug.startsWith('premium-')) {
    updates.is_premium = true;
  } else if (req.body.isPremium !== undefined || req.body.is_premium !== undefined) {
    updates.is_premium = req.body.isPremium !== undefined ? !!req.body.isPremium : !!req.body.is_premium;
  } else if (mainSlug) {
    updates.is_premium = false;
  }

  if (Array.isArray(updates.images)) {
    updates.images = updates.images.filter(Boolean);
    if (updates.images.length > 0 && !updates.image) {
      updates.image = updates.images[0];
    }
  }

  if (!Object.keys(updates).length) return res.status(400).json({ error: 'No valid fields provided for update' });

  const { data, error } = await supabase.from('products').update(updates).eq('id', req.params.id).select('*, categories(slug, title)').single();
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
    res.status(500).json({
      error: 'Failed to process Excel file',
      message: 'Failed to process Excel file. Please try again.',
      ...(process.env.NODE_ENV === 'development' && { details: err.message })
    });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 1. Check if product is referenced in order_items
    const { data: orderItem } = await supabase
      .from('order_items')
      .select('id')
      .eq('product_id', id)
      .limit(1)
      .maybeSingle();

    if (orderItem) {
      // Product has order history: archive it (soft-delete) to preserve sales records and FK constraints
      const { error: updateErr } = await supabase
        .from('products')
        .update({ is_active: false, stock: 0 })
        .eq('id', id);

      if (updateErr) throw updateErr;
      return res.json({ message: 'Product archived (has order history)' });
    }

    // 2. Clean up any related child records before hard deleting
    await supabase.from('wishlists').delete().eq('product_id', id);
    await supabase.from('cart_items').delete().eq('product_id', id);
    await supabase.from('reviews').delete().eq('product_id', id);

    // 3. Delete the product
    const { error: delErr } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (delErr) throw delErr;
    res.json({ message: 'Product deleted successfully' });
  } catch (err: any) {
    console.error('❌ Delete Product Error:', err);
    res.status(500).json({
      error: 'Failed to delete product',
      message: 'Failed to delete product. Please try again.',
      ...(process.env.NODE_ENV === 'development' && { details: err.message })
    });
  }
};
