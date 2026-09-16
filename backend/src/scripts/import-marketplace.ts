/**
 * One-time marketplace importer.
 *
 * Reads the "Marketplace 97 sku ( Amazon Asin ).xlsx" sheet, uploads each SKU's
 * local images (Pictures/Master images marketplace/<SKU>/<SKU>_N.png) to
 * Cloudinary, then upserts the products into Supabase — ready to go live with an
 * auto-generated description + features, price 0 (hidden on-site), and the
 * Amazon link as the buy target.
 *
 * SAFETY: runs as a DRY RUN by default (no uploads, no DB writes). Pass --commit
 * to actually perform uploads and writes.
 *
 * Usage (from the backend/ folder, with a filled-in .env):
 *   npm run import:marketplace                 # dry run — shows what would happen
 *   npm run import:marketplace -- --commit     # actually upload + write
 *   npm run import:marketplace -- --commit --limit=3   # do only the first 3 (test)
 *   npm run import:marketplace -- --images="D:\path" --excel="D:\file.xlsx"
 *
 * Required env (backend/.env — copy from .env.example and fill your own keys):
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';
import { readSheet } from 'read-excel-file/node';

// ── CLI args ─────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const hasFlag = (name: string) => args.includes(`--${name}`);
const getArg = (name: string): string | undefined => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : undefined;
};

const COMMIT = hasFlag('commit');
const REUPLOAD = hasFlag('reupload'); // force re-upload images even if the product already has them
const LIMIT = Number(getArg('limit') || '0') || 0;
const DEFAULT_STOCK = Number(getArg('stock') || process.env.IMPORT_STOCK || '100');
const IMAGES_DIR =
  getArg('images') ||
  process.env.IMPORT_IMAGES_DIR ||
  (fs.existsSync('C:\\Users\\himanshu.thakur\\Documents\\extracted_amazon_images')
    ? 'C:\\Users\\himanshu.thakur\\Documents\\extracted_amazon_images'
    : 'C:\\Users\\himanshu.thakur\\Pictures\\Master images marketplace');
const EXCEL_PATH =
  getArg('excel') ||
  process.env.IMPORT_EXCEL_PATH ||
  (fs.existsSync('C:\\Users\\himanshu.thakur\\Documents\\Marketplace 97 sku ( Amazon Asin ) (003).xlsx')
    ? 'C:\\Users\\himanshu.thakur\\Documents\\Marketplace 97 sku ( Amazon Asin ) (003).xlsx'
    : path.join(IMAGES_DIR, 'Marketplace 97 sku ( Amazon Asin ).xlsx'));

// ── Env / clients ────────────────────────────────────────────────────────────
const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const hasCloudinary = Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
if (COMMIT && !hasCloudinary) {
  console.log('ℹ️  Cloudinary env not set: using direct high-res Amazon CDN URLs from manifest if local upload is skipped.');
}
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`❌ Missing env vars: ${missing.join(', ')}. Fill them in backend/.env.`);
  process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});
if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp']);

/** files like INV16052_01.jpg or INV16052_1.png → sorted by the trailing number */
const gatherImages = (folder: string): string[] => {
  if (!fs.existsSync(folder)) return [];
  return fs
    .readdirSync(folder)
    .filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()))
    .sort((a, b) => {
      const na = Number(a.match(/_(\d+)\.[a-z]+$/i)?.[1] ?? 0);
      const nb = Number(b.match(/_(\d+)\.[a-z]+$/i)?.[1] ?? 0);
      return na - nb || a.localeCompare(b);
    })
    .map((f) => path.join(folder, f));
};

/** insert on-the-fly delivery optimisation into a Cloudinary URL */
const optimize = (url: string) =>
  url.replace('/image/upload/', '/image/upload/f_auto,q_auto,w_1600,c_limit/');

