// Builds the admin "Product Click Report" workbook: every marketplace click as
// its own row, plus summary, clicks-vs-orders and product performance sheets.
// Orders come from marketplace order exports the admin attaches (Myntra,
// Amazon, Ajio); matching a click to an order is indicative, not exact.

export type Marketplace = 'amazon' | 'flipkart' | 'myntra' | 'ajio';

export interface ClickRow {
  id: number;
  product_id: string | null;
  marketplace: Marketplace;
  source: string;
  created_at: string;
  page_path: string | null;
  campaign: string | null;
  device_type: string | null;
  session_id: string | null;
}

export interface ProductRow {
  id: string; name: string; slug: string; sku: string | null; image: string | null;
  is_active: boolean; sub_category: string | null;
  amazon_url: string | null; flipkart_url: string | null; myntra_url: string | null; ajio_url: string | null;
}

export interface OrderRow {
  marketplace: Marketplace;
  orderId: string;
  date: Date | null;
  status: string;
  units: number;
  productId: string | null;
  rawProduct: string;
}

export interface OrderFileResult {
  fileName: string;
  marketplace: Marketplace;
  orders: OrderRow[];
  matched: number;
  columns: Record<string, string>;
}

export const MARKETPLACE_LABEL: Record<Marketplace, string> = {
  amazon: 'Amazon', flipkart: 'Flipkart', myntra: 'Myntra', ajio: 'Ajio',
};
const MARKETS = Object.keys(MARKETPLACE_LABEL) as Marketplace[];
const SITE = 'https://www.prioritybags.in';
const DAY = 86_400_000;
const ATTRIBUTION_DAYS = 7;

// ── IST formatting ─────────────────────────────────────────────────────────
const istParts = (d: Date) => {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
    }).formatToParts(d).map((x) => [x.type, x.value]),
  );
  return p as Record<string, string>;
};
export const istDate = (d: Date) => { const p = istParts(d); return `${p.day}-${p.month}-${p.year}`; };
export const istTime = (d: Date) => { const p = istParts(d); return `${p.hour}:${p.minute}:${p.second}`; };
export const istStamp = (d: Date) => `${istDate(d)} ${istTime(d)} IST`;
const istDayKey = (d: Date) => { const p = istParts(d); return `${p.year}-${p.month}-${p.day}`; };
const istMonthKey = (d: Date) => istDayKey(d).slice(0, 7);
const dayLabel = (key: string) => key.split('-').reverse().join('-');
const monthLabel = (key: string) => {
  const [y, m] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 15)).toLocaleString('en-IN', { month: 'short', year: 'numeric', timeZone: 'UTC' });
};
const titleCase = (s: string) => s.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// ── Marketplace product ids from the product's links ──────────────────────
const ID_PATTERNS: Record<Marketplace, RegExp> = {
  amazon: /\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i,
  myntra: /myntra\.com\/(?:.*\/)?(\d{5,})/i,
  ajio: /\/p\/([0-9A-Za-z_]+)/i,
  flipkart: /[?&]pid=([A-Z0-9]+)/i,
};
export const marketplaceId = (p: ProductRow | undefined, m: Marketplace) => {
  const url = p?.[`${m}_url` as const] || '';
  return url.match(ID_PATTERNS[m])?.[1] || '';
};

// ── Reading order exports ─────────────────────────────────────────────────
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = []; let cell = ''; let quoted = false;
  const delimiter = (text.split('\n')[0].match(/\t/g)?.length || 0) > (text.split('\n')[0].match(/,/g)?.length || 0) ? '\t' : ',';
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === delimiter) { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((x) => x.trim()));
}

