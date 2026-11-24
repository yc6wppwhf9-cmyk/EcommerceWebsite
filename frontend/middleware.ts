import { next } from '@vercel/functions';
import {
  CATEGORY_NAMES, HOME, NAV_LINKS, PAGES, SITE, categoryDescription, categoryTitle, isPrivate, productMeta, withBrand,
} from './src/seo/routes';

// Crawlers and link-preview bots (Google, Bing, Seobility, WhatsApp, Facebook,
// LinkedIn...) either don't run JavaScript or judge the raw HTML first. For them
// this serves index.html with the page's own title, description, canonical and
// robots tags, plus a heading, text and links for that page. The React app still
// loads and replaces it. Everyone else gets the normal page untouched.

export const config = {
  // Page URLs only: skip the API and any path with a file extension.
  matcher: ['/((?!api/|assets/)[^.]*)'],
};

const API = 'https://ecommercewebsite-5z8k.onrender.com';
const API_TIMEOUT_MS = 5000;

const CRAWLERS =
  /googlebot|google-inspectiontool|googleother|bingbot|bingpreview|yandex|duckduckbot|baiduspider|applebot|seobility|ahrefsbot|semrushbot|mj12bot|dotbot|petalbot|rogerbot|screaming frog|sitebulb|facebookexternalhit|facebot|meta-externalagent|whatsapp|linkedinbot|twitterbot|slackbot|telegrambot|discordbot|pinterest|skypeuripreview|redditbot|embedly|vkshare|snapchat|bitlybot|[a-z]bot\b|crawler|spider/i;

type Product = {
  name: string; slug: string; description?: string | null; image?: string | null; images?: string[] | null;
  sub_category?: string | null; features?: string[] | null;
  amazon_url?: string | null; myntra_url?: string | null; ajio_url?: string | null; flipkart_url?: string | null;
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const titleCase = (s: string) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

async function api<T>(path: string): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  try {
    const res = await fetch(`${API}${path}`, { signal: controller.signal });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null; // API asleep or slow: serve the page without the product list
  } finally {
    clearTimeout(timer);
  }
}

const list = (items: [string, string][]) =>
  `<ul>${items.map(([href, text]) => `<li><a href="${esc(href)}">${esc(text)}</a></li>`).join('')}</ul>`;

const productLinks = (products: Product[]) => list(products.map((p) => [`/product/${p.slug}`, p.name]));

const sellsOn = (p: Product) =>
  ([['amazon_url', 'Amazon'], ['myntra_url', 'Myntra'], ['ajio_url', 'Ajio'], ['flipkart_url', 'Flipkart']] as const)
    .filter(([k]) => p[k]).map(([, label]) => label);

interface Page {
  title: string;
  description: string;
  canonical: string;
  noindex?: boolean;
  image?: string;
  type?: 'website' | 'product';
  body: string;
}