/** Load manifest if available */
const MANIFEST_PATH = path.join(
  path.dirname(IMAGES_DIR),
  'extracted_amazon_images',
  'extracted_manifest.json',
);
let manifestMap = new Map<string, string[]>();
if (fs.existsSync(MANIFEST_PATH)) {
  try {
    const mf = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
    for (const p of mf.products || []) {
      if (p.sku && Array.isArray(p.image_urls) && p.image_urls.length) {
        manifestMap.set(p.sku, p.image_urls);
      }
    }
  } catch {}
}

const detectType = (name: string, family: string): string => {
  const n = `${name} ${family}`.toLowerCase();
  if (n.includes('laptop') || ['atlas', 'matrix', 'oxford', 'xtreme', 'zipster', 'protech'].some((k) => n.includes(k))) return 'laptop bag';
  if (n.includes('college') || ['blockbuster', 'century', 'champion', 'dream', 'dreamer', 'fortuner', 'iconic', 'ignis', 'incredible', 'rockstar', 'sonata', 'stellar', 'striker'].some((k) => n.includes(k))) return 'college backpack';
  if (n.includes('trekk') || n.includes('rucksack') || n.includes('mount')) return 'trekking backpack';
  if (n.includes('trolley') || n.includes('trolly')) return 'kids trolley';
  if (n.includes('combo') || n.includes('lunch') || n.includes('pencil')) return 'junior combo';
  if (n.includes('school') || ['fluffy', 'fuzzy', 'gracious', 'minion', 'mischief', 'tipsy', 'power', 'smiley', 'funky', 'ranger'].some((k) => n.includes(k))) return 'school backpack';
  if (n.includes('duffle') || n.includes('duffel')) return 'duffle bag';
  if (n.includes('luggage') || n.includes('suitcase')) return 'luggage';
  if (n.includes('pouch')) return 'pouch';
  if (n.includes('tote')) return 'tote bag';
  if (n.includes('sling') || n.includes('crossbody')) return 'sling bag';
  if (n.includes('backpack')) return 'backpack';
  return 'bag';
};

const buildDescription = (name: string, type: string) =>
  `The ${name} is a premium ${type} from Priority, engineered for everyday durability and all-day comfort. ` +
  `Its functional, spacious design keeps your essentials organised in style — built to keep pace with school, college, and travel.`;

const buildFeatures = (type: string): string[] => {
  if (type === 'kids trolley' || type === 'trolley bag') {
    return [
      'Smooth 360° spinner wheels for effortless movement',
      'Telescopic adjustable aluminium trolley handle',
      'Durable, impact-resistant lightweight shell with vibrant character prints',
      'Spacious packing compartments with cross-strap retention',
      '1 Year Manufacturer Warranty',
    ];
  }
  if (type === 'junior combo') {
    return [
      'Complete matching set: Backpack + Lunch Tiffin Pouch + Pencil Case',
      'Ultra-lightweight ergonomic design tailored for young children',
      'Water-resistant wipe-clean fabric with vibrant graphics',
      'Soft padded adjustable shoulder straps for spine protection',
    ];
  }
  if (type === 'laptop bag') {
    return [
      'Dedicated cushioned laptop compartment (fits up to 15.6 inch laptops)',
      'Ergonomic breathable mesh back panel & contoured shoulder straps',
      'Water-resistant premium exterior fabric with reinforced base',
      'Multi-utility organizer pockets for tech accessories and chargers',
    ];
  }
  if (type === 'trekking backpack') {
    return [
      'Ergonomic padded shoulder straps and adjustable sternum buckle',
      'High-capacity multi-compartment storage with gear loops',
      'Water-resistant rugged exterior fabric',
      'Reinforced load-bearing seams & heavy-duty hardware',
    ];
  }
  if (type === 'school backpack') {
    return [
      'Ergonomic cushioned shoulder straps with breathable mesh padding',
      'Spacious multi-compartment design for books, notebooks, and water bottles',
      'Durable water-resistant exterior with reinforced stitching',
      'Attractive kid-friendly vibrant prints with smooth zippers',
    ];
  }
  const base = [
    'Durable, water-resistant exterior',
    'Spacious multi-compartment storage',
    'Premium branded hardware and zippers',
    'Ergonomic padded shoulder straps & breathable back panel',
  ];
  return base;
};