function parseDate(v: unknown): Date | null {
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v;
  if (typeof v === 'number' && v > 20000 && v < 80000) return new Date(Math.round((v - 25569) * DAY - 5.5 * 3600_000));
  const s = String(v ?? '').trim();
  if (!s) return null;
  // Day-first (Indian) dates: 03-10-2026, 03/10/2026 14:22[:11]
  const m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})(?:[ T,]+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?)?/i);
  if (m) {
    let [, d, mo, y, h = '0', mi = '0', se = '0', ap] = m;
    let hour = Number(h);
    if (ap) hour = (hour % 12) + (/pm/i.test(ap) ? 12 : 0);
    const year = y.length === 2 ? 2000 + Number(y) : Number(y);
    const iso = `${year}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}T${String(hour).padStart(2, '0')}:${mi}:${se.padStart(2, '0')}+05:30`;
    const dt = new Date(iso);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }
  // ISO without zone is IST local time in these exports
  const isoLocal = s.match(/^\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2})?)?$/);
  const dt = new Date(isoLocal ? `${s.replace(' ', 'T')}${s.length === 10 ? 'T00:00:00' : ''}+05:30` : s);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

const COLUMN_RULES: { key: string; patterns: RegExp[] }[] = [
  { key: 'orderId', patterns: [/^amazon-?order-?id$/, /order.?release.?id/, /^order.?id$/, /order.?line.?id/, /cust(omer)?.?order.?(no|number|id)/, /order.?(no|number)/, /order.?id/] },
  { key: 'date', patterns: [/^purchase-?date$/, /created.?on/, /order.?date/, /order.?created/, /created.?(at|date)/, /^date$/, /date/] },
  { key: 'status', patterns: [/order.?status/, /item.?status/, /^status$/, /status/] },
  { key: 'units', patterns: [/^quantity$/, /^qty$/, /quantity.?purchased/, /quantity/, /qty/, /units/] },
  { key: 'productId', patterns: [/^asin$/, /style.?id/, /item.?code/, /product.?code/, /article.?(no|number|code)/, /^fsn$/, /product.?id/] },
  { key: 'sku', patterns: [/seller.?sku/, /^sku$/, /sku.?code/, /sku/] },
];

function detectColumns(headers: string[]) {
  const norm = headers.map((h) => String(h || '').trim().toLowerCase());
  const found: Record<string, number> = {};
  for (const rule of COLUMN_RULES) {
    for (const re of rule.patterns) {
      const i = norm.findIndex((h, idx) => re.test(h) && !Object.values(found).includes(idx));
      if (i >= 0) { found[rule.key] = i; break; }
    }
  }
  return found;
}

function guessMarketplace(fileName: string, headers: string[]): Marketplace {
  const h = headers.join(' ').toLowerCase();
  const f = fileName.toLowerCase();
  if (/asin|amazon-order-id/.test(h) || f.includes('amazon')) return 'amazon';
  if (/style.?id|order.?release/.test(h) || f.includes('myntra')) return 'myntra';
  if (/cust.?order|item.?code/.test(h) || f.includes('ajio')) return 'ajio';
  if (/fsn/.test(h) || f.includes('flipkart')) return 'flipkart';
  return 'myntra';
}

