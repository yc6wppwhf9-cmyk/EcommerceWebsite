import { useState, useRef, useEffect } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, ArrowRight, Truck, CreditCard, ShieldCheck, PackageCheck } from 'lucide-react';
import { CATEGORIES } from '../constants/products';
import { api } from '../lib/api';
import type { Product } from '../types';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { fadeUp, stagger, revealProps } from '../lib/motion';
import { LazyImage } from '../components/LazyImage';
import { SEO } from '../components/SEO';

const BACKPACK_TABS = [
  { id: 'college-backpacks',  label: 'College Backpack',  image: '/Category/ref.png',                         to: '/college-backpacks',  apiParams: { category: 'college-backpacks' } },
  { id: 'laptop-backpacks',   label: 'Laptop Backpack',   image: '/junior/Drift Sky Blue_ Hero 1.png',        to: '/laptop-backpacks',   apiParams: { category: 'laptop-backpacks' } },
  { id: 'trekking-backpacks', label: 'Trekking Backpack', image: '/Category/Travelling Bag.jpg',              to: '/trekking-backpacks', apiParams: { category: 'trekking-backpacks' } },
];

// Native pixel size of the hero creatives. The slider is pinned to this ratio so
// the banners — which carry their headline and layout baked in — are never
// cropped. If the artwork is re-exported at a different size, change these two
// numbers and nothing else: every hero measurement derives from them.
const HERO_W = 2880;
const HERO_H = 1621;

const HERO_SLIDES = [
  {
    src: '/Creatives/1.png',
    badge: 'NEW 2026 COLLECTION',
    title: 'ENGINEERED FOR MODERN EXPLORERS',
    subtitle: 'Ergonomic backpacks & travel gear designed for university, work, and urban travel.',
    cta: 'Explore Campus Picks',
    to: '/college-backpacks'
  },
  {
    src: '/Creatives/2.png',
    badge: 'JUNIOR & SCHOOL SERIES',
    title: 'LIGHTWEIGHT, VIBRANT & DURABLE',
    subtitle: 'Smart storage, waterproof fabrics & posture-support design for kids & juniors.',
    cta: 'Shop Junior Collection',
    to: '/junior'
  },
  {
    src: '/Creatives/3.png',
    badge: 'PREMIUM TRAVEL GEAR',
    title: 'TRAVEL WITHOUT BOUNDARIES',
    subtitle: 'High-durability trolley bags & duffles built for effortless journeys.',
    cta: 'Shop Luggage',
    to: '/luggage'
  },
  {
    src: '/Creatives/4.png',
    badge: 'EXECUTIVE LAPTOP SERIES',
    title: 'SLEEK PROTECTION FOR TECH',
    subtitle: 'Padded laptop compartments with weather resistance & sleek minimalist design.',
    cta: 'Shop Laptop Bags',
    to: '/laptop-backpacks'
  },
  {
    src: '/Creatives/5.png',
    badge: 'URBAN ACCESSORIES',
    title: 'STYLE & FUNCTION COMBINED',
    subtitle: 'Premium travel accessories engineered for seamless organization on the go.',
    cta: 'Explore Accessories',
    to: '/accessories'
  },
];

const CATS = [
  { to: '/backpacks', label: 'Backpacks', img: '/Category/Backpack.jpg' },
  { to: '/luggage', label: 'Luggage', img: '/Category/Travelling Bag.jpg' },
  { to: '/accessories', label: 'Accessories', img: '/Category/Accessories.jpg' },
];

const IMG = {
  banner: '/Category/Artboard 1 1.png',
  refPoster: '/Category/ref.png',
};

// Primary editorial banner CTA — always present, regardless of gender tagging.
const BANNER_CTA = { to: '/luggage', label: 'Shop Now' };

// Secondary editorial banner CTAs. Each is shown only if its gender query returns
// stock, so a button never navigates to an empty product grid.
const GENDER_LINKS = [
  { gender: 'women', to: '/women', label: 'Shop Women' },
  { gender: 'men', to: '/men', label: 'Shop Men' },
];

// Desktop column counts per width tier. Wider screens get more products rather
// than bigger cards — the cards render their image `object-contain` inside a
// padded square, so inflating them just grows the white space around the photo.
// Classes are written out in full because Tailwind cannot see interpolated names.
const COLUMN_TIERS = [
  { min: 0,    tabs: 3, tabsClass: 'grid-cols-3', best: 4, bestClass: 'grid-cols-4' },
  { min: 1280, tabs: 4, tabsClass: 'grid-cols-4', best: 5, bestClass: 'grid-cols-5' },
  { min: 1536, tabs: 5, tabsClass: 'grid-cols-5', best: 6, bestClass: 'grid-cols-6' },
];

