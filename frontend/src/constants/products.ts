import type { Product, CategoryInfo } from '../types';

// ─── Categories ──────────────────────────────────────────────
export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'backpacks',
    title: 'TRENDY',
    subtitle: 'BACKPACKS',
    slug: 'backpacks',
    image: 'https://lh3.googleusercontent.com/aida/ADBb0ujuQPAAo1qnLVdfWGCHjfcF2mTWv5IC-o-PStyWouff_BWsOBXS-HJLTa1S2M63l3LLw0-ARnnoivB9fU1vExT0fH87tg66KKoVtcq7P_4FRLjnB7fSUT9CC1JQHuH9aWcNLvUAy1DhppzaAN0WUf8whsecUq0f6IMy7FhjIgWpTXXRvdb9Jyh0FZz7sC2zJ3qbY3K760qyFDMNqIlArv8dwPbMfRCQ4_yGLuoruQcTTAQKR1fO2Lqy3cQ',
    bgColor: '#f2c94c',
    description: 'Explore our range of stylish and functional backpacks for every occasion.',
  },
  {
    id: 'college-backpacks',
    title: 'TRENDY',
    subtitle: 'COLLEGE BACKPACKS',
    slug: 'college-backpacks',
    image: 'https://lh3.googleusercontent.com/aida/ADBb0ujuQPAAo1qnLVdfWGCHjfcF2mTWv5IC-o-PStyWouff_BWsOBXS-HJLTa1S2M63l3LLw0-ARnnoivB9fU1vExT0fH87tg66KKoVtcq7P_4FRLjnB7fSUT9CC1JQHuH9aWcNLvUAy1DhppzaAN0WUf8whsecUq0f6IMy7FhjIgWpTXXRvdb9Jyh0FZz7sC2zJ3qbY3K760qyFDMNqIlArv8dwPbMfRCQ4_yGLuoruQcTTAQKR1fO2Lqy3cQ',
    bgColor: '#f2c94c',
    description: 'Backpacks designed for college life — spacious, durable, and stylish.',
    parentCategory: 'backpacks',
  },
  {
    id: 'school-backpacks',
    title: 'DURABLE',
    subtitle: 'SCHOOL BACKPACKS',
    slug: 'school-backpacks',
    image: 'https://lh3.googleusercontent.com/aida/ADBb0ujuQPAAo1qnLVdfWGCHjfcF2mTWv5IC-o-PStyWouff_BWsOBXS-HJLTa1S2M63l3LLw0-ARnnoivB9fU1vExT0fH87tg66KKoVtcq7P_4FRLjnB7fSUT9CC1JQHuH9aWcNLvUAy1DhppzaAN0WUf8whsecUq0f6IMy7FhjIgWpTXXRvdb9Jyh0FZz7sC2zJ3qbY3K760qyFDMNqIlArv8dwPbMfRCQ4_yGLuoruQcTTAQKR1fO2Lqy3cQ',
    bgColor: '#6aa5de',
    description: 'Sturdy, fun backpacks built to handle the school day.',
    parentCategory: 'backpacks',
  },
  {
    id: 'laptop-backpacks',
    title: 'PROFESSIONAL',
    subtitle: 'LAPTOP BACKPACKS',
    slug: 'laptop-backpacks',
    image: 'https://lh3.googleusercontent.com/aida/ADBb0ujuQPAAo1qnLVdfWGCHjfcF2mTWv5IC-o-PStyWouff_BWsOBXS-HJLTa1S2M63l3LLw0-ARnnoivB9fU1vExT0fH87tg66KKoVtcq7P_4FRLjnB7fSUT9CC1JQHuH9aWcNLvUAy1DhppzaAN0WUf8whsecUq0f6IMy7FhjIgWpTXXRvdb9Jyh0FZz7sC2zJ3qbY3K760qyFDMNqIlArv8dwPbMfRCQ4_yGLuoruQcTTAQKR1fO2Lqy3cQ',
    bgColor: '#a2d59b',
    description: 'Padded, protective bags engineered for your laptop and tech gear.',
    parentCategory: 'backpacks',
  },
  {
    id: 'trekking-backpacks',
    title: 'ADVENTURE',
    subtitle: 'TREKKING BACKPACKS',
    slug: 'trekking-backpacks',
    image: 'https://lh3.googleusercontent.com/aida/ADBb0ujuQPAAo1qnLVdfWGCHjfcF2mTWv5IC-o-PStyWouff_BWsOBXS-HJLTa1S2M63l3LLw0-ARnnoivB9fU1vExT0fH87tg66KKoVtcq7P_4FRLjnB7fSUT9CC1JQHuH9aWcNLvUAy1DhppzaAN0WUf8whsecUq0f6IMy7FhjIgWpTXXRvdb9Jyh0FZz7sC2zJ3qbY3K760qyFDMNqIlArv8dwPbMfRCQ4_yGLuoruQcTTAQKR1fO2Lqy3cQ',
    bgColor: '#ff7675',
    description: 'Heavy-duty packs for hikers, campers, and outdoor enthusiasts.',
    parentCategory: 'backpacks',
  },
  {
    id: 'luggage',
    title: 'PREMIUM',
    subtitle: 'LUGGAGE',
    slug: 'luggage',
    image: 'https://lh3.googleusercontent.com/aida/ADBb0ugpMFql-z8CZ76u7Kv1ANeppDp-zkjm1-9N_DjNMJhEt86N7NrwWDE2B25Zz87CMECAjO5qkTg7HuRdXiYH6ahRxxX0h6j4sOxf4dIJBexMVtilAu-I95P-z_IhQNTQBEBNlUbLijvFtAH5lGfIGQb0rtOwTi6PWcf99-nfACCAcxYPwVRohOMk4UyxfeXBF_sQVQhM3xWcO6p34DV93BXTbrPit3VOpJPugMfx9-c9o_CY2dnztdti67I',
    bgColor: '#a2d59b',
    description: 'Travel in style with our collection of premium luggage.',
  },
  {
    id: 'accessories',
    title: 'STYLISH',
    subtitle: 'ACCESSORIES',
    slug: 'accessories',
    image: 'https://lh3.googleusercontent.com/aida/ADBb0uhmc_Pc02VGmcnle5vS1_BQTHh5B1xJhWFdlXKj65tl5yFYCJasjMQBSWmPe0p0UAlLV8k9MkEXwTj95BDJTxP6mYogzYtMWGKQhWp5DcPUWyvZ9J_Bqcxe0npjbVsw0rOWylfgCUM7iKQiNvsHBK_w2x2U890sFNfkXcx3A9qSzCsOHGAgWQwHPtje4BztfZq2SIObaKfVeKMEB0cMqVCCIU0qDWK9b3DIxdXhGPdI8korNKiFC8mAKO0',
    bgColor: '#6aa5de',
    description: 'Complete your look with our range of bags and travel accessories.',
  },
  {
    id: 'junior',
    title: 'FUN & DURABLE',
    subtitle: 'PRIORITY JUNIOR',
    slug: 'junior',
    image: 'https://lh3.googleusercontent.com/aida/ADBb0ujuQPAAo1qnLVdfWGCHjfcF2mTWv5IC-o-PStyWouff_BWsOBXS-HJLTa1S2M63l3LLw0-ARnnoivB9fU1vExT0fH87tg66KKoVtcq7P_4FRLjnB7fSUT9CC1JQHuH9aWcNLvUAy1DhppzaAN0WUf8whsecUq0f6IMy7FhjIgWpTXXRvdb9Jyh0FZz7sC2zJ3qbY3K760qyFDMNqIlArv8dwPbMfRCQ4_yGLuoruQcTTAQKR1fO2Lqy3cQ',
    bgColor: '#ff7675',
    description: 'Fun, durable bags designed specifically for little explorers.',
  },
  {
    id: 'premium',
    title: 'COLLECTION',
    subtitle: 'PREMIUM COLLECTION',
    slug: 'premium',
    image: 'https://lh3.googleusercontent.com/aida/ADBb0uhzm92TzHT0BVAIYYXSuCFymoj0WkZF2ABtFxBQpaNuWlYc4JQs31v9FqjXuuM9MuGjx82KACn1vS3GnpVv42-N9i6qWNMqLpFYAeAr0ZYMiru5D5N-Gh1SFh24TB5WHIvQOvKEdlnTeEYxrwa85bV0YIkcLwXW1ab9sdfFbje2EEetEQToz_5yjSeGyUVDKHcN6DQP_JmLLbHxdL6VACKP0lWfKQf6UZw_Dw_9_x84AW4dPubjbPtv-Qs',
    bgColor: '#302a5e',
    description: 'Exclusive, high-end travel gear and accessories for the discerning traveller.',
  },
];

