import { describe, it, expect } from 'vitest';
import { formatPrice, getCategoryBySlug, getSubcategories } from '../constants/products';
import { resolveProductColors, resolveProductAgeRange } from './productFilters';
import { getProductPrimaryImage, getProductSecondaryImage } from './productImages';
import { resolveProductCategory } from '../components/admin/AdminProducts';
import { Product } from '../types';

describe('Pricing & Currency Utilities', () => {
  it('formats INR price correctly with no decimals', () => {
    const formatted = formatPrice(1999);
    // INR format includes ₹ or currency symbol and 1,999
    expect(formatted).toContain('1,999');
  });

  it('formats zero correctly', () => {
    const formatted = formatPrice(0);
    expect(formatted).toContain('0');
  });
});

describe('Category Resolution Utilities', () => {
  it('finds category by slug', () => {
    const cat = getCategoryBySlug('backpacks');
    expect(cat).toBeDefined();
    expect(cat?.title).toBe('TRENDY');
  });

  it('finds subcategories by parent slug', () => {
    const subs = getSubcategories('backpacks');
    expect(subs.length).toBeGreaterThan(0);
    expect(subs.some(s => s.slug === 'college-backpacks')).toBe(true);
  });

  it('resolves product categories correctly', () => {
    const sampleProduct = {
      name: 'Luxe Backpack',
      is_premium: true,
      category: 'premium',
      sub_category: 'backpacks'
    };
    const resolved = resolveProductCategory(sampleProduct);
    expect(resolved.mainCat).toBe('premium');
    expect(resolved.subCat).toBe('premium-backpacks');
  });
});

describe('Product Filters & Color Detection', () => {
  it('detects navy color from product title', () => {
    const product: Product = {
      id: '1',
      name: 'Priority Classic Navy Blue Backpack',
      price: 1299,
      originalPrice: 1999,
      category: 'backpacks',
      stock: 10,
      description: 'Durable daily backpack',
      rating: 4.5,
      reviews: 12,
      isNew: false,
      isPremium: false,
      images: ['/test.jpg'],
      features: ['waterproof']
    };

    const colors = resolveProductColors(product);
    expect(colors.some(c => c.name.toLowerCase().includes('navy'))).toBe(true);
  });

  it('resolves age range for toddler/playgroup bags', () => {
    const toddlerProduct: Product = {
      id: '2',
      name: 'Priority Junior Playgroup Toddler Bag',
      price: 699,
      originalPrice: 999,
      category: 'junior',
      stock: 5,
      description: 'Small 12 inch bag for playschool',
      rating: 4.8,
      reviews: 8,
      isNew: true,
      isPremium: false,
      images: ['/junior.jpg'],
      features: []
    };

    const ageRange = resolveProductAgeRange(toddlerProduct);
    expect(ageRange).toBe('Below 3 Years');
  });
});

describe('Product Image Utilities', () => {
  it('extracts primary and secondary images correctly', () => {
    const product: Product = {
      id: '3',
      name: 'Priority Explorer Trek',
      price: 2499,
      originalPrice: 3499,
      category: 'backpacks',
      stock: 15,
      description: 'Trekking bag',
      rating: 4.7,
      reviews: 20,
      isNew: false,
      isPremium: false,
      images: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
      features: []
    };

    expect(getProductPrimaryImage(product)).toBe('https://example.com/img1.jpg');
    expect(getProductSecondaryImage(product)).toBe('https://example.com/img2.jpg');
  });
});
