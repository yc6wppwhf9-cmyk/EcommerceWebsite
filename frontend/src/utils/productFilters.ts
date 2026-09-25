import { Product } from '../types';

export interface ColorOption {
  name: string;
  code: string;
  border?: boolean;
}

export const COLOR_PALETTE: Record<string, { label: string; hex: string; border?: boolean }> = {
  black: { label: 'Black', hex: '#1A1A1A' },
  navy: { label: 'Navy Blue', hex: '#1B365D' },
  blue: { label: 'Royal Blue', hex: '#2563EB' },
  skyblue: { label: 'Sky Blue', hex: '#38BDF8' },
  teal: { label: 'Teal', hex: '#0D9488' },
  green: { label: 'Olive Green', hex: '#4D7C0F' },
  red: { label: 'Red', hex: '#DC2626' },
  maroon: { label: 'Maroon', hex: '#881337' },
  pink: { label: 'Pink', hex: '#EC4899' },
  lightpink: { label: 'Light Pink', hex: '#FBCFE8' },
  yellow: { label: 'Yellow', hex: '#FACC15' },
  orange: { label: 'Orange', hex: '#F97316' },
  purple: { label: 'Purple', hex: '#9333EA' },
  grey: { label: 'Grey', hex: '#6B7280' },
  brown: { label: 'Brown', hex: '#78350F' },
  beige: { label: 'Beige', hex: '#D7C4B7' },
  cream: { label: 'Cream', hex: '#FEF3C7', border: true },
  white: { label: 'White', hex: '#FFFFFF', border: true },
  multicolor: { label: 'Multi-Color', hex: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 50%, #FFE66D 100%)' },
};

export const AGE_RANGE_OPTIONS = [
  { id: 'below-3', label: 'Below 3 Years', detail: 'Playschool & Toddler (up to 30cm)' },
  { id: '3-to-5', label: '3 to 5 Years', detail: 'Nursery & KG (14" - 15")' },
  { id: '6-to-10', label: '6 to 10 Years', detail: 'Primary School (16" - 17")' },
  { id: '11-plus', label: '11 Years & Above', detail: 'Middle, High School & College (18.5"+)' },
];

/**
 * Intelligent color resolution for any product based on SKU, title, variants, and descriptions.
 */
export function resolveProductColors(p: Product): ColorOption[] {
  const detected = new Map<string, ColorOption>();

  // 1. Check existing variant colors if they have real distinct hex values
  const colorList = (p as any).colors || p.variants || [];
  colorList.forEach((v: any) => {
    const rawName = (v.name || v.color || '').trim().toLowerCase();
    const rawCode = (v.code || v.colorCode || '').trim();

    if (rawCode && rawCode !== '#111111' && rawCode !== '#000000' && rawCode.startsWith('#')) {
      const displayName = v.name || v.color || 'Color';
      detected.set(displayName.toLowerCase(), { name: displayName, code: rawCode });
    } else if (rawName && COLOR_PALETTE[rawName]) {
      const entry = COLOR_PALETTE[rawName];
      detected.set(rawName, { name: entry.label, code: entry.hex, border: entry.border });
    }
  });

  // 2. Infer from product title / SKU / description / specifications
  const text = `${p.name || ''} ${(p as any).sku || ''} ${p.description || ''} ${JSON.stringify(p.specifications || '')}`.toLowerCase();

  const colorPatterns: Array<{ key: string; regex: RegExp }> = [
    { key: 'lightpink', regex: /\b(lpnk|lpink|light\s*pink|pastel\s*pink|powder\s*pink|rose|baby\s*pink)\b/i },
    { key: 'pink', regex: /\b(pnk|pink|magenta|fuchsia)\b/i },
    { key: 'skyblue', regex: /\b(sky\s*blue|cyan|ice\s*blue|azure|light\s*blue)\b/i },
    { key: 'navy', regex: /\b(nvy|navy|navy\s*blue|midnight\s*blue|dark\s*blue)\b/i },
    { key: 'blue', regex: /\b(blu|blue|royal\s*blue|cobalt|denim|indigo)\b/i },
    { key: 'teal', regex: /\b(teal|turquoise|sea\s*green|aqua)\b/i },
    { key: 'green', regex: /\b(grn|green|olive|olv|mint|emerald|sage|khaki)\b/i },
    { key: 'yellow', regex: /\b(yel|yellow|mustard|mst|lemon|gold)\b/i },
    { key: 'orange', regex: /\b(org|orng|orange|peach|coral|tangerine)\b/i },
    { key: 'red', regex: /\b(red|crimson|ruby|scarlet)\b/i },
    { key: 'maroon', regex: /\b(mrn|maroon|wine|burgundy)\b/i },
    { key: 'purple', regex: /\b(prp|purple|violet|lavender|lilac)\b/i },
    { key: 'grey', regex: /\b(gry|grey|gray|charcoal|slate|silver)\b/i },
    { key: 'brown', regex: /\b(brn|brown|tan|coffee|camel|chocolate)\b/i },
    { key: 'beige', regex: /\b(beige|cream|sand|off\s*white|ivory)\b/i },
    { key: 'black', regex: /\b(blk|black|jet\s*black|noir|onyx)\b/i },
    { key: 'multicolor', regex: /\b(multi|colorblock|colourblock|rainbow|gradient|print|printed)\b/i },
  ];

  for (const { key, regex } of colorPatterns) {
    if (regex.test(text)) {
      const entry = COLOR_PALETTE[key];
      if (entry && !detected.has(entry.label.toLowerCase())) {
        detected.set(entry.label.toLowerCase(), { name: entry.label, code: entry.hex, border: entry.border });
      }
    }
  }

  // 3. Fallback: if nothing was detected, derive a consistent theme color from SKU hash so it is not black
  if (detected.size === 0) {
    const defaultPalette = [
      COLOR_PALETTE.navy,
      COLOR_PALETTE.teal,
      COLOR_PALETTE.green,
      COLOR_PALETTE.maroon,
      COLOR_PALETTE.grey,
      COLOR_PALETTE.black,
    ];
    const hash = (p.sku || p.id || 'bag').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const chosen = defaultPalette[hash % defaultPalette.length];
    detected.set(chosen.label.toLowerCase(), { name: chosen.label, code: chosen.hex, border: chosen.border });
  }

  return Array.from(detected.values());
}

/**
 * Intelligent age range resolution for school & junior bags.
 */
export function resolveProductAgeRange(p: Product): string {
  // An age group set on the product (from the catalogue sheet or admin) wins over guessing.
  const explicit = String((p as any).age_range || '').trim().toLowerCase();
  const match = AGE_RANGE_OPTIONS.find((o) => o.label.toLowerCase() === explicit);
  if (match) return match.label;

  const text = `${p.name || ''} ${p.description || ''} ${(p as any).sub_category || ''} ${(p as any).category || ''} ${JSON.stringify(p.specifications || '')}`.toLowerCase();

  // 1. Below 3 Years (Playgroup & Toddler)
  if (
    text.includes('below 3') ||
    text.includes('playgroup') ||
    text.includes('toddler') ||
    text.includes('playschool') ||
    text.includes('mini backpack') ||
    text.includes('12 inch') ||
    text.includes('12"') ||
    text.includes('30-36 months')
  ) {
    return 'Below 3 Years';
  }

  // 2. 3 to 5 Years (Nursery & KG)
  if (
    text.includes('3 to 5') ||
    text.includes('3-5') ||
    text.includes('nursery') ||
    text.includes('kindergarten') ||
    text.includes('kg') ||
    text.includes('14 inch') ||
    text.includes('14"') ||
    text.includes('15 inch') ||
    text.includes('15"') ||
    text.includes('combo set') ||
    text.includes('dreamy') ||
    text.includes('tiffin pouch')
  ) {
    return '3 to 5 Years';
  }

  // 3. 6 to 10 Years (Primary School & Kids Trolleys)
  if (
    text.includes('6 to 10') ||
    text.includes('6-10') ||
    text.includes('primary') ||
    text.includes('16 inch') ||
    text.includes('16"') ||
    text.includes('precious') ||
    text.includes('drift') ||
    text.includes('junior') ||
    text.includes('speedo') ||
    text.includes('school bag') ||
    text.includes('school backpack') ||
    text.includes('kids trolley') ||
    text.includes('kids-trolley') ||
    text.includes('trolley-backpack') ||
    text.includes('trolley-backpacks') ||
    ((text.includes('trolley') || text.includes('trolly')) && (text.includes('kids') || text.includes('junior') || (p as any).sub_category === 'kids-trolley' || (p as any).category === 'junior')) ||
    (p.gender === 'kids')
  ) {
    return '6 to 10 Years';
  }

  // 4. 11 Years & Above (Middle/High School, College, Adult)
  return '11 Years & Above';
}

/**
 * Returns true if a product strictly belongs to the Junior / Kids collection.
 * Explicitly rejects Laptop, College, Trekking / Rucksacks, and Adult luggage/duffles.
 */
export function isJuniorProduct(product: Product | any): boolean {
  if (!product) return false;
  const cat = String(product.categories?.slug || product.category || '').toLowerCase();
  const sub = String(product.sub_category || '').toLowerCase();
  const name = String(product.name || '').toLowerCase();
  const fam = String(product.family || product.specifications?.Family || '').toLowerCase();
  const gender = String(product.gender || '').toLowerCase();

  // 1. Explicit exclusion list for Laptop, College, Trekking & Adult lines
  const adultKeywords = [
    'laptop',
    'college',
    'trekking',
    'rucksack',
    'hiking',
    'mount 001',
    'protech',
    'xtreme',
    'zipster',
    'atlas',
    'matrix',
    'oxford',
    'blockbuster',
    'century',
    'champion',
    'dreamer',
    'fortuner',
    'iconic',
    'ignis',
    'incredible',
    'rockstar',
    'sonata',
    'stellar',
    'striker',
    'traworld',
  ];

  if (
    cat === 'laptop-backpacks' ||
    sub === 'laptop-backpacks' ||
    cat === 'college-backpacks' ||
    sub === 'college-backpacks' ||
    cat === 'trekking-backpacks' ||
    sub === 'trekking-backpacks' ||
    adultKeywords.some((k) => name.includes(k) || fam.includes(k))
  ) {
    return false;
  }

  // 2. Allow if kids gender or junior category or junior subcategory
  if (
    gender === 'kids' ||
    cat === 'junior' ||
    cat === 'kids-trolley' ||
    sub === 'kids-trolley' ||
    sub === 'trolley-backpacks' ||
    sub === 'combo-set' ||
    sub === 'school-backpacks' ||
    cat === 'school-backpacks'
  ) {
    return true;
  }

  return false;
}

