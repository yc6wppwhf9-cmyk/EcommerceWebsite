import { useState, useRef, useEffect } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, ArrowRight, Truck, CreditCard, ShieldCheck, PackageCheck } from 'lucide-react';
import { CATEGORIES } from '../constants/products';
import { api } from '../lib/api';
import type { Product } from '../types';
import { AnimatePresence, motion } from 'motion/react';
import { LazyImage } from '../components/LazyImage';
import { SEO } from '../components/SEO';

const BACKPACK_TABS = [
  { id: 'college-backpacks', label: 'College Backpack', image: '/Category/ref.png' },
  { id: 'school-backpacks', label: 'School Backpack', image: '/junior/Rectangle 28.png' },
  { id: 'laptop-backpacks', label: 'Laptop Backpack', image: '/junior/Drift Sky Blue_ Hero 1.png' },
  { id: 'trekking-backpacks', label: 'Trekking Backpack', image: '/Category/Travelling Bag.jpg' },
] as const;

const HERO_SLIDES = [
  { src: '/Creatives/hero-main.jpg', cta: 'Shop Campus Picks', to: '/college-backpacks' },
  { src: '/Creatives/editorial-2.jpg', cta: 'Shop Junior Collection', to: '/junior' },
  { src: '/Creatives/editorial-3.jpg', cta: 'Shop Trekking Gear', to: '/trekking-backpacks' },
  { src: '/Creatives/editorial-4.jpg', cta: 'Shop Luggage', to: '/luggage' },
  { src: '/Creatives/editorial-5.jpg', cta: 'Shop Laptop Bags', to: '/laptop-backpacks' },
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

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const isPausedRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPausedRef.current) setCurrent((p) => (p + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((p) => (p + 1) % HERO_SLIDES.length);
  const prev = () => setCurrent((p) => (p - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <section
      className="relative w-full bg-black overflow-hidden aspect-[16/9] md:aspect-[2.2/1] lg:aspect-[16/9]"
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') isPausedRef.current = true; }}
      onPointerLeave={(e) => { if (e.pointerType === 'mouse') isPausedRef.current = false; }}
    >
      <AnimatePresence>
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <img
            alt="Priority Premium Collection"
            className="w-full h-full object-cover"
            src={HERO_SLIDES[current].src}
            loading="eager"
          />
          <div className="absolute inset-x-0 bottom-0 h-28 md:h-32 bg-gradient-to-t from-black/55 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <button onClick={prev} className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-30 w-14 h-14 border border-white/30 rounded-full items-center justify-center hover:bg-white hover:text-gray-900 backdrop-blur-sm transition-all duration-300 text-white group shadow-xl">
        <ChevronLeft size={26} className="group-hover:-translate-x-0.5 transition-transform" />
      </button>
      <button onClick={next} className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-30 w-14 h-14 border border-white/30 rounded-full items-center justify-center hover:bg-white hover:text-gray-900 backdrop-blur-sm transition-all duration-300 text-white group shadow-xl">
        <ChevronRight size={26} className="group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Mobile dots */}
      <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        {HERO_SLIDES.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-white' : 'w-1.5 bg-white/40'}`} />
        ))}
      </div>

      {/* Desktop slide counter + progress bar (Keeping same as previous) */}
      <div className="hidden md:flex absolute bottom-6 inset-x-0 z-30 items-center justify-end px-8 gap-4">
        <span className="text-[11px] font-bold tabular-nums tracking-widest text-white/40">{String(current + 1).padStart(2, '0')}</span>
        <div className="w-32 h-[1.5px] bg-white/20 relative overflow-hidden rounded-full">
          <motion.div key={current} className="absolute inset-y-0 left-0 bg-white rounded-full" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 5, ease: 'linear' }} />
        </div>
        <span className="text-[11px] font-bold tabular-nums tracking-widest text-white/40">{String(HERO_SLIDES.length).padStart(2, '0')}</span>
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
    <div className="flex flex-col bg-white">
      {/* Large image, minimal padding so bag fills the card */}
      <Link
        to={`/product/${product.slug || product.id}`}
        className="block overflow-hidden"
        style={{ aspectRatio: '379 / 411' }}
      >
        <LazyImage
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain p-3"
          width={400}
        />
      </Link>

      <div className="pt-2 space-y-1">
        <Link to={`/product/${product.slug || product.id}`}>
          <h3 className="font-outfit font-bold text-[15px] text-black leading-snug line-clamp-2 hover:text-[#755FF1] transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-outfit font-semibold text-[16px] text-[#755FF1]">
            ₹ {product.price.toLocaleString('en-IN')}.00
          </span>
          {discount > 0 && (
            <>
              <span className="font-outfit text-[14px] text-[#A0A0A0] line-through">
                ₹ {originalPrice.toLocaleString('en-IN')}.00
              </span>
              <span className="font-outfit font-semibold text-[13px] text-black">
                {discount}% off
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const Home = () => {
  const [activeTab, setActiveTab] = useState<string>('college-backpacks');
  const [tabProducts, setTabProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const tabCategory = CATEGORIES.find((c) => c.slug === activeTab);

  // Category flip-card state
  const [catFlipIndex, setCatFlipIndex] = useState(0);
  const [catFlipDir, setCatFlipDir] = useState(1);
  const catTouchRef = useRef<number | null>(null);

  const goNextCat = (total: number) => {
    if (catFlipIndex < total - 1) { setCatFlipDir(1); setCatFlipIndex(i => i + 1); }
  };
  const goPrevCat = () => {
    if (catFlipIndex > 0) { setCatFlipDir(-1); setCatFlipIndex(i => i - 1); }
  };
  const handleCatTouchStart = (e: React.TouchEvent) => { catTouchRef.current = e.touches[0].clientX; };
  const handleCatTouchEnd = (e: React.TouchEvent, total: number) => {
    if (catTouchRef.current === null) return;
    const diff = catTouchRef.current - e.changedTouches[0].clientX;
    if (diff > 40) goNextCat(total);
    else if (diff < -40) goPrevCat();
    catTouchRef.current = null;
  };

  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  const bestSellersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getProducts({ category: activeTab }).then(res => {
      setTabProducts(res.products as unknown as Product[]);
    }).catch(() => { });
  }, [activeTab]);

  useEffect(() => {
    api.getProducts({ sort: 'popular', limit: '8' }).then(res => {
      setBestSellers(res.products as unknown as Product[]);
    }).catch(() => { });
  }, []);


  return (
    <main className="font-outfit">
      <SEO
        title="Priority Bags — Premium Backpacks, Luggage & Travel Accessories"
        description="Shop Priority Bags for premium backpacks, travel luggage, and accessories. Free shipping across India. Trusted by thousands of travellers."
        url="https://prioritybags.in"
      />
      <h1 className="sr-only">Priority Bags — Quality Backpacks & Premium Luggage Online</h1>
      <HeroSlider />

      {/* Categories — Mobile: Book-page flip stack */}
      <section className="md:hidden py-8 px-4 text-center">
        <h2 className="text-[12px] font-black uppercase tracking-[0.35em] text-gray-400 mb-6">Shop By Category</h2>
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
                      className="absolute inset-x-0 bottom-0 rounded-2xl overflow-hidden pointer-events-none"
                      style={{
                        top: `${offset * 8}px`,
                        transform: `scale(${1 - offset * 0.05}) translateY(${offset * 4}px)`,
                        filter: `brightness(${0.55 - offset * 0.1})`,
                        zIndex: 10 - offset,
                        transformOrigin: 'bottom center',
                      }}
                    >
                      <div className="relative w-full" style={{ paddingBottom: '140%' }}>
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
                <div style={{ position: 'relative', zIndex: 20 }}>
                  <AnimatePresence mode="wait" custom={catFlipDir}>
                    <motion.div
                      key={catFlipIndex}
                      custom={catFlipDir}
                      initial={{ x: catFlipDir * 150, opacity: 0, scale: 0.95 }}
                      animate={{ x: 0, opacity: 1, scale: 1 }}
                      exit={{ x: catFlipDir * -150, opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      className="w-full rounded-2xl overflow-hidden shadow-xl"
                    >
                      <Link to={CATS[catFlipIndex].to} className="block w-full relative" style={{ paddingBottom: '140%' }}>
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
                  <button onClick={goPrevCat} disabled={catFlipIndex === 0} className="p-2 text-gray-400 disabled:opacity-30 transition-opacity">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex gap-2">
                    {CATS.map((_, i) => (
                      <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === catFlipIndex ? 'w-6 bg-[#8750DA]' : 'w-1.5 bg-gray-200'}`} />
                    ))}
                  </div>
                  <button onClick={() => goNextCat(total)} disabled={catFlipIndex === total - 1} className="p-2 text-gray-400 disabled:opacity-30 transition-opacity">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      <section className="hidden md:block container mx-auto px-6 lg:px-8 pt-12 pb-10 lg:pt-16 lg:pb-16">
        <div className="grid grid-cols-3 gap-6 lg:gap-10">
          {CATS.map((cat) => (
            <Link key={cat.label} to={cat.to} className="group relative h-[380px] lg:h-[560px] rounded-[5px] overflow-hidden transition-all duration-700 hover:-translate-y-3 shadow-2xl bg-gray-100">
              <LazyImage src={cat.img} alt={cat.label} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" width={600} />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-700" />
              <div className="absolute bottom-10 right-10 w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-2xl translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <ArrowRight size={24} className="text-gray-900" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Editorial Banner (Keeping same as previous per customer screenshot) */}
      <section className="relative bg-banner-blue">
        {/* Mobile version */}
        <div className="md:hidden relative w-full overflow-hidden">
          <img src={IMG.banner} alt="New Arrival" className="w-full h-auto object-cover block" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 pb-8">
            <h2 className="text-[14px] font-black uppercase tracking-[0.4em] text-white mb-2">New Arrival</h2>
            <p className="text-[16px] font-outfit font-medium uppercase tracking-[0.2em] text-white/80 mb-6 select-none">Ready For Your Journey</p>
            <div className="flex gap-6">
              <Link to="/women" className="text-[12px] font-bold uppercase tracking-widest border-b-2 border-white text-white pb-1">Shop Women</Link>
              <Link to="/men" className="text-[12px] font-bold uppercase tracking-widest border-b-2 border-white text-white pb-1">Shop Men</Link>
            </div>
          </div>
        </div>

        {/* Desktop version - Exactly as shown in screenshot */}
        <div className="hidden md:block text-white relative py-12">
          <div className="container mx-auto px-8 relative z-10 flex flex-row items-center gap-16">
            <div className="w-1/2 relative z-30 rounded-[3rem] overflow-hidden shadow-2xl -mt-20 -mb-20">
              <img src={IMG.banner} alt="Style" className="w-full h-auto object-cover" />
            </div>
            <div className="w-1/2 text-left">
              <h2 className="text-7xl font-black uppercase tracking-[0.12em] text-white mb-6">New Arrival</h2>
              <p className="text-[16px] font-outfit font-normal uppercase tracking-[0.2em] text-white/50 select-none pointer-events-none mb-10">Ready For Your Journey</p>
              <div className="flex gap-8">
                <Link to="/women" className="text-xs font-bold uppercase tracking-widest border-b-2 border-white pb-1 hover:opacity-70 transition-all">Shop Women</Link>
                <Link to="/men" className="text-xs font-bold uppercase tracking-widest border-b-2 border-white pb-1 hover:opacity-70 transition-all">Shop Men</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Tabs Section */}
      <section className="pt-10 md:pt-24 pb-12 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex overflow-x-auto no-scrollbar gap-4 md:gap-8 md:justify-center mb-6 md:mb-16 border-b border-gray-100 pb-1">
            {BACKPACK_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 md:pb-4 text-[16px] font-semibold uppercase tracking-[0.15em] transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-[#14052b]' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#8750DA] rounded-full" />}
              </button>
            ))}
          </div>

          <div className="flex items-start gap-6 lg:gap-8">
            {tabCategory && (
              <div className="hidden md:block md:w-[220px] lg:w-[379px] shrink-0 md:h-[440px] lg:h-[506px] overflow-hidden relative group rounded-none">
                <div className="w-full h-[80px] lg:h-[95px] bg-[#F8BE57] z-20 flex flex-col items-center justify-center text-white font-outfit overflow-hidden">
                  <p className="font-semibold uppercase tracking-tight leading-[0.8] text-center w-full" style={{ fontSize: 'clamp(18px, 2.5vw, 32.4px)' }}>
                    Trendy {BACKPACK_TABS.find(t => t.id === activeTab)?.label.split(' ').slice(0, -1).join(' ')}
                  </p>
                  <p className="font-bold uppercase tracking-tight leading-[0.8] text-center w-full translate-x-[20px] lg:translate-x-[32px]" style={{ fontSize: 'clamp(26px, 3.5vw, 47.4px)' }}>
                    {BACKPACK_TABS.find(t => t.id === activeTab)?.label.split(' ').slice(-1)[0]}S
                  </p>
                </div>
                <div className="w-full flex-1 overflow-hidden relative" style={{ height: 'calc(100% - 80px)' }}>
                  <LazyImage
                    src={BACKPACK_TABS.find(t => t.id === activeTab)?.image || IMG.refPoster}
                    alt={activeTab}
                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                    width={500}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
                {tabProducts.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="pb-16 pt-10 md:pt-20 bg-white border-t border-gray-100">
        <div className="max-w-[1440px] mx-auto px-4 md:px-14">
          <div className="text-center mb-12">
            <h2 className="font-outfit font-semibold text-[16px] text-[#030014] tracking-[0.1em] uppercase">Shop Best Sellers</h2>
          </div>
          <div className="relative group">
            <button onClick={() => bestSellersRef.current?.scrollBy({ left: -400, behavior: 'smooth' })} className="absolute left-[-15px] md:left-[-40px] top-1/2 -translate-y-1/2 w-8 h-12 md:w-10 md:h-16 bg-[#F3F3F3] hover:bg-gray-200 flex items-center justify-center transition-colors z-30 rounded-r-lg">
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            <button onClick={() => bestSellersRef.current?.scrollBy({ left: 400, behavior: 'smooth' })} className="absolute right-[-15px] md:right-[-40px] top-1/2 -translate-y-1/2 w-8 h-12 md:w-10 md:h-16 bg-[#F3F3F3] hover:bg-gray-200 flex items-center justify-center transition-colors z-30 rounded-l-lg">
              <ChevronRight size={20} className="text-gray-600" />
            </button>
            <div ref={bestSellersRef} className="flex gap-4 sm:gap-6 md:gap-10 overflow-x-auto no-scrollbar pb-10 px-1 sm:px-4">
              {bestSellers.map(p => (
                <div key={p.id} className="w-[200px] sm:w-[230px] md:w-[260px] lg:w-[290px] shrink-0">
                  <BestSellerCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Shop With Us */}
      <section className="pt-12 pb-10 md:pt-20 md:pb-32 bg-[#F9F9F9] border-t border-gray-100 font-outfit">
        <div className="container mx-auto px-5 md:px-8">
          <div className="flex flex-col items-center mb-8 md:mb-20">
            <p className="text-[16px] font-semibold text-[#14052b] uppercase tracking-[0.2em] font-outfit">Why Shop With Us</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-16">
            {[
              { Icon: Truck, label: 'Fast Delivery', desc: 'Secure shipping across India' },
              { Icon: CreditCard, label: 'Safe Payment', desc: 'UPI and Card ready' },
              { Icon: ShieldCheck, label: 'Brand Promise', desc: 'Certified priority items' },
              { Icon: PackageCheck, label: 'Quality Unit', desc: '8-stage strength testing' }
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-3 md:gap-4">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-100 text-[#8750DA]">
                  <f.Icon size={26} strokeWidth={1.5} />
                </div>
                <h3 className="text-[16px] font-semibold uppercase tracking-[0.12em] font-outfit">{f.label}</h3>
                <p className="text-[14px] font-medium text-gray-400 leading-snug font-outfit">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};