export async function readOrderFile(file: File, products: ProductRow[], forced?: Marketplace): Promise<OrderFileResult> {
  let rows: unknown[][];
  if (/\.(xlsx|xlsm)$/i.test(file.name)) {
    const { readSheet } = await import('read-excel-file/browser');
    rows = (await readSheet(file)) as unknown[][];
  } else {
    rows = parseCsv(await file.text());
  }
  // Header is the first row that names an order id column (some exports have a title row first).
  let headerIndex = rows.findIndex((r) => detectColumns(r.map(String)).orderId !== undefined);
  if (headerIndex < 0) headerIndex = 0;
  const headers = (rows[headerIndex] || []).map((h) => String(h ?? ''));
  const cols = detectColumns(headers);
  if (cols.orderId === undefined || (cols.productId === undefined && cols.sku === undefined)) {
    throw new Error(
      `${file.name}: could not find the order ID and product (style ID / ASIN / item code / SKU) columns. Columns found: ${headers.filter(Boolean).slice(0, 15).join(', ')}`,
    );
  }
  const marketplace = forced || guessMarketplace(file.name, headers);

  const byMarketId = new Map<string, string>();
  const bySku = new Map<string, string>();
  for (const p of products) {
    const id = marketplaceId(p, marketplace);
    if (id) byMarketId.set(id.toLowerCase(), p.id);
    if (p.sku) bySku.set(p.sku.toLowerCase(), p.id);
  }
  const findProduct = (pid: string, sku: string) => {
    const a = pid.toLowerCase(); const b = sku.toLowerCase();
    if (a && byMarketId.has(a)) return byMarketId.get(a)!;
    if (b && bySku.has(b)) return bySku.get(b)!;
    if (a.length >= 8) {
      for (const [id, productId] of byMarketId) if (id.startsWith(a) || a.startsWith(id)) return productId;
    }
    if (b) for (const [s, productId] of bySku) if (b.includes(s)) return productId;
    return null;
  };

  const cell = (r: unknown[], key: string) => (cols[key] === undefined ? '' : r[cols[key]]);
  const orders: OrderRow[] = rows.slice(headerIndex + 1)
    .filter((r) => String(cell(r, 'orderId') ?? '').trim())
    .map((r) => {
      const pid = String(cell(r, 'productId') ?? '').trim();
      const sku = String(cell(r, 'sku') ?? '').trim();
      const units = Number(String(cell(r, 'units') ?? '').replace(/[^\d.]/g, ''));
      return {
        marketplace,
        orderId: String(cell(r, 'orderId')).trim(),
        date: parseDate(cell(r, 'date')),
        status: String(cell(r, 'status') ?? '').trim(),
        units: Number.isFinite(units) && units > 0 ? units : 1,
        productId: findProduct(pid, sku),
        rawProduct: pid || sku,
      };
    });
  return {
    fileName: file.name,
    marketplace,
    orders,
    matched: orders.filter((o) => o.productId).length,
    columns: Object.fromEntries(Object.entries(cols).map(([k, i]) => [k, headers[i]])),
  };
}

// ── Click ↔ order attribution (indicative) ────────────────────────────────
// Each order is credited to the latest unmatched click on the same product and
// marketplace in the 7 days before it. Date-only orders count as end of day.
function attribute(clicks: ClickRow[], orders: OrderRow[]) {
  const byKey = new Map<string, ClickRow[]>();
  for (const c of clicks) {
    if (!c.product_id) continue;
    const k = `${c.product_id}|${c.marketplace}`;
    if (!byKey.has(k)) byKey.set(k, []);
    byKey.get(k)!.push(c);
  }
  for (const list of byKey.values()) list.sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
  const used = new Set<number>();
  const clickOrder = new Map<number, OrderRow>();
  const sorted = orders.filter((o) => o.productId && o.date).sort((a, b) => a.date!.getTime() - b.date!.getTime());
  for (const o of sorted) {
    const list = byKey.get(`${o.productId}|${o.marketplace}`);
    if (!list) continue;
    const t = o.date!.getTime();
    const end = istTime(o.date!) === '00:00:00' ? t + DAY - 1 : t;
    for (let i = list.length - 1; i >= 0; i--) {
      const ct = Date.parse(list[i].created_at);
      if (ct > end || used.has(list[i].id)) continue;
      if (ct < end - ATTRIBUTION_DAYS * DAY) break;
      used.add(list[i].id);
      clickOrder.set(list[i].id, o);
      break;
    }
  }
  return clickOrder;
}

// ── Thumbnails for the product sheets ──────────────────────────────────────
async function thumbnail(src: string | null): Promise<Blob | null> {
  if (!src) return null;
  try {
    const url = new URL(src, location.origin).href;
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return null;
    const bmp = await createImageBitmap(await res.blob());
    const size = 56;
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    const scale = Math.min(size / bmp.width, size / bmp.height);
    ctx.drawImage(bmp, (size - bmp.width * scale) / 2, (size - bmp.height * scale) / 2, bmp.width * scale, bmp.height * scale);
    return await new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.8));
  } catch {
    return null;
  }
}