async function describe(path: string): Promise<Page | null> {
  const canonical = `${SITE}${path === '/' ? '/' : path}`;
  const nav = `<nav aria-label="Shop by category">${list(NAV_LINKS)}</nav>`;

  if (path === '/') {
    const data = await api<{ products: Product[] }>('/api/products?limit=60');
    return {
      title: HOME.title,
      description: HOME.description,
      canonical,
      body: `<h1>${esc(HOME.h1)}</h1>
<p>Priority Bags is the bag brand of High Spirit Commercial Ventures Pvt. Ltd., a manufacturer with over 25 years of experience. We make school bags and kids' backpacks, college backpacks, laptop backpacks, trekking bags, trolley luggage, duffle bags and accessories, along with the TRAWORLD premium travel collection and Priority Junior bags for children.</p>
<p>Browse school bags by age and character, compare college and laptop backpacks, and choose luggage in cabin and check-in sizes. Every product page links to Amazon, Myntra and Ajio, where you can buy with delivery across India. Schools, companies and institutions can contact us for bulk and corporate orders with logo customisation.</p>
${nav}
${data?.products?.length ? `<h2>New and popular bags</h2>${productLinks(data.products)}` : ''}`,
    };
  }

  if (isPrivate(path)) {
    return { title: 'Priority Bags', description: HOME.description, canonical, noindex: true, body: `<h1>Priority Bags</h1>${nav}` };
  }

  const productSlug = path.match(/^\/product\/([^/]+)$/)?.[1];
  if (productSlug) {
    const p = await api<Product>(`/api/products/${encodeURIComponent(decodeURIComponent(productSlug))}`);
    if (!p?.name) return null; // unknown, hidden or API asleep: serve the normal page
    const meta = productMeta(p);
    const where = sellsOn(p);
    const category = p.sub_category ? CATEGORY_NAMES[p.sub_category] || titleCase(p.sub_category) : '';
    const features = (p.features || []).filter(Boolean).slice(0, 8);
    return {
      title: withBrand(p.name),
      description: meta.description,
      canonical: `${SITE}/product/${p.slug || productSlug}`,
      image: meta.image,
      type: 'product',
      body: `<h1>${esc(p.name)}</h1>
<p>${esc((p.description || meta.description).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim())}</p>
${features.length ? `<h2>Features</h2><ul>${features.map((f) => `<li>${esc(String(f))}</li>`).join('')}</ul>` : ''}
${where.length ? `<p>Buy the ${esc(p.name)} on ${where.join(', ')}.</p>` : ''}
${category && p.sub_category ? `<p>More in <a href="/${esc(p.sub_category)}">${esc(category)}</a>.</p>` : ''}
${nav}`,
    };
  }

  const style = path.match(/^\/junior\/([^/]+)$/)?.[1];
  if (style) {
    const name = titleCase(decodeURIComponent(style));
    return {
      title: withBrand(`${name} School Bags for Kids — Priority Junior`),
      description: `${name} school bags and backpacks for kids from Priority Junior, with delivery across India.`,
      canonical,
      body: `<h1>${esc(name)} School Bags for Kids</h1><p>${esc(name)} school bags and backpacks from Priority Junior.</p>${nav}`,
    };
  }

  const page = PAGES[path];
  if (page) {
    return {
      title: withBrand(page.title),
      description: page.description,
      canonical,
      body: `<h1>${esc(page.title.replace(/ — Priority Bags$/, ''))}</h1><p>${esc(page.description)}</p>${nav}`,
    };
  }

  const slug = path.match(/^\/([^/]+)$/)?.[1];
  if (slug) {
    const data = await api<{ products: Product[] }>(`/api/products?category=${encodeURIComponent(slug)}&limit=100`);
    const name = CATEGORY_NAMES[slug] || titleCase(slug);
    const products = data?.products || [];
    // Unknown slugs and empty categories stay out of search results.
    const empty = data !== null && products.length === 0;
    return {
      title: categoryTitle(name, slug),
      description: categoryDescription(name, slug),
      canonical,
      noindex: empty || (!CATEGORY_NAMES[slug] && data === null),
      body: `<h1>${esc(name)}</h1>
<p>${esc(categoryDescription(name, slug))}</p>
${products.length ? `<h2>${esc(name)} (${products.length})</h2>${productLinks(products)}` : ''}
${nav}`,
    };
  }

  return { title: HOME.title, description: HOME.description, canonical, noindex: true, body: `<h1>Priority Bags</h1>${nav}` };
}

function setMeta(html: string, attr: 'name' | 'property', key: string, value: string) {
  const re = new RegExp(`(<meta data-default-seo ${attr}="${key}" content=")[^"]*(")`);
  return html.replace(re, `$1${esc(value)}$2`);
}

export default async function middleware(request: Request) {
  if (request.method !== 'GET' || !CRAWLERS.test(request.headers.get('user-agent') || '')) return next();

  const url = new URL(request.url);
  const path = decodeURIComponent(url.pathname).replace(/\/+$/, '') || '/';

  const [page, shell] = await Promise.all([
    describe(path),
    fetch(new URL('/', url.origin), { headers: { 'user-agent': 'prioritybags-prerender' } })
      .then((r) => (r.ok ? r.text() : null)).catch(() => null),
  ]);
  if (!page || !shell) return next();

  const image = page.image || `${SITE}/Creatives/hero-main.jpg`;
  let html = shell.replace(/<title>[^<]*<\/title>/, `<title>${esc(page.title)}</title>`);
  html = setMeta(html, 'name', 'description', page.description);
  html = setMeta(html, 'name', 'robots', page.noindex ? 'noindex, follow' : 'index, follow');
  html = setMeta(html, 'property', 'og:type', page.type || 'website');
  html = setMeta(html, 'property', 'og:title', page.title);
  html = setMeta(html, 'property', 'og:description', page.description);
  html = setMeta(html, 'property', 'og:url', page.canonical);
  html = setMeta(html, 'property', 'og:image', image);
  html = setMeta(html, 'name', 'twitter:title', page.title);
  html = setMeta(html, 'name', 'twitter:description', page.description);
  html = setMeta(html, 'name', 'twitter:image', image);
  if (!page.noindex) {
    html = html.replace('</head>', `  <link data-default-seo rel="canonical" href="${esc(page.canonical)}" />\n  </head>`);
  }
  html = html.replace(
    /(<div id="seo-fallback"[^>]*>)[\s\S]*?(<\/div>\s*<\/div>)/,
    (_m, open, close) => `${open}\n${page.body}\n      ${close}`,
  );

  return new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=300', vary: 'User-Agent' },
  });
}