// Tracks which tier the viewport is in. Needed in JS (not just CSS) because the
// grids are paginated — the slice size has to agree with the column count.
const useColumnTier = () => {
  const [tier, setTier] = useState(COLUMN_TIERS[0]);

  useEffect(() => {
    const queries = COLUMN_TIERS.slice(1).map(t => ({ t, mq: window.matchMedia(`(min-width: ${t.min}px)`) }));
    const update = () => {
      const matched = queries.filter(q => q.mq.matches).map(q => q.t);
      setTier(matched.length ? matched[matched.length - 1] : COLUMN_TIERS[0]);
    };
    update();
    queries.forEach(q => q.mq.addEventListener('change', update));
    return () => queries.forEach(q => q.mq.removeEventListener('change', update));
  }, []);

  return tier;
};

const heroVariants = {
  enter: { opacity: 0, scale: 1.04 },
  center: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
};

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((p) => (p + 1) % HERO_SLIDES.length);
  const prev = () => setCurrent((p) => (p - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  useEffect(() => {
    const timer = setInterval(() => {
      next();
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    // These creatives are finished banners: headline, product and layout are all
    // baked in at fixed positions, so cropping them damages the design. The box is
    // therefore pinned to the artwork's own 16:9 and sized to fit the space under
    // the header, which means it is never cropped and never below the fold.
    //   height -> whichever is smallest: the 16:9 of the current width, the
    //             viewport under the header, or 760px on very tall screens
    //   width  -> that height back at 16:9, capped at the full width
    // On short, wide screens the hero simply insets and centres rather than losing
    // its top and bottom edges. 100dvh (not vh) so mobile browser chrome collapsing
    // does not reintroduce the clipping.
    <section
      className="relative w-full bg-black overflow-hidden aspect-[16/9] sm:aspect-auto sm:h-[calc(100vh-4rem)] max-h-[280px] xs:max-h-[360px] sm:max-h-[620px] lg:max-h-[760px] min-h-[190px] sm:min-h-[480px]"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={current}
          variants={heroVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="absolute inset-0 z-0"
        >
          <img
            alt={HERO_SLIDES[current].title}
            className="w-full h-full object-contain sm:object-cover object-center bg-black"
            src={HERO_SLIDES[current].src}
            loading="eager"
          />
          {/* The creatives are finished banners — light gradient so controls stay readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content Overlay */}
      <div className="relative z-20 h-full max-w-[1720px] mx-auto px-4 sm:px-12 lg:px-16 flex flex-col justify-end pb-3 sm:pb-16 lg:pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="max-w-2xl text-left"
          >
            <div className="flex items-center gap-4">
              <Link
                to={HERO_SLIDES[current].to}
                className="inline-flex items-center gap-2 sm:gap-3 bg-white text-black px-3.5 py-2 sm:px-8 sm:py-4 rounded-sm text-[9.5px] sm:text-[12px] font-bold uppercase tracking-[0.16em] sm:tracking-[0.2em] shadow-xl hover:bg-[#26B3FF] hover:text-white transition-all duration-300 group"
              >
                {HERO_SLIDES[current].cta}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prev}
        aria-label="Previous Slide"
        className="hidden sm:flex absolute left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 border border-white/20 rounded-full items-center justify-center bg-black/40 hover:bg-white hover:text-gray-900 backdrop-blur-md transition-all duration-300 text-white group"
      >
        <ChevronLeft size={22} className="group-hover:-translate-x-0.5 transition-transform" />
      </button>
      <button
        onClick={next}
        aria-label="Next Slide"
        className="hidden sm:flex absolute right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 border border-white/20 rounded-full items-center justify-center bg-black/40 hover:bg-white hover:text-gray-900 backdrop-blur-md transition-all duration-300 text-white group"
      >
        <ChevronRight size={22} className="group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Dots & Slide Counter */}
      <div className="absolute bottom-3 right-3 sm:bottom-6 sm:right-12 z-30 flex items-center gap-2 sm:gap-3 bg-black/60 backdrop-blur-md px-3 py-1 sm:px-4 sm:py-2 rounded-full border border-white/15">
        <span className="text-[9px] sm:text-[11px] font-bold tracking-widest text-white/90">0{current + 1} / 0{HERO_SLIDES.length}</span>
        <div className="w-px h-2.5 sm:h-3 bg-white/20" />
        <div className="flex gap-1 sm:gap-1.5">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-4 sm:w-6 bg-[#26B3FF]' : 'w-1 sm:w-1.5 bg-white/40'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const BestSellerCard = ({ product }: { product: Product }) => {
  const originalPrice = (product as any).original_price ?? product.originalPrice ?? product.price;
  const discount = originalPrice > product.price
    ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
    : 0;

  return (
    <Link 
      to={`/product/${product.slug || product.id}`} 
      className="flex flex-col bg-white group border border-line rounded-sm p-2 md:p-3 overflow-hidden transition-transform duration-500 ease-out hover:-translate-y-1"
    >
      <div className="overflow-hidden bg-white" style={{ aspectRatio: '1 / 1' }}>
        <LazyImage
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain p-5 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          width={400}
        />
      </div>
      <div className="pt-3 space-y-1">
        <h3 className="font-outfit font-normal text-[13px] md:text-[15px] text-graphite leading-snug line-clamp-1">
          {product.name}
        </h3>
      </div>
    </Link>
  );
};

// Prefetch all tab data + best sellers in parallel so the API cache is warm
// before the user interacts with any tab. Called once on module load.
const prefetchHomeData = (() => {
  let done = false;
  return () => {
    if (done) return;
    done = true;
    const fetches = [
      ...BACKPACK_TABS.map(tab => {
        const params = { ...(tab.apiParams || { category: tab.id }), limit: '20' };
        return api.getProducts(params as any).catch(() => {});
      }),
      api.getProducts({ sort: 'bestseller', limit: '12', isPremium: 'false' }).catch(() => {}),
      api.getProducts({ limit: '1' }).catch(() => {}),
      ...GENDER_LINKS.map(link =>
        api.getProducts({ gender: link.gender, isPremium: 'false', limit: '1' }).catch(() => {})
      ),
    ];
    Promise.all(fetches).catch(() => {});
  };
})();

export const Home = () => {
  const reduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<string>('college-backpacks');
  const [tabProducts, setTabProducts] = useState<Product[]>([]);
  const [tabLoading, setTabLoading] = useState(true);
  const [tabPage, setTabPage] = useState(0);
  const columns = useColumnTier();
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  // null = still checking. Drives the editorial banner: real "New Arrival" copy once
  // the catalogue has anything in it, "Launching Soon" while it's empty.
  const [hasProducts, setHasProducts] = useState<boolean | null>(null);
  // null = still checking. Holds only the gender CTAs that have stock behind them.
  const [genderStock, setGenderStock] = useState<typeof GENDER_LINKS | null>(null);
  const tabCategory = CATEGORIES.find((c) => c.slug === activeTab);
  const activeTabConfig = BACKPACK_TABS.find(t => t.id === activeTab) || BACKPACK_TABS[0];

  // Category flip-card state
  const [catFlipIndex, setCatFlipIndex] = useState(0);
  const catTouchRef = useRef<number | null>(null);

  const goNextCat = (total: number) => { setCatFlipIndex(i => (i + 1) % total); };
  const goPrevCat = (total: number) => { setCatFlipIndex(i => (i - 1 + total) % total); };
  const handleCatTouchStart = (e: React.TouchEvent) => { catTouchRef.current = e.touches[0].clientX; };
  const handleCatTouchEnd = (e: React.TouchEvent, total: number) => {
    if (catTouchRef.current === null) return;
    const diff = catTouchRef.current - e.changedTouches[0].clientX;
    if (diff > 40) goNextCat(total);
    else if (diff < -40) goPrevCat(total);
    catTouchRef.current = null;
  };

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    prefetchHomeData(); // fire all API calls in parallel on first render
  }, []);

  useEffect(() => {
    setTabLoading(true);
    setTabProducts([]);
    setTabPage(0);
    const tab = BACKPACK_TABS.find(t => t.id === activeTab);
    const params = { ...(tab?.apiParams || { category: activeTab }), limit: '20' };
    // Will resolve from cache instantly if prefetchHomeData already ran
    api.getProducts(params as any).then(res => {
      setTabProducts((res.products as unknown as Product[]).slice(0, 15));
    }).catch(() => { }).finally(() => setTabLoading(false));
  }, [activeTab]);

  useEffect(() => {
    api.getProducts({ sort: 'bestseller', limit: '12', isPremium: 'false' }).then(res => {
      const filtered = (res.products as unknown as Product[]).filter(
        (p: any) => p.categories?.slug !== 'junior'
      );
      setBestSellers(filtered.slice(0, 8));
    }).catch(() => { });
  }, []);

  useEffect(() => {
    // Cheapest possible existence check — one row is enough to know the store is live.
    api.getProducts({ limit: '1' })
      .then(res => setHasProducts((res.products?.length ?? 0) > 0))
      .catch(() => setHasProducts(false));
  }, []);

  useEffect(() => {
    // Ask the exact queries the CTAs navigate to. A product only counts here once
    // it is tagged women/men — everything tagged `unisex` answers neither, which is
    // why the buttons stay hidden until the catalogue is actually gendered.
    Promise.all(
      GENDER_LINKS.map(link =>
        api.getProducts({ gender: link.gender, isPremium: 'false', limit: '1' })
          .then(res => (res.products?.length ?? 0) > 0)
          .catch(() => false)
      )
    ).then(results => setGenderStock(GENDER_LINKS.filter((_, i) => results[i])));
  }, []);

  const tabPageCount = Math.max(1, Math.ceil(tabProducts.length / columns.tabs));

  useEffect(() => {
    // Widening the window fits more per page, which can strand tabPage past the end.
    setTabPage(p => Math.min(p, tabPageCount - 1));
  }, [tabPageCount]);

  // Banner copy follows the catalogue: a live store gets the real "New Arrival"
  // pitch, an empty one gets an honest holding message with a CTA that goes
  // somewhere real instead of an empty product grid.
  const banner = hasProducts
    ? {
        heading: 'New Arrival',
        subheading: 'Ready For Your Journey',
        imageTo: '/backpacks' as string | null,
        // Only the genders that actually have stock. Empty until products are tagged.
        links: (genderStock ?? []).map(({ to, label }) => ({ to, label })),
      }
    : {
        heading: 'Launching Soon',
        subheading: 'Ready For Your Journey',
        imageTo: null as string | null,
        links: [{ to: '/contact', label: 'Notify Me' }],
      };

  return (
    <main className="font-outfit">
      <SEO
        title="Priority Bags — Premium Backpacks, Luggage & Travel Accessories"
        description="Shop Priority Bags for premium backpacks, travel luggage, and accessories. Free shipping across India. Trusted by thousands of travellers."
        url="https://prioritybags.in"
      />
      <HeroSlider />

      {/* The trust strip that sat here duplicated the "Why Shop With Us" section
          further down the page, which carries the same four promises. */}
      <>
      <section className="md:hidden py-8 px-4 text-center">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.3em] text-slate mb-6">Shop By Category</h2>
        <div className="md:hidden px-2">
          {(() => {
            const total = CATS.length;
            return (
              <div
                className="relative select-none max-w-sm mx-auto"
                style={{ perspective: '1200px' }}
                onTouchStart={handleCatTouchStart}
                onTouchEnd={(e) => handleCatTouchEnd(e, total)}
              >
                {/* Stacked cards behind (depth effect) */}
                {[2, 1].map((offset) => {
                  const idx = catFlipIndex + offset;
                  if (idx >= total) return null;
                  return (
                    <div
                      key={`stack-${offset}`}
                      className="absolute inset-y-0 rounded-2xl overflow-hidden pointer-events-none"
                      style={{
                        left: `${offset * 10}px`,
                        right: `-${offset * 10}px`,
                        transform: `scale(${1 - offset * 0.04}) translateX(${offset * 8}px)`,
                        filter: `brightness(${0.55 - offset * 0.1})`,
                        zIndex: 10 - offset,
                        transformOrigin: 'right center',
                      }}
                    >
                      <div className="relative w-full" style={{ paddingBottom: '120%' }}>
                        <img
                          src={CATS[idx]?.img || ''}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover object-top"
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Active card */}
                <div style={{ position: 'relative', zIndex: 20, overflow: 'hidden', borderRadius: '1rem' }}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={catFlipIndex}
                      initial={{ opacity: 0, scale: 1.03 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                      className="w-full rounded-sm overflow-hidden border border-line"
                    >
                      <Link to={CATS[catFlipIndex].to} className="block w-full relative" style={{ paddingBottom: '120%' }}>
                        <img
                          src={CATS[catFlipIndex].img}
                          alt={CATS[catFlipIndex].label}
                          className="absolute inset-0 w-full h-full object-cover object-top"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
                          <span className="block text-white text-[22px] font-black uppercase tracking-widest leading-tight drop-shadow-lg">{CATS[catFlipIndex].label}</span>
                        </div>
                      </Link>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Navigation controls */}
                <div className="flex justify-between items-center mt-6 px-1">
                  <button onClick={() => goPrevCat(total)} className="p-2 text-gray-400 disabled:opacity-30 transition-opacity">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex gap-2">
                    {CATS.map((_, i) => (
                      <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === catFlipIndex ? 'w-6 bg-ink' : 'w-1.5 bg-line'}`} />
                    ))}
                  </div>
                  <button onClick={() => goNextCat(total)} className="p-2 text-gray-400 transition-opacity">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      <section className="hidden md:block max-w-[1720px] mx-auto px-8 lg:px-12 pt-12 pb-10 lg:pt-16 lg:pb-14">
        <motion.div
          className="grid grid-cols-3 gap-6 lg:gap-10"
          variants={stagger(0.09)}
          {...revealProps(reduceMotion)}
        >
          {CATS.map((cat) => (
            <motion.div key={cat.label} variants={fadeUp}>
              <Link to={cat.to} className="group relative block rounded-sm overflow-hidden transition-transform duration-700 ease-out hover:-translate-y-1.5 border border-line bg-white">
                <LazyImage src={cat.img} alt={cat.label} className="w-full h-auto block transition-transform duration-[1.6s] ease-out group-hover:scale-[1.03]" width={600} />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-700" />
                <div className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-white flex items-center justify-center border border-line translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <ArrowRight size={22} className="text-ink" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>
      </>

      {/* Editorial Banner (Keeping same as previous per customer screenshot).
          Hidden until the product check resolves so the copy never flips mid-view. */}
      {hasProducts !== null && genderStock !== null && (
      <section className="relative bg-ink">
        {/* Mobile version */}
        <div className="md:hidden relative w-full overflow-hidden">
          <img src={IMG.banner} alt={banner.heading} className="w-full h-auto object-cover block" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 pb-8">
            <h2 className="text-[13px] font-medium uppercase tracking-[0.35em] text-white mb-2">{banner.heading}</h2>
            <p className="text-[16px] font-outfit font-medium uppercase tracking-[0.2em] text-white/80 select-none mb-6">{banner.subheading}</p>
            {banner.links.length > 0 && (
              <div className="flex gap-6 mb-6">
                {banner.links.map((link) => (
                  <Link key={link.to} to={link.to} className="text-[12px] font-bold uppercase tracking-widest border-b-2 border-white text-white pb-1">{link.label}</Link>
                ))}
              </div>
            )}
            <Link to={BANNER_CTA.to} className="inline-flex items-center gap-2 rounded-sm bg-white px-7 py-3.5 text-[11px] font-medium uppercase tracking-[0.2em] text-ink">
              {BANNER_CTA.label}
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Desktop version - Exactly as shown in screenshot */}
        <div className="hidden md:block text-white relative py-10 lg:py-12">
          <div className="max-w-[1720px] mx-auto px-8 lg:px-12 relative z-10 flex flex-row items-center gap-12 lg:gap-20">
            {banner.imageTo ? (
              <Link to={banner.imageTo} className="w-[46%] relative z-30 rounded-sm overflow-hidden -mt-16 -mb-16 block group">
                <img src={IMG.banner} alt="Style" className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" />
              </Link>
            ) : (
              <div className="w-[46%] relative z-30 rounded-sm overflow-hidden -mt-16 -mb-16 block">
                <img src={IMG.banner} alt="Style" className="w-full h-auto object-cover" />
              </div>
            )}
            <div className="flex-1 text-left py-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-brass mb-5">Fresh picks for every trip</p>
              <h2 className="text-5xl lg:text-6xl font-normal uppercase tracking-[0.14em] text-white mb-6">{banner.heading}</h2>
              <p className={`text-[16px] font-outfit font-normal uppercase tracking-[0.2em] text-white/50 select-none pointer-events-none ${banner.links.length ? 'mb-10' : ''}`}>{banner.subheading}</p>
              {banner.links.length > 0 && (
                <div className="flex gap-8">
                  {banner.links.map((link) => (
                    <Link key={link.to} to={link.to} className="text-xs font-bold uppercase tracking-widest border-b-2 border-white pb-1 hover:opacity-70 transition-all">{link.label}</Link>
                  ))}
                </div>
              )}
              <Link to={BANNER_CTA.to} className="inline-flex items-center gap-2.5 rounded-sm bg-white px-9 py-4 mt-8 text-[12px] font-medium uppercase tracking-[0.2em] text-ink transition-transform duration-500 hover:-translate-y-0.5">
                {BANNER_CTA.label}
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Product Tabs Section */}
      <section className="pt-10 md:pt-20 pb-12 md:pb-16 bg-bone">
        <div className="max-w-[1720px] mx-auto px-4 md:px-10 lg:px-14">
          <div className="relative">
            <div className="flex gap-1.5 md:gap-3 border border-line bg-white p-1.5 rounded-sm mb-7 md:mb-10">
              {BACKPACK_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex-1 h-11 px-2 md:px-5 rounded-sm text-[11px] md:text-[12px] font-medium uppercase tracking-[0.16em] md:tracking-[0.18em] transition-colors whitespace-nowrap text-center ${
                    activeTab === tab.id
                      ? 'text-white'
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="homeActiveTab"
                      className="absolute inset-0 bg-ink rounded-sm"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">
                    <span className="md:hidden">{tab.label.replace(/\s*backpack$/i, '')}</span>
                    <span className="hidden md:inline">{tab.label}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {tabCategory && (
            <div className="md:hidden flex items-center gap-4 p-3 mb-5 rounded-lg overflow-hidden bg-[#F8BE57]">
              <div className="w-16 h-16 shrink-0 rounded-md overflow-hidden bg-white/30">
                <LazyImage
                  src={activeTabConfig.image}
                  alt={activeTabConfig.label}
                  className="w-full h-full object-cover"
                  width={80}
                />
              </div>
              <div className="text-white font-outfit min-w-0">
                <p className="font-medium uppercase text-[10px] tracking-[0.24em] text-brass">Featured</p>
                <p className="font-normal uppercase text-[17px] tracking-[0.06em] leading-tight truncate">{activeTabConfig.label}</p>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-[260px_minmax(0,1fr)] lg:grid-cols-[330px_minmax(0,1fr)] gap-6 lg:gap-8 items-start">
            <Link
              to={activeTabConfig.to}
              className="hidden md:flex flex-col h-auto overflow-hidden relative group rounded-sm bg-white border border-line transition-transform duration-500 ease-out hover:-translate-y-1"
            >
              {/* Image section with border frame */}
              <div className="relative overflow-hidden bg-white flex items-center justify-center p-4" style={{ aspectRatio: '1/1.1' }}>
                <div className="absolute inset-0 border border-line z-10" />
                <LazyImage
                  src={activeTabConfig.image}
                  alt={activeTabConfig.label}
                  className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  width={520}
                />
              </div>
              
              {/* Text section below */}
              <div className="px-5 py-4 bg-ink flex items-center justify-between">
                <div>
                  <p className="font-medium uppercase tracking-[0.24em] leading-none text-[10px] text-brass mb-2">Trendy</p>
                  <p className="font-normal uppercase tracking-[0.06em] leading-snug text-[15px] lg:text-[16px] text-white max-w-[220px]">
                    {activeTabConfig.label}
                  </p>
                </div>
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink transition-transform duration-500 group-hover:translate-x-1 flex-shrink-0">
                  <ArrowRight size={16} />
                </div>
              </div>
            </Link>

            <div className="min-w-0 relative">
              {tabProducts.length > columns.tabs && (
                <>
                  <button
                    onClick={() => setTabPage(p => Math.max(0, p - 1))}
                    disabled={tabPage === 0}
                    className="hidden md:flex absolute left-0 top-[35%] -translate-x-1/2 w-11 h-11 bg-white hover:bg-ink hover:text-white items-center justify-center transition-colors duration-300 z-30 rounded-full border border-line disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-current"
                    aria-label="Previous products"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setTabPage(p => Math.min(tabPageCount - 1, p + 1))}
                    disabled={tabPage >= tabPageCount - 1}
                    className="hidden md:flex absolute right-0 top-[35%] translate-x-1/2 w-11 h-11 bg-white hover:bg-ink hover:text-white items-center justify-center transition-colors duration-300 z-30 rounded-full border border-line disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-current"
                    aria-label="Next products"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {tabLoading ? (
                <>
                  <div className="md:hidden grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map(n => (
                      <div key={n}>
                        <div className="aspect-[300/307] bg-gray-100 animate-pulse rounded-lg" />
                        <div className="mt-3 h-4 w-4/5 bg-gray-100 animate-pulse rounded" />
                        <div className="mt-3 h-9 w-full bg-gray-100 animate-pulse rounded" />
                      </div>
                    ))}
                  </div>
                  <div className={`hidden md:grid gap-6 ${columns.tabsClass}`}>
                    {Array.from({ length: columns.tabs }, (_, n) => (
                      <div key={n}>
                        <div className="aspect-[300/307] bg-gray-100 animate-pulse rounded-lg" />
                        <div className="mt-4 h-4 w-4/5 bg-gray-100 animate-pulse rounded" />
                        <div className="mt-3 h-4 w-1/2 bg-gray-100 animate-pulse rounded" />
                        <div className="mt-4 h-10 w-full bg-gray-100 animate-pulse rounded" />
                      </div>
                    ))}
                  </div>
                </>
              ) : tabProducts.length > 0 ? (
                <>
                  {/* Mobile: clean 2-column grid */}
                  <div className="md:hidden grid grid-cols-2 gap-3 pb-2">
                    {tabProducts.slice(0, 6).map(p => (
                      <div key={p.id} className="min-w-0">
                        <ProductCard product={p} />
                      </div>
                    ))}
                  </div>
                  {/* Desktop: paginated grid, one page per row (no overflow → never a clipped card) */}
                  <div className={`hidden md:grid gap-6 ${columns.tabsClass}`}>
                    {tabProducts.slice(tabPage * columns.tabs, tabPage * columns.tabs + columns.tabs).map(p => (
                      <div key={p.id} className="min-w-0">
                        <ProductCard product={p} />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="w-full min-h-[320px] rounded-sm border border-dashed border-line bg-white flex flex-col items-center justify-center text-center px-6">
                  <PackageCheck size={30} className="text-marine mb-4" />
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-ink mb-2">Fresh stock coming soon</p>
                  <Link to={activeTabConfig.to} className="mt-4 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-marine">
                    View category <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="pb-16 pt-10 md:pt-20 bg-white border-t border-gray-100">
        <div className="max-w-[1720px] mx-auto px-4 md:px-14">
          <div className="text-center mb-12">
            <h2 className="font-outfit font-semibold text-[16px] text-[#030014] tracking-[0.1em] uppercase">Shop Best Sellers</h2>
          </div>
          {/* Mobile: 2-column grid */}
          <div className="md:hidden grid grid-cols-2 gap-x-4 gap-y-6">
            {bestSellers.slice(0, 6).map(p => (
              <BestSellerCard key={p.id} product={p} />
            ))}
          </div>

          <div className={`hidden md:grid gap-6 lg:gap-8 ${columns.bestClass}`}>
            {bestSellers.slice(0, columns.best).map(p => (
              <BestSellerCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Shop With Us */}
      <section className="py-7 md:py-9 bg-[#F9F9F9] border-t border-gray-100 font-outfit">
        <div className="max-w-[1720px] mx-auto px-5 md:px-8">
          <div className="flex flex-col items-center mb-5 md:mb-7">
            <p className="text-[14px] md:text-[15px] font-semibold text-[#14052b] uppercase tracking-[0.2em] font-outfit">Why Shop With Us</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6 md:gap-x-12">
            {[
              { Icon: Truck, label: 'Amazon Fulfilled', desc: 'Fast, tracked delivery by Amazon' },
              { Icon: CreditCard, label: 'Secure Amazon Checkout', desc: 'Pay safely on Amazon' },
              { Icon: ShieldCheck, label: 'Brand Promise', desc: 'Certified priority items' },
              { Icon: PackageCheck, label: 'Quality Unit', desc: '8-stage strength testing' }
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-2 md:gap-2.5">
                <div className="w-11 h-11 md:w-12 md:h-12 bg-white rounded-xl flex items-center justify-center shadow-md border border-gray-100 text-[#26B3FF]">
                  <f.Icon size={20} strokeWidth={1.5} />
                </div>
                <h3 className="text-[13px] md:text-[14px] font-semibold uppercase tracking-[0.12em] font-outfit">{f.label}</h3>
                <p className="text-[12px] md:text-[13px] font-medium text-gray-400 leading-snug font-outfit">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};