type Row = {
  sku: string;
  name: string;
  family: string;
  amazon_url: string | null;
  flipkart_url: string | null;
  myntra_url: string | null;
  ajio_url: string | null;
};

// ── Read Excel ───────────────────────────────────────────────────────────────
if (!fs.existsSync(EXCEL_PATH)) {
  console.error(`❌ Excel not found at: ${EXCEL_PATH}`);
  process.exit(1);
}
const sheet = await readSheet(fs.readFileSync(EXCEL_PATH));
const headers = (sheet.shift() || []).map((v) => String(v ?? '').trim());
const col = (name: string) => headers.findIndex((h) => h.toLowerCase() === name.toLowerCase());
const iSku = col('sku');
const iName = col('ITEM_NAME');
const iFamily = col('Family');
const iAmazon = col('Amazon link');
const iFlipkart = col('Flipkart link');
const iMyntra = col('Myntra link');
const iAjio = col('Ajio link');

let rows: Row[] = sheet
  .map((r) => ({
    sku: String(r[iSku] ?? '').trim(),
    name: String(r[iName] ?? '').replace(/\s+/g, ' ').trim(),
    family: String(r[iFamily] ?? '').trim(),
    amazon_url: String(r[iAmazon] ?? '').trim() || null,
    flipkart_url: String(r[iFlipkart] ?? '').trim() || null,
    myntra_url: String(r[iMyntra] ?? '').trim() || null,
    ajio_url: String(r[iAjio] ?? '').trim() || null,
  }))
  .filter((r) => r.sku && r.name);

if (LIMIT > 0) rows = rows.slice(0, LIMIT);

console.log(`\n${COMMIT ? '🟢 COMMIT MODE' : '🟡 DRY RUN (no writes) — pass --commit to apply'}`);
console.log(`Excel:  ${EXCEL_PATH}`);
console.log(`Images: ${IMAGES_DIR}`);
console.log(`Rows to process: ${rows.length}${LIMIT ? ` (limited to ${LIMIT})` : ''}\n`);

// ── Categories from DB ───────────────────────────────────────────────────────
const { data: categories, error: catErr } = await supabase.from('categories').select('id, slug');
if (catErr || !categories?.length) {
  console.error('❌ Could not load categories from Supabase:', catErr?.message);
  process.exit(1);
}
const slugToId = new Map(categories.map((c: any) => [String(c.slug).toLowerCase(), c.id]));
const fallbackCatId = slugToId.get('backpacks') || categories[0].id;

