import { describe, it, expect } from 'vitest';
import { formatPrice, getCategoryBySlug, getSubcategories } from '../constants/products';
import { resolveProductColors, resolveProductAgeRange, isJuniorProduct } from './productFilters';
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

describe('Junior Product Exclusions & Filters', () => {
  it('strictly excludes laptop, college, and trekking bags from junior views', () => {
    const laptopProduct: any = {
      name: 'Priority Atlas 001 Laptop Bag BLK',
      category: 'laptop-backpacks',
      sub_category: 'laptop-backpacks',
    };
    const collegeProduct: any = {
      name: 'Priority Blockbuster 001 College Backpack',
      category: 'college-backpacks',
      sub_category: 'college-backpacks',
    };
    const trekkingProduct: any = {
      name: 'Priority Mount 001 Trekking Rucksack',
      category: 'trekking-backpacks',
      sub_category: 'trekking-backpacks',
    };

    expect(isJuniorProduct(laptopProduct)).toBe(false);
    expect(isJuniorProduct(collegeProduct)).toBe(false);
    expect(isJuniorProduct(trekkingProduct)).toBe(false);
  });

  it('correctly includes junior school bags and kids trolleys', () => {
    const schoolBag: any = {
      name: 'Priority Tipsy 001 School Bag',
      category: 'junior',
      sub_category: 'school-backpacks',
      gender: 'kids',
    };
    const trolleyBag: any = {
      name: 'Priority Disney Princess Kids Trolley',
      category: 'junior',
      sub_category: 'kids-trolley',
      gender: 'kids',
    };
    const comboBag: any = {
      name: 'Priority Gracious Junior Combo Set',
      category: 'junior',
      sub_category: 'combo-set',
      gender: 'kids',
    };
    const trolleyBackpack: any = {
      name: 'Priority Marvel Spiderman Rolling Trolley Backpack',
      category: 'junior',
      sub_category: 'trolley-backpacks',
      gender: 'kids',
    };

    expect(isJuniorProduct(schoolBag)).toBe(true);
    expect(isJuniorProduct(trolleyBag)).toBe(true);
    expect(isJuniorProduct(comboBag)).toBe(true);
    expect(isJuniorProduct(trolleyBackpack)).toBe(true);
    expect(trolleyBag.sub_category).not.toBe(trolleyBackpack.sub_category);
  });
});

