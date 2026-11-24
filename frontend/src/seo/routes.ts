// Page titles and descriptions shared by the app (RouteSEO) and the Vercel
// middleware that serves crawlers, so both always describe a page the same way.

export const SITE = 'https://www.prioritybags.in';

export const HOME = {
  title: 'Priority Bags – School Bags, Backpacks & Luggage Online',
  description:
    'Official Priority Bags store: school bags, college and laptop backpacks, trolley luggage and TRAWORLD travel gear. Buy on Amazon, Myntra and Ajio.',
  h1: 'Priority Bags – School Bags, Backpacks, Luggage & Travel Bags',
};

export const PAGES: Record<string, { title: string; description: string }> = {
  '/junior': {
    title: 'Junior School Bags for Kids — Priority Junior',
    description: 'School bags, trolley backpacks and combo sets for kids from Priority Junior. Shop by age and character, with delivery across India.',
  },
  '/premium': {
    title: 'TRAWORLD Premium Luggage, Backpacks & Duffles',
    description: 'TRAWORLD premium travel collection by Priority Bags: hard-shell luggage, travel backpacks and duffles built for frequent travellers.',
  },
  '/corporate-gifting': {
    title: 'Corporate Gifting & Bulk Orders — Priority Bags',
    description: 'Premium corporate gifting, custom branded backpacks, luggage, and executive duffles for organizations. Direct factory pricing, custom logo branding & pan-India delivery.',
  },
  '/about': {
    title: 'About Us — High Spirit Commercial Ventures (HSCVPL) & Priority Bags',
    description: "Learn about HSCVPL, one of India's largest backpack manufacturers with 25+ years of excellence, powering Priority and Traworld brands.",
  },
  '/contact': {
    title: 'Contact Priority Bags',
    description: 'Talk to the Priority Bags concierge team. Send us a message about orders, products, warranty, and bulk enquiries.',
  },
  '/careers': {
    title: 'Careers & Opportunities',
    description: 'Join the Priority Bags and TRAWORLD team. Explore open roles and build the future of travel and everyday gear.',
  },
  '/shipping': {
    title: 'Shipping Policy',
    description: 'How Priority Bags orders are shipped and delivered across India, including marketplace orders on Amazon, Myntra and Ajio.',
  },
  '/returns': {
    title: 'Returns & Refunds',
    description: 'Returns, replacements and refunds for Priority Bags and TRAWORLD products bought online.',
  },
  '/privacy': {
    title: 'Privacy Policy',
    description: 'How Priority Bags (High Spirit Commercial Ventures Pvt. Ltd.) collects, uses and protects your information.',
  },
  '/terms': {
    title: 'Terms of Service',
    description: 'Terms of use for the Priority Bags website, operated by High Spirit Commercial Ventures Pvt. Ltd.',
  },
  '/warranty': {
    title: 'Claim Warranty',
    description: 'Register a warranty claim for a Priority Bags or TRAWORLD product. Our support team will get back to you.',
  },
  '/support-status': {
    title: 'Check Support Request Status',
    description: 'Check the status of your Priority Bags support or warranty request with your ticket number.',
  },
};

export const PRIVATE = ['/login', '/forgot-password', '/reset-password', '/verify-email', '/account', '/admin', '/checkout', '/wishlist'];

export const isPrivate = (path: string) => PRIVATE.some((p) => path === p || path.startsWith(`${p}/`));

// Category pages: slug -> name, as the category page headings show them.
export const CATEGORY_NAMES: Record<string, string> = {
  backpacks: 'Backpacks',
  'school-backpacks': 'School Backpacks',
  'college-backpacks': 'College Backpacks',
  'laptop-backpacks': 'Laptop Backpacks',
  'trekking-backpacks': 'Trekking Backpacks',
  travel: 'Travel',
  luggage: 'All Luggage',
  duffle: 'Duffle',
  accessories: 'Accessories',
  pouch: 'Pouch',
  'lunch-bag': 'Lunch Bag',
  daypack: 'Daypack',
  'tote-bag': 'Tote Bag',
  'kids-trolley': 'Kids Trolley',
  'trolley-backpacks': 'Trolley Backpacks',
  'combo-set': 'Combo Set',
};

export const NAV_LINKS: [string, string][] = [
  ['/school-backpacks', 'School Backpacks'],
  ['/college-backpacks', 'College Backpacks'],
  ['/laptop-backpacks', 'Laptop Backpacks'],
  ['/trekking-backpacks', 'Trekking Backpacks'],
  ['/luggage', 'Luggage'],
  ['/duffle', 'Duffle Bags'],
  ['/accessories', 'Accessories'],
  ['/junior', 'Priority Junior – Kids School Bags'],
  ['/premium', 'TRAWORLD Premium Travel Collection'],
  ['/corporate-gifting', 'Bulk & Corporate Orders'],
  ['/about', 'About Us'],
  ['/contact', 'Contact Us'],
  ['/warranty', 'Claim Warranty'],
];

export const categoryTitle = (name: string) => `${name} — Shop Online | Priority Bags`;
export const categoryDescription = (name: string) =>
  `Shop ${name.toLowerCase()} from Priority Bags. See prices and colours, and buy on Amazon, Myntra and more with delivery across India.`;
export const withBrand = (title: string) => (title.includes('Priority Bags') ? title : `${title} | Priority Bags`);

export const absoluteUrl = (src: string) => {
  try {
    return new URL(src, SITE).href;
  } catch {
    return `${SITE}/Creatives/hero-main.jpg`;
  }
};

/** Description and image used for a product page, in the app and for crawlers. */
export const productMeta = (p: { name: string; description?: string | null; image?: string | null; images?: string[] | null }) => {
  const raw = (p.description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    || `Buy ${p.name} from Priority Bags on Amazon, Myntra or Ajio, with delivery across India.`;
  return {
    description: raw.length > 155 ? `${raw.slice(0, 152)}…` : raw,
    image: absoluteUrl(p.images?.[0] || p.image || '/Creatives/hero-main.jpg'),
  };
};