const CATEGORY_RULES: Array<[RegExp, string]> = [
  [/laptop/i, 'laptop-backpacks'],
  [/college/i, 'college-backpacks'],
  [/trekk|rucksack|hiking/i, 'trekking-backpacks'],
  [/duffle|duffel/i, 'duffle'],
  [/trolley|luggage|suitcase|cabin|check-?in/i, 'luggage'],
  [/pouch/i, 'pouch'],
  [/tote/i, 'tote-bag'],
  [/lunch/i, 'lunch-bag'],
  [/daypack/i, 'daypack'],
  [/sling|crossbody/i, 'accessories'],
  [/backpack/i, 'backpacks'],
];
const resolveCategory = (
  name: string,
  family: string,
): { id: string; slug: string; sub_category: string; gender: string; age_range: string } => {
  const n = `${name} ${family}`.toLowerCase();

  // 1. Trekking
  if (n.includes('trekk') || n.includes('rucksack') || n.includes('mount')) {
    const id = slugToId.get('trekking-backpacks') || fallbackCatId;
    return { id, slug: 'trekking-backpacks', sub_category: 'trekking-backpacks', gender: 'unisex', age_range: '11 Years & Above' };
  }

  // 2. Laptop
  if (n.includes('laptop') || ['atlas', 'matrix', 'oxford', 'xtreme', 'zipster', 'protech'].some((k) => n.includes(k))) {
    const id = slugToId.get('laptop-backpacks') || fallbackCatId;
    return { id, slug: 'laptop-backpacks', sub_category: 'laptop-backpacks', gender: 'unisex', age_range: '11 Years & Above' };
  }

  // 3. Junior (Kids School, Kids Trolley, Combo Sets)
  const isJuniorFamily = ['fluffy', 'fuzzy', 'gracious', 'minion', 'mischief', 'tipsy', 'power', 'smiley', 'funky', 'ranger'].some((k) => n.includes(k));
  if (n.includes('school') || isJuniorFamily || n.includes('trolley') || n.includes('trolly') || n.includes('combo')) {
    const juniorId = slugToId.get('junior') || slugToId.get('school-backpacks') || fallbackCatId;
    if (n.includes('trolley') || n.includes('trolly')) {
      return { id: juniorId, slug: 'junior', sub_category: 'kids-trolley', gender: 'kids', age_range: '6 to 10 Years' };
    }
    if (n.includes('combo') || n.includes('lunch')) {
      return { id: juniorId, slug: 'junior', sub_category: 'combo-set', gender: 'kids', age_range: '3 to 5 Years' };
    }
    const isNurseryKg = ['minion', 'gracious', 'fluffy', 'fuzzy', 'power', 'smiley'].some((k) => n.includes(k));
    const age = isNurseryKg ? '3 to 5 Years' : '6 to 10 Years';
    return { id: juniorId, slug: 'junior', sub_category: 'school-backpacks', gender: 'kids', age_range: age };
  }

  // 4. College
  if (n.includes('college') || ['blockbuster', 'century', 'champion', 'dream', 'dreamer', 'fortuner', 'iconic', 'ignis', 'incredible', 'rockstar', 'sonata', 'stellar', 'striker'].some((k) => n.includes(k))) {
    const id = slugToId.get('college-backpacks') || fallbackCatId;
    return { id, slug: 'college-backpacks', sub_category: 'college-backpacks', gender: 'unisex', age_range: '11 Years & Above' };
  }

  // 5. General Category Rules
  for (const [re, slug] of CATEGORY_RULES) {
    if (re.test(name) && slugToId.has(slug)) {
      return { id: slugToId.get(slug)!, slug, sub_category: slug, gender: 'unisex', age_range: '11 Years & Above' };
    }
  }

  return { id: fallbackCatId, slug: 'backpacks', sub_category: 'backpacks', gender: 'unisex', age_range: '11 Years & Above' };
};

// ── Existing products (idempotency) ──────────────────────────────────────────
const { data: existing } = await supabase.from('products').select('id, sku, slug, image, images');
const skuToRow = new Map((existing || []).map((p: any) => [p.sku, p]));
const usedSlugs = new Set<string>((existing || []).map((p: any) => p.slug).filter(Boolean));
const uniqueSlug = (name: string, sku: string): string => {
  let s = slugify(name) || sku.toLowerCase();
  if (usedSlugs.has(s)) s = `${s}-${sku.toLowerCase()}`;
  let i = 2;
  while (usedSlugs.has(s)) s = `${slugify(name)}-${i++}`;
  usedSlugs.add(s);
  return s;
};

// ── Process ──────────────────────────────────────────────────────────────────
const summary = { inserted: 0, updated: 0, skippedNoImages: [] as string[], errors: [] as string[] };
const categoryTally = new Map<string, number>();

