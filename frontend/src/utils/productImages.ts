import traworldImagesMap from '../constants/traworldImages.json';

const traworldMap = traworldImagesMap as Record<string, string[]>;

/**
 * Resolves the primary image for a product.
 * If the product is a Traworld product, it maps to the authentic Myntra CDN URL.
 */
export function getProductPrimaryImage(product?: {
  id?: string;
  sku?: string;
  image?: string;
  images?: string[];
}): string {
  if (!product) return '';
  const sku = product.sku || product.id || '';
  if (sku.startsWith('TRW-') && traworldMap[sku]?.[0]) {
    return traworldMap[sku][0];
  }
  return product.image || product.images?.[0] || '';
}

/**
 * Resolves the secondary (hover) image for a product.
 */
export function getProductSecondaryImage(product?: {
  id?: string;
  sku?: string;
  image?: string;
  images?: string[];
}): string | undefined {
  if (!product) return undefined;
  const sku = product.sku || product.id || '';
  if (sku.startsWith('TRW-') && traworldMap[sku]?.[1]) {
    return traworldMap[sku][1];
  }
  return product.images?.[1];
}

/**
 * Resolves all gallery images for a product.
 */
export function getProductAllImages(product?: {
  id?: string;
  sku?: string;
  image?: string;
  images?: string[];
}): string[] {
  if (!product) return [];
  const sku = product.sku || product.id || '';
  if (sku.startsWith('TRW-') && traworldMap[sku]?.length) {
    return traworldMap[sku];
  }
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images.filter(Boolean);
  }
  return product.image ? [product.image] : [];
}

/**
 * Resolves appropriate category fallback image for broken image events.
 */
export function getProductFallback(
  product?: { category?: string; sub_category?: string; is_premium?: boolean },
  theme?: string
): string {
  if (theme === 'premium' || product?.is_premium) {
    return '/Traworld/luggage.png';
  }
  const cat = (product?.category || product?.sub_category || '').toLowerCase();
  if (cat.includes('luggage') || cat.includes('travel') || cat.includes('trolley')) {
    return '/Category/Travelling Bag.jpg';
  }
  if (cat.includes('access')) {
    return '/Category/Accessories.jpg';
  }
  if (cat.includes('junior') || cat.includes('school')) {
    return '/New Arrival/Artboard 1@2x.png';
  }
  return '/Category/Backpack.jpg';
}
