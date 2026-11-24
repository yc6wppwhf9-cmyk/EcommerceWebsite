import { next } from '@vercel/functions';

// Link previews for product pages. WhatsApp, Facebook, LinkedIn and other
// preview bots don't run JavaScript, so they only ever saw the homepage's
// title and image in index.html. For those bots this fills in the product's
// own title, description and image. Everyone else gets the normal page.

export const config = {
  matcher: '/product/:path*',
};

const SITE = 'https://www.prioritybags.in';
const API = 'https://ecommercewebsite-5z8k.onrender.com';
const API_TIMEOUT_MS = 6000;

const PREVIEW_BOTS =
  /facebookexternalhit|facebot|meta-externalagent|whatsapp|linkedinbot|twitterbot|slackbot|telegrambot|discordbot|pinterest|skypeuripreview|redditbot|embedly|vkshare|snapchat|bitlybot/i;

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const plain = (s: string) => s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const clip = (s: string, max: number) => (s.length <= max ? s : `${s.slice(0, max - 1).replace(/\s+\S*$/, '')}…`);

const absolute = (src: string) => {
  try {
    return new URL(src, SITE).href;
  } catch {
    return `${SITE}/Creatives/hero-main.jpg`;
  }
};

async function loadProduct(slug: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  try {
    const res = await fetch(`${API}/api/products/${encodeURIComponent(slug)}`, { signal: controller.signal });
    return res.ok ? await res.json() : null;
  } catch {
    return null; // API asleep or slow: fall back to the normal page
  } finally {
    clearTimeout(timer);
  }
}

/** Swap the content of one of index.html's default tags (marked data-default-seo). */
function setTag(html: string, attr: 'name' | 'property', key: string, value: string) {
  const re = new RegExp(`(<meta data-default-seo ${attr}="${key}" content=")[^"]*(")`);
  return html.replace(re, `$1${escape(value)}$2`);
}

export default async function middleware(request: Request) {
  if (!PREVIEW_BOTS.test(request.headers.get('user-agent') || '')) return next();

  const url = new URL(request.url);
  const slug = decodeURIComponent(url.pathname.replace(/^\/product\//, '').replace(/\/+$/, ''));
  if (!slug) return next();

  const [product, page] = await Promise.all([
    loadProduct(slug),
    fetch(new URL('/', url.origin)).then((r) => (r.ok ? r.text() : null)).catch(() => null),
  ]);
  if (!product?.name || !page) return next();

  const pageUrl = `${SITE}/product/${product.slug || slug}`;
  const title = `${product.name} | Priority Bags`;
  const description = clip(
    plain(product.description || '') ||
      `${product.name} from Priority Bags. See colours and details, and buy on Amazon, Myntra or Ajio with delivery across India.`,
    200,
  );
  const image = absolute(product.image || (Array.isArray(product.images) && product.images[0]) || '/Creatives/hero-main.jpg');

  let html = page.replace(/<title>[^<]*<\/title>/, `<title>${escape(title)}</title>`);
  html = setTag(html, 'name', 'description', description);
  html = setTag(html, 'property', 'og:type', 'product');
  html = setTag(html, 'property', 'og:title', title);
  html = setTag(html, 'property', 'og:description', description);
  html = setTag(html, 'property', 'og:url', pageUrl);
  html = setTag(html, 'property', 'og:image', image);
  html = setTag(html, 'name', 'twitter:title', title);
  html = setTag(html, 'name', 'twitter:description', description);
  html = setTag(html, 'name', 'twitter:image', image);
  html = html.replace(/(<link data-default-seo rel="canonical" href=")[^"]*(")/, `$1${pageUrl}$2`);

  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=300',
      vary: 'User-Agent',
    },
  });
}