for (const row of rows) {
  const type = detectType(row.name, row.family);
  const { id: category_id, slug: catSlug, sub_category: subCat, gender, age_range } = resolveCategory(row.name, row.family);
  categoryTally.set(`${catSlug}${subCat ? ' / ' + subCat : ''}`, (categoryTally.get(`${catSlug}${subCat ? ' / ' + subCat : ''}`) || 0) + 1);

  const folder = path.join(IMAGES_DIR, row.sku);
  const imageFiles = gatherImages(folder);
  const manifestUrls = manifestMap.get(row.sku) || [];
  const exists = skuToRow.get(row.sku);
  const canReuse = !!exists && Array.isArray(exists.images) && exists.images.length > 0 && !REUPLOAD;

  if (!imageFiles.length && !manifestUrls.length && !canReuse) {
    summary.skippedNoImages.push(row.sku);
    console.log(`⏭️  ${row.sku}  ${row.name}  → NO IMAGE FOLDER OR URL, skipped`);
    continue;
  }

  console.log(
    `${exists ? '♻️  update' : '➕ insert'}  ${row.sku}  [${catSlug}${subCat ? '/' + subCat : ''}] [${age_range}]  ` +
      `${canReuse ? 'reuse imgs' : imageFiles.length ? imageFiles.length + ' local imgs' : manifestUrls.length + ' CDN imgs'}  ${row.name}`,
  );

  if (!COMMIT) continue; // dry run stops here (no uploads, no writes)

  try {
    let urls: string[] = [];
    if (canReuse) {
      urls = exists.images as string[];
    } else if (hasCloudinary && imageFiles.length) {
      // Upload local images to Cloudinary
      for (let n = 0; n < imageFiles.length; n++) {
        try {
          const res = await cloudinary.uploader.upload(imageFiles[n], {
            folder: 'priority-bags/products',
            public_id: `${row.sku}_${n + 1}`,
            overwrite: true,
            resource_type: 'image',
          });
          urls.push(optimize(res.secure_url));
        } catch (imgErr: any) {
          console.error(`   ⚠️  ${row.sku} image ${n + 1} skipped: ${imgErr.message}`);
        }
      }
    } else if (manifestUrls.length) {
      // Use direct high-res Amazon CDN URLs from manifest
      urls = manifestUrls;
    } else if (imageFiles.length) {
      // Use standard local paths
      urls = imageFiles.map((_, idx) => `/products/${row.sku}/${row.sku}_0${idx + 1}.jpg`);
    }

    if (!urls.length) throw new Error('no images found or failed to upload');

    const slug = exists ? exists.slug : uniqueSlug(row.name, row.sku);
    const productData: Record<string, any> = {
      sku: row.sku,
      slug,
      name: row.name,
      description: buildDescription(row.name, type),
      price: 0,
      original_price: 0,
      category_id,
      image: urls[0],
      images: urls,
      colors: [{ name: row.family, code: '#111111', images: urls }],
      features: buildFeatures(type),
      stock: DEFAULT_STOCK,
      is_new: false,
      is_highlighted: false,
      is_premium: false,
      gender,
      size: '',
      age_range,
      sub_category: subCat,
      is_active: true,
      amazon_url: row.amazon_url,
      flipkart_url: row.flipkart_url,
      myntra_url: row.myntra_url,
      ajio_url: row.ajio_url,
    };

    if (exists) {
      // Update in place; junior_style is intentionally omitted so any existing
      // style tag is preserved.
      const { error } = await supabase.from('products').update(productData).eq('id', exists.id);
      if (error) throw error;
      summary.updated++;
    } else {
      const { error } = await supabase.from('products').insert({ ...productData, junior_style: null });
      if (error) throw error;
      summary.inserted++;
    }
  } catch (err: any) {
    summary.errors.push(`${row.sku}: ${err.message}`);
    console.error(`   ❌ ${row.sku} failed: ${err.message}`);
  }
}

// ── Report ───────────────────────────────────────────────────────────────────
console.log('\n──────────── SUMMARY ────────────');
console.log(`Category mapping:`);
for (const [slug, count] of [...categoryTally.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`   ${slug}: ${count}`);
}
if (COMMIT) {
  console.log(`\nInserted: ${summary.inserted}   Updated: ${summary.updated}`);
} else {
  console.log(`\n(DRY RUN — nothing written. Re-run with --commit to apply.)`);
}
if (summary.skippedNoImages.length) {
  console.log(`\n⚠️  ${summary.skippedNoImages.length} SKU(s) had no image folder and were skipped:`);
  console.log(`   ${summary.skippedNoImages.join(', ')}`);
}
if (summary.errors.length) {
  console.log(`\n❌ ${summary.errors.length} error(s):`);
  summary.errors.forEach((e) => console.log(`   ${e}`));
  process.exitCode = 1;
}
console.log('─────────────────────────────────\n');