async function thumbnails(products: ProductRow[], onProgress?: (msg: string) => void) {
  const out = new Map<string, Blob>();
  let done = 0;
  const queue = [...products];
  const worker = async () => {
    while (queue.length) {
      const p = queue.shift()!;
      const blob = await thumbnail(p.image);
      if (blob) out.set(p.id, blob);
      done++;
      if (done % 10 === 0) onProgress?.(`Adding product images… ${done}/${products.length}`);
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
  return out;
}

// ── Workbook ───────────────────────────────────────────────────────────────
type Cell = { value?: string | number | null; fontWeight?: 'bold'; type?: any; format?: string; height?: number; wrap?: boolean; backgroundColor?: string; color?: string; columnSpan?: number } | null;
const H = (value: string): Cell => ({ value, fontWeight: 'bold', backgroundColor: '#F1F5F9' });
const T = (value: string, size?: number): Cell => ({ value, fontWeight: 'bold', ...(size ? { columnSpan: size } : {}) });
const S = (value: string | null | undefined): Cell => ({ value: value ?? '', type: String });
const N = (value: number): Cell => ({ value, type: Number });
const P = (value: number | null): Cell => (value === null ? S('—') : { value, type: Number, format: '0.0%' });
const BLANK: Cell[] = [];

export interface ReportInput {
  clicks: ClickRow[];
  products: ProductRow[];
  orderFiles: OrderFileResult[];
  rangeLabel: string;
  onProgress?: (msg: string) => void;
}

export async function downloadClickReport({ clicks, products, orderFiles, rangeLabel, onProgress }: ReportInput) {
  const now = Date.now();
  const byId = new Map(products.map((p) => [p.id, p]));
  const orders = orderFiles.flatMap((f) => f.orders);
  const haveOrders = orders.length > 0;
  const clickOrder = attribute(clicks, orders);
  const productName = (id: string | null) => (id && byId.get(id)?.name) || 'Deleted product';
  const productUrl = (id: string | null) => (id && byId.get(id) ? `${SITE}/product/${byId.get(id)!.slug}` : '');
  const sourceLabel = (c: ClickRow) =>
    [c.source === 'chatbot' ? 'Chatbot' : c.page_path || 'Website', c.campaign && c.campaign !== 'direct' ? c.campaign : c.campaign === 'direct' ? 'Direct visit' : '']
      .filter(Boolean).join(' · ');

  // Per-product aggregates
  type Agg = { id: string; clicks: number; byMarket: Record<Marketplace, number>; last7: number; prev7: number; last30: number; prev30: number; matched: number; orders: number; units: number; statuses: Map<string, number> };
  const agg = new Map<string, Agg>();
  const get = (id: string) => {
    if (!agg.has(id)) agg.set(id, { id, clicks: 0, byMarket: { amazon: 0, flipkart: 0, myntra: 0, ajio: 0 }, last7: 0, prev7: 0, last30: 0, prev30: 0, matched: 0, orders: 0, units: 0, statuses: new Map() });
    return agg.get(id)!;
  };
  for (const c of clicks) {
    if (!c.product_id) continue;
    const a = get(c.product_id);
    const age = now - Date.parse(c.created_at);
    a.clicks++; a.byMarket[c.marketplace]++;
    if (age <= 7 * DAY) a.last7++; else if (age <= 14 * DAY) a.prev7++;
    if (age <= 30 * DAY) a.last30++; else if (age <= 60 * DAY) a.prev30++;
    if (clickOrder.has(c.id)) a.matched++;
  }
  for (const o of orders) {
    if (!o.productId) continue;
    const a = get(o.productId);
    a.orders++; a.units += o.units;
    const st = o.status || 'Unknown';
    a.statuses.set(st, (a.statuses.get(st) || 0) + 1);
  }
  const aggs = [...agg.values()];
  const clicked = aggs.filter((a) => a.clicks > 0).sort((a, b) => b.clicks - a.clicks);

  // ── Sheet 1: Click Summary
  const s1: Cell[][] = [];
  s1.push([T('Priority Bags – Marketplace Product Click Report', 3)]);
  s1.push([S(`Period: ${rangeLabel} · Generated ${istStamp(new Date())}`)]);
  s1.push(BLANK);
  const uniqueSessions = new Set(clicks.map((c) => c.session_id).filter(Boolean)).size;
  const kv: [string, string | number][] = [
    ['Total marketplace outbound clicks', clicks.length],
    ['Unique products clicked', clicked.length],
    ['Unique visitor sessions (where recorded)', uniqueSessions || '—'],
    ['Clicks from the chatbot', clicks.filter((c) => c.source === 'chatbot').length],
    ['First click in period', clicks.length ? istStamp(new Date(Math.min(...clicks.map((c) => Date.parse(c.created_at))))) : '—'],
    ['Last click in period', clicks.length ? istStamp(new Date(Math.max(...clicks.map((c) => Date.parse(c.created_at))))) : '—'],
  ];
  if (haveOrders) {
    kv.push(['Orders in attached order files', orders.length]);
    kv.push(['Orders matched to a website product', orders.filter((o) => o.productId).length]);
    kv.push([`Orders credited to a website click (within ${ATTRIBUTION_DAYS} days, indicative)`, clickOrder.size]);
  }
  for (const [k, v] of kv) s1.push([S(k), typeof v === 'number' ? N(v) : S(v)]);

  s1.push(BLANK, [T('Most-clicked products (top 20)', 3)], [H('Product'), H('Clicks'), H('Category')]);
  clicked.slice(0, 20).forEach((a, i) => s1.push([S(`${i + 1}. ${productName(a.id)}`), N(a.clicks), S(titleCase(byId.get(a.id)?.sub_category || ''))]));

  const tally = (keyOf: (c: ClickRow) => string) => {
    const m = new Map<string, number>();
    for (const c of clicks) { const k = keyOf(c); m.set(k, (m.get(k) || 0) + 1); }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };
  const pct = (n: number) => (clicks.length ? n / clicks.length : 0);
  const block = (title: string, label: string, rows: [string, number][]) => {
    s1.push(BLANK, [T(title, 3)], [H(label), H('Clicks'), H('Share')]);
    for (const [k, n] of rows) s1.push([S(k), N(n), P(pct(n))]);
  };
  block('Clicks by product category', 'Category', tally((c) => titleCase(byId.get(c.product_id || '')?.sub_category || 'Unknown')));
  block('Clicks by marketplace', 'Marketplace', tally((c) => MARKETPLACE_LABEL[c.marketplace] || c.marketplace));
  block('Clicks by device (where recorded)', 'Device', tally((c) => (c.device_type ? titleCase(c.device_type) : 'Not recorded')));
  block('Clicks by source / campaign', 'Source', tally((c) => (c.source === 'chatbot' ? 'Chatbot' : c.campaign ? (c.campaign === 'direct' ? 'Direct visit' : c.campaign) : 'Website (campaign not recorded)')));

  const months = new Map<string, number>();
  const days = new Map<string, number>();
  for (const c of clicks) {
    const d = new Date(c.created_at);
    months.set(istMonthKey(d), (months.get(istMonthKey(d)) || 0) + 1);
    days.set(istDayKey(d), (days.get(istDayKey(d)) || 0) + 1);
  }
  s1.push(BLANK, [T('Monthly click trend', 3)], [H('Month'), H('Clicks'), H('Change vs previous month')]);
  const monthKeys = [...months.keys()].sort();
  monthKeys.forEach((k, i) => {
    const prev = i ? months.get(monthKeys[i - 1])! : null;
    s1.push([S(monthLabel(k)), N(months.get(k)!), P(prev ? (months.get(k)! - prev) / prev : null)]);
  });
  s1.push(BLANK, [T('Daily click trend', 2)], [H('Date (IST)'), H('Clicks')]);
  if (clicks.length) {
    const times = clicks.map((c) => Date.parse(c.created_at));
    const last = istDayKey(new Date(Math.max(...times)));
    // IST has no daylight saving, so stepping 24 hours visits each calendar day once.
    for (let t = Math.min(...times); ; t += DAY) {
      const k = istDayKey(new Date(t));
      s1.push([S(dayLabel(k)), N(days.get(k) || 0)]);
      if (k >= last) break;
    }
  }

  // ── Sheet 2: Detailed Click Log (one row per click)
  const logHeader = [
    'Click Event ID', 'Click Date (IST)', 'Click Time (IST)', 'Full Click Timestamp (IST)', 'Product Name', 'Product Image URL',
    'Product SKU', 'Marketplace Product ID (Myntra Style ID / ASIN / Ajio code)', 'Product Category', 'Marketplace',
    'Product Page URL', 'Marketplace Listing URL', 'Source Page / Campaign', 'Device Type', 'Session ID', 'Click Count',
    'Matched Sales Order ID (indicative)', 'Order Date (IST)', 'Order Status',
  ];
  const s2: Cell[][] = [logHeader.map(H)];
  const sortedClicks = [...clicks].sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
  for (const c of sortedClicks) {
    const d = new Date(c.created_at);
    const p = byId.get(c.product_id || '');
    const o = clickOrder.get(c.id);
    s2.push([
      S(`CLK-${String(c.id).padStart(6, '0')}`), S(istDate(d)), S(istTime(d)), S(istStamp(d)),
      S(productName(c.product_id)), S(p?.image ? new URL(p.image, SITE).href : ''),
      S(p?.sku), S(marketplaceId(p, c.marketplace)), S(titleCase(p?.sub_category || '')),
      S(MARKETPLACE_LABEL[c.marketplace] || c.marketplace), S(productUrl(c.product_id)), S(p?.[`${c.marketplace}_url` as const] || ''),
      S(sourceLabel(c)), S(c.device_type ? titleCase(c.device_type) : ''), S(c.session_id), N(1),
      S(o?.orderId), S(o?.date ? istDate(o.date) : ''), S(o?.status),
    ]);
  }

  // ── Sheet 3: Clicks vs Sales Orders (product-wise)
  const s3: Cell[][] = [];
  s3.push([T('Product-wise marketplace clicks vs matched sales orders', 8)]);
  s3.push([S(haveOrders
    ? `Orders from: ${orderFiles.map((f) => `${f.fileName} (${MARKETPLACE_LABEL[f.marketplace]}, ${f.matched}/${f.orders.length} matched to products)`).join('; ')}. A click is credited with an order when the same product sells on the same marketplace within ${ATTRIBUTION_DAYS} days after it. Marketplace orders also come from shoppers who never visited the website, so treat the conversion rate as indicative.`
    : 'No marketplace order file was attached, so order columns are empty. Attach the Myntra / Amazon / Ajio orders export when downloading to fill them.')]);
  s3.push(BLANK);
  const s3Header = ['', 'Product', 'SKU', 'Category', 'Clicks', ...MARKETS.map((m) => `${MARKETPLACE_LABEL[m]} clicks`),
    'Orders credited to clicks', 'All orders for product (file)', 'Units ordered', 'Order status breakdown', 'Click-to-order rate (indicative)'];
  s3.push(s3Header.map(H));
  const s3Rows = [...aggs].sort((a, b) => b.clicks - a.clicks || b.orders - a.orders);
  const s3Start = s3.length;
  for (const a of s3Rows) {
    const p = byId.get(a.id);
    s3.push([
      { value: '', height: 44 }, S(productName(a.id)), S(p?.sku), S(titleCase(p?.sub_category || '')), N(a.clicks),
      ...MARKETS.map((m) => N(a.byMarket[m])),
      N(a.matched), N(a.orders), N(a.units),
      S([...a.statuses.entries()].sort((x, y) => y[1] - x[1]).map(([s, n]) => `${s}: ${n}`).join(', ')),
      P(haveOrders && a.clicks ? a.matched / a.clicks : null),
    ]);
  }

  // ── Sheet 4: Product Performance
  const s4: Cell[][] = [];
  const s4Images: { productId: string; row: number }[] = [];
  const trend = (cur: number, prev: number) => (prev === 0 ? (cur > 0 ? 'New activity' : '—') : `${cur >= prev ? '+' : ''}${Math.round(((cur - prev) / prev) * 100)}%`);
  const section = (title: string, note: string, list: Agg[], cols: [string, (a: Agg) => Cell][]) => {
    s4.push([T(title, cols.length + 3)]);
    if (note) s4.push([S(note)]);
    s4.push([H(''), H('Product'), H('Category'), ...cols.map(([h]) => H(h))]);
    if (!list.length) s4.push([null, S('Nothing to show for this period.')]);
    for (const a of list) {
      s4.push([{ value: '', height: 44 }, S(productName(a.id)), S(titleCase(byId.get(a.id)?.sub_category || '')), ...cols.map(([, f]) => f(a))]);
      s4Images.push({ productId: a.id, row: s4.length });
    }
    s4.push(BLANK);
  };
  section('Highest-clicked products', 'Top 25 by marketplace clicks in the period.', clicked.slice(0, 25), [
    ['Clicks', (a) => N(a.clicks)], ['Last 7 days', (a) => N(a.last7)], ['Last 30 days', (a) => N(a.last30)],
    ['Orders credited', (a) => (haveOrders ? N(a.matched) : S('—'))],
  ]);
  section(
    'Products receiving clicks but few or no matched orders',
    haveOrders ? 'Clicked at least 3 times, with no more than one order credited for every 10 clicks.' : 'Needs a marketplace orders file. Attach one when downloading to fill this section.',
    haveOrders ? clicked.filter((a) => a.clicks >= 3 && a.matched / a.clicks <= 0.1).slice(0, 40) : [],
    [['Clicks', (a) => N(a.clicks)], ['Orders credited', (a) => N(a.matched)], ['All orders (file)', (a) => N(a.orders)], ['Click-to-order rate', (a) => P(a.matched / a.clicks)]],
  );
  section(
    'Products with improving click trends',
    'Last 7 days compared with the 7 days before (at least 3 clicks in the last 7 days).',
    clicked.filter((a) => a.last7 >= 3 && a.last7 > a.prev7).sort((a, b) => (b.last7 - b.prev7) - (a.last7 - a.prev7)).slice(0, 25),
    [['Last 7 days', (a) => N(a.last7)], ['Previous 7 days', (a) => N(a.prev7)], ['Change', (a) => S(trend(a.last7, a.prev7))], ['Last 30 days', (a) => N(a.last30)]],
  );
  section(
    'Products with declining engagement',
    'Last 30 days compared with the 30 days before (at least 3 clicks in the earlier 30 days).',
    clicked.filter((a) => a.prev30 >= 3 && a.last30 < a.prev30).sort((a, b) => (a.last30 - a.prev30) - (b.last30 - b.prev30)).slice(0, 25),
    [['Last 30 days', (a) => N(a.last30)], ['Previous 30 days', (a) => N(a.prev30)], ['Change', (a) => S(trend(a.last30, a.prev30))], ['Last 7 days', (a) => N(a.last7)]],
  );

  // ── Images (one small thumbnail per product row on sheets 3 and 4)
  const imageProducts = [...new Set([...s3Rows.map((a) => a.id), ...s4Images.map((x) => x.productId)])]
    .map((id) => byId.get(id)).filter(Boolean) as ProductRow[];
  onProgress?.('Adding product images…');
  const thumbs = await thumbnails(imageProducts, onProgress);
  const img = (productId: string, row: number) => {
    const content = thumbs.get(productId);
    return content ? { content, contentType: 'image/jpeg', width: 56, height: 56, dpi: 96, anchor: { row, column: 1 }, offsetX: 2, offsetY: 2 } : null;
  };
  const s3Images = s3Rows.map((a, i) => img(a.id, s3Start + i + 1)).filter(Boolean);
  const s4Imgs = s4Images.map((x) => img(x.productId, x.row)).filter(Boolean);

  onProgress?.('Writing the Excel file…');
  const { default: writeXlsxFile } = await import('write-excel-file/browser');
  const date = new Date().toISOString().slice(0, 10);
  await (writeXlsxFile as any)([
    { data: s1, sheet: 'Click Summary', columns: [{ width: 60 }, { width: 24 }, { width: 24 }] },
    {
      data: s2, sheet: 'Detailed Click Log', stickyRowsCount: 1,
      columns: [14, 14, 12, 26, 46, 40, 14, 22, 20, 12, 50, 40, 36, 10, 16, 8, 22, 14, 14].map((width) => ({ width })),
    },
    {
      data: s3, sheet: 'Clicks vs Sales Orders', images: s3Images,
      columns: [10, 46, 14, 20, 8, 10, 10, 10, 10, 12, 14, 10, 40, 14].map((width) => ({ width })),
    },
    { data: s4, sheet: 'Product Performance', images: s4Imgs, columns: [10, 46, 20, 14, 14, 14, 14].map((width) => ({ width })) },
  ]).toFile(`product-click-report-${date}.xlsx`);
}