export const PRODUCTS: Product[] = [];

// ─── Helper Functions ────────────────────────────────────────
export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return PRODUCTS.filter((p) => p.category === categorySlug);
}

export function getPremiumProducts(): Product[] {
  return PRODUCTS.filter((p) => p.isPremium);
}

export function getCategoryBySlug(slug: string): CategoryInfo | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getSubcategories(parentSlug: string): CategoryInfo[] {
  return CATEGORIES.filter((c) => c.parentCategory === parentSlug);
}

export function getBestSellers(): Product[] {
  return [...PRODUCTS].sort((a, b) => b.reviews - a.reviews).slice(0, 5);
}

export function getNewArrivals(): Product[] {
  return PRODUCTS.filter((p) => p.isNew).slice(0, 8);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase();
  return PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
  );
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// Legacy compat — map from old CATEGORY_DATA keys to new system
export const CATEGORY_DATA: Record<string, { title: string; subtitle: string; image: string; bgColor: string; products: Product[] }> = {};
for (const cat of CATEGORIES) {
  CATEGORY_DATA[cat.id.toUpperCase().replace(/-/g, '_')] = {
    title: cat.title,
    subtitle: cat.subtitle,
    image: cat.image,
    bgColor: cat.bgColor,
    products: getProductsByCategory(cat.slug),
  };
}
// Also map parent categories to include all subcategory products
CATEGORY_DATA['BACKPACKS'] = {
  ...CATEGORY_DATA['BACKPACKS'] || { title: 'TRENDY', subtitle: 'BACKPACKS', image: '', bgColor: '#f2c94c' },
  products: PRODUCTS.filter((p) => p.category.includes('backpack')),
};
