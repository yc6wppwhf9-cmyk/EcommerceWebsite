export {};

const apiBase = (process.env.CATALOG_API_URL || 'https://ecommercewebsite-5z8k.onrender.com')
  .replace(/\/$/, '');

type Product = {
  id: string;
  name?: string;
  sku?: string;
  slug?: string;
  description?: string;
  image?: string;
  images?: string[];
  features?: string[];
  category_id?: string;
  price?: number;
  stock?: number;
  amazon_url?: string | null;
  flipkart_url?: string | null;
  myntra_url?: string | null;
  ajio_url?: string | null;
  is_active?: boolean;
};

const response = await fetch(`${apiBase}/api/products?limit=500`);
if (!response.ok) {
  throw new Error(`Catalogue API returned ${response.status}`);
}

const payload = await response.json() as { products?: Product[] };
const products = (payload.products || []).filter((product) => product.is_active !== false);
const failures: Array<{ id: string; name: string; issues: string[] }> = [];
const skuCounts = new Map<string, number>();
const slugCounts = new Map<string, number>();

for (const product of products) {
  if (product.sku) skuCounts.set(product.sku, (skuCounts.get(product.sku) || 0) + 1);
  if (product.slug) slugCounts.set(product.slug, (slugCounts.get(product.slug) || 0) + 1);
}

for (const product of products) {
  const issues: string[] = [];
  const images = [product.image, ...(Array.isArray(product.images) ? product.images : [])].filter(Boolean);
  if (!product.name?.trim()) issues.push('missing name');
  if (!product.sku?.trim()) issues.push('missing SKU');
  if (!product.slug?.trim()) issues.push('missing slug');
  if (!product.description?.trim() || product.description.trim().length < 40) issues.push('description under 40 characters');
  if (!images.length) issues.push('missing image');
  if (!Array.isArray(product.features) || !product.features.length) issues.push('missing features');
  if (!product.category_id) issues.push('missing category');
  if (!Number.isFinite(Number(product.price)) || Number(product.price) <= 0) issues.push('invalid price');
  if (!Number.isInteger(Number(product.stock)) || Number(product.stock) < 0) issues.push('invalid stock');
  if (product.sku && (skuCounts.get(product.sku) || 0) > 1) issues.push('duplicate SKU');
  if (product.slug && (slugCounts.get(product.slug) || 0) > 1) issues.push('duplicate slug');
  if (/\b(demo|placeholder|test product)\b/i.test(`${product.name || ''} ${product.description || ''}`)) issues.push('placeholder copy');
  if (!product.amazon_url && !product.flipkart_url && !product.myntra_url && !product.ajio_url) issues.push('no marketplace link (amazon/flipkart/myntra/ajio)');
  if (issues.length) failures.push({ id: product.id, name: product.name || 'Unnamed product', issues });
}

const externalLinks = products
  .filter((product) => product.amazon_url || product.flipkart_url || product.myntra_url || product.ajio_url)
  .map((product) => ({
    id: product.id,
    name: product.name,
    amazon_url: product.amazon_url,
    flipkart_url: product.flipkart_url,
    myntra_url: product.myntra_url,
    ajio_url: product.ajio_url,
  }));

console.log(JSON.stringify({
  api: apiBase,
  active_products: products.length,
  products_requiring_changes: failures.length,
  failures,
  external_links_requiring_manual_product_match_review: externalLinks,
}, null, 2));

if (!products.length || failures.length) process.exitCode = 1;
