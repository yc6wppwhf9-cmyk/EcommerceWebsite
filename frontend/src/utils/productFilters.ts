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
  { id: '30-36-months', label: '30 to 36 Months', detail: 'Nursery Play School · 10–12 In (25–30 cm)' },
  { id: '3-to-5-years', label: '3 to 5 Years', detail: 'LKG / UKG · 14–15 In (36–38 cm)' },
  { id: '6-to-10-years', label: '6 to 10 Years', detail: '1st Std to 3rd Std · 16–17 Inch (41–44 cm)' },
  { id: '11-plus-years', label: '11 Years & Above', detail: '4th Std & Above · 18–19 Inch (46–48 cm)' },
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
 * Intelligent age & size range resolution for school & junior bags based on Priority Junior Size Chart:
 * 1. Nursery Play School (10–12 In / 25–30 cm) -> 30 to 36 Months
 * 2. LKG / UKG (14–15 In / 36–38 cm) -> 3 to 5 Years
 * 3. 1st Std to 3rd Std (16–17 Inch / 41–44 cm) -> 6 to 10 Years
 * 4. 4th Std & Above (18–19 Inch / 46–48 cm) -> 11 Years & Above
 */
export function resolveProductAgeRange(p: Product): string {
  const text = `${p.name || ''} ${p.description || ''} ${(p as any).sub_category || ''} ${(p as any).category || ''} ${JSON.stringify(p.specifications || '')}`.toLowerCase();

  // 1. Nursery Play School: 10–12 In (25–30 cm) -> 30 to 36 Months
  if (
    text.includes('30 to 36') ||
    text.includes('30-36') ||
    text.includes('below 3') ||
    text.includes('playgroup') ||
    text.includes('playschool') ||
    text.includes('play school') ||
    text.includes('nursery') ||
    text.includes('toddler') ||
    text.includes('mini backpack') ||
    text.includes('10 inch') ||
    text.includes('10"') ||
    text.includes('11 inch') ||
    text.includes('11"') ||
    text.includes('12 inch') ||
    text.includes('12"') ||
    text.includes('25 cm') ||
    text.includes('28 cm') ||
    text.includes('30 cm')
  ) {
    return '30 to 36 Months';
  }

  // 2. LKG / UKG: 14–15 In (36–38 cm) -> 3 to 5 Years
  if (
    text.includes('3 to 5') ||
    text.includes('3-5') ||
    text.includes('lkg') ||
    text.includes('ukg') ||
    text.includes('kindergarten') ||
    text.includes('14 inch') ||
    text.includes('14"') ||
    text.includes('15 inch') ||
    text.includes('15"') ||
    text.includes('36 cm') ||
    text.includes('38 cm') ||
    text.includes('combo set') ||
    text.includes('dreamy') ||
    text.includes('tiffin pouch')
  ) {
    return '3 to 5 Years';
  }

  // 3. 1st Std to 3rd Std: 16–17 Inch (41–44 cm) -> 6 to 10 Years
  if (
    text.includes('6 to 10') ||
    text.includes('6-10') ||
    text.includes('1st std') ||
    text.includes('2nd std') ||
    text.includes('3rd std') ||
    text.includes('primary') ||
    text.includes('16 inch') ||
    text.includes('16"') ||
    text.includes('17 inch') ||
    text.includes('17"') ||
    text.includes('41 cm') ||
    text.includes('44 cm') ||
    text.includes('precious') ||
    text.includes('drift') ||
    text.includes('junior') ||
    text.includes('speedo') ||
    text.includes('funky') ||
    text.includes('school bag') ||
    text.includes('school backpack') ||
    (p.gender === 'kids')
  ) {
    return '6 to 10 Years';
  }

  // 4. 4th Std & Above: 18–19 Inch (46–48 cm) -> 11 Years & Above
  return '11 Years & Above';
}
