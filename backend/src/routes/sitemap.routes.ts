import { Router } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

const BASE = 'https://prioritybags.in';

const STATIC_PAGES = [
  { url: '/', priority: '1.0', freq: 'daily' },
  { url: '/backpacks', priority: '0.8', freq: 'weekly' },
  { url: '/luggage', priority: '0.8', freq: 'weekly' },
  { url: '/accessories', priority: '0.8', freq: 'weekly' },
  { url: '/premium', priority: '0.9', freq: 'weekly' },
  { url: '/junior', priority: '0.7', freq: 'weekly' },
];

// Dynamic sitemap including all active product pages
router.get('/sitemap.xml', async (_req, res) => {
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('is_active', true);

  const staticUrls = STATIC_PAGES.map(p => `
  <url>
    <loc>${BASE}${p.url}</loc>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('');

  const productUrls = (products || []).map(p => `
  <url>
    <loc>${BASE}/product/${p.slug}</loc>
    <lastmod>${new Date(p.updated_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${productUrls}
</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// Google Merchant Center shopping feed
router.get('/shopping-feed.xml', async (_req, res) => {
  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug, description, price, original_price, stock, images, sku, categories(title)')
    .eq('is_active', true);

  const items = (products || []).map((p: any) => {
    const image = Array.isArray(p.images) ? p.images[0] : '';
    const desc = (p.description || `Buy ${p.name} at Priority Bags. Premium quality bags.`).substring(0, 500);
    const availability = p.stock > 0 ? 'in_stock' : 'out_of_stock';
    const categoryTitle = p.categories?.title || 'Bags';

    return `
  <item>
    <g:id>${p.id}</g:id>
    <g:title><![CDATA[${p.name}]]></g:title>
    <g:description><![CDATA[${desc}]]></g:description>
    <g:link>${BASE}/product/${p.slug}</g:link>
    <g:image_link>${image}</g:image_link>
    <g:price>${Number(p.price).toFixed(2)} INR</g:price>
    ${p.original_price > p.price ? `<g:sale_price>${Number(p.price).toFixed(2)} INR</g:sale_price>` : ''}
    <g:availability>${availability}</g:availability>
    <g:condition>new</g:condition>
    <g:brand>Priority Bags</g:brand>
    <g:google_product_category>Apparel &amp; Accessories &gt; Handbags, Wallets &amp; Cases</g:google_product_category>
    <g:product_type><![CDATA[${categoryTitle}]]></g:product_type>
    ${p.sku ? `<g:mpn>${p.sku}</g:mpn>` : ''}
  </item>`;
  }).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Priority Bags</title>
    <link>${BASE}</link>
    <description>Premium bags collection — Priority Bags India</description>
    ${items}
  </channel>
</rss>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

export default router;
