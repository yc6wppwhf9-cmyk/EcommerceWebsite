// ─── Home Page Constants ─────────────────────────────────────────────────────
// Centralised here so Home.tsx stays a slim composition file and every section
// component can cherry-pick only what it needs.

// ─── Hero Slider ─────────────────────────────────────────────────────────────

/** Native pixel size of the hero creatives — the slider locks to this ratio. */
export const HERO_W = 2880;
export const HERO_H = 1621;

export interface HeroSlide {
  src: string;
  badge: string;
  title: string;
  subtitle: string;
  cta: string;
  to: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    src: '/Creatives/1.png',
    badge: 'NEW 2026 COLLECTION',
    title: 'ENGINEERED FOR MODERN EXPLORERS',
    subtitle: 'Ergonomic backpacks & travel gear designed for university, work, and urban travel.',
    cta: 'Explore Campus Picks',
    to: '/college-backpacks',
  },
  {
    src: '/Creatives/2.png',
    badge: 'JUNIOR & SCHOOL SERIES',
    title: 'LIGHTWEIGHT, VIBRANT & DURABLE',
    subtitle: 'Smart storage, waterproof fabrics & posture-support design for kids & juniors.',
    cta: 'Shop Junior Collection',
    to: '/junior',
  },
  {
    src: '/Creatives/3.png',
    badge: 'PREMIUM TRAVEL GEAR',
    title: 'TRAVEL WITHOUT BOUNDARIES',
    subtitle: 'High-durability trolley bags & duffles built for effortless journeys.',
    cta: 'Shop Luggage',
    to: '/luggage',
  },
  {
    src: '/Creatives/4.png',
    badge: 'EXECUTIVE LAPTOP SERIES',
    title: 'SLEEK PROTECTION FOR TECH',
    subtitle: 'Padded laptop compartments with weather resistance & sleek minimalist design.',
    cta: 'Shop Laptop Bags',
    to: '/laptop-backpacks',
  },
  {
    src: '/Creatives/5.png',
    badge: 'URBAN ACCESSORIES',
    title: 'STYLE & FUNCTION COMBINED',
    subtitle: 'Premium travel accessories engineered for seamless organization on the go.',
    cta: 'Explore Accessories',
    to: '/accessories',
  },
];

export const heroVariants = {
  enter: { opacity: 0, scale: 1.04 },
  center: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
};

// ─── Backpack Tabs ───────────────────────────────────────────────────────────

export interface BackpackTab {
  id: string;
  label: string;
  image: string;
  to: string;
  apiParams: Record<string, string>;
}

export const BACKPACK_TABS: BackpackTab[] = [
  { id: 'college-backpacks',  label: 'College Backpack',  image: '/Category/ref.png',                    to: '/college-backpacks',  apiParams: { category: 'college-backpacks' } },
  { id: 'laptop-backpacks',   label: 'Laptop Backpack',   image: '/junior/Drift Sky Blue_ Hero 1.png',   to: '/laptop-backpacks',   apiParams: { category: 'laptop-backpacks' } },
  { id: 'trekking-backpacks', label: 'Trekking Backpack', image: '/Category/Travelling Bag.jpg',         to: '/trekking-backpacks', apiParams: { category: 'trekking-backpacks' } },
];

// ─── Category Cards ──────────────────────────────────────────────────────────

export interface CategoryCard {
  to: string;
  label: string;
  img: string;
}

export const CATS: CategoryCard[] = [
  { to: '/backpacks',   label: 'Backpacks',   img: '/Category/Backpack.jpg' },
  { to: '/luggage',     label: 'Luggage',     img: '/Category/Travelling Bag.jpg' },
  { to: '/accessories', label: 'Accessories', img: '/Category/Accessories.jpg' },
];

// ─── Editorial Banner ────────────────────────────────────────────────────────

export const IMG = {
  banner: '/Category/Artboard 1 1.png',
  refPoster: '/Category/ref.png',
};

/** Primary editorial banner CTA — always present, regardless of gender tagging. */
export const BANNER_CTA = { to: '/luggage', label: 'Shop Now' } as const;

/**
 * Secondary editorial banner CTAs. Each is shown only if its gender query
 * returns stock, so a button never navigates to an empty product grid.
 */
export const GENDER_LINKS = [
  { gender: 'women', to: '/women', label: 'Shop Women' },
  { gender: 'men',   to: '/men',   label: 'Shop Men' },
] as const;

export type GenderLink = (typeof GENDER_LINKS)[number];

// ─── Column Tiers ────────────────────────────────────────────────────────────
// Desktop column counts per width tier. Wider screens get more products rather
// than bigger cards — the cards render their image `object-contain` inside a
// padded square, so inflating them just grows the white space around the photo.
// Classes are written out in full because Tailwind cannot see interpolated names.

export interface ColumnTier {
  min: number;
  tabs: number;
  tabsClass: string;
  best: number;
  bestClass: string;
}

export const COLUMN_TIERS: ColumnTier[] = [
  { min: 0,    tabs: 3, tabsClass: 'grid-cols-3', best: 4, bestClass: 'grid-cols-4' },
  { min: 1280, tabs: 4, tabsClass: 'grid-cols-4', best: 5, bestClass: 'grid-cols-5' },
  { min: 1536, tabs: 5, tabsClass: 'grid-cols-5', best: 6, bestClass: 'grid-cols-6' },
];
