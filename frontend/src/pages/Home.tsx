import { useState, useRef, useEffect } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, ArrowRight, Truck, CreditCard, ShieldCheck, PackageCheck } from 'lucide-react';
import { CATEGORIES } from '../constants/products';
import { api } from '../lib/api';
import type { Product } from '../types';
import { AnimatePresence, motion } from 'motion/react';

const BACKPACK_TABS = [
  { id: 'college-backpacks', label: 'College Backpack' },
  { id: 'school-backpacks', label: 'School Backpack' },
  { id: 'laptop-backpacks', label: 'Laptop Backpack' },
  { id: 'trekking-backpacks', label: 'Trekking Backpack' },
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

// ─── Hero Slider (isolated component so slide changes don't re-render the whole page) ───
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
      className="relative w-full bg-black overflow-hidden aspect-[16/9]"
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
            className="w-full h-full object-contain md:object-cover"
            src={HERO_SLIDES[current].src}
            loading="eager"
          />
          <div className="absolute inset-x-0 bottom-0 h-28 md:h-32 bg-gradient-to-t from-black/55 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Desktop arrows */}
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

      {/* Desktop slide counter + progress bar */}
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

export const Home = () => {
  const [activeTab, setActiveTab] = useState<string>('college-backpacks');
  const [tabProducts, setTabProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const tabCategory = CATEGORIES.find((c) => c.slug === activeTab);

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const bestSellersRef = useRef<HTMLDivElement>(null);

  const scrollRight = () => scrollRef.current?.scrollBy({ left: 320, behavior: 'smooth' });
  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -320, behavior: 'smooth' });

  return (
    <main className="font-outfit">
      <h1 className="sr-only">Priority Bags — Quality Backpacks & Premium Luggage Online</h1>
      <HeroSlider />

      {/* Mobile Categories — 3-column grid, all visible at once */}
      <section className="md:hidden py-5 px-4">
        <h2 className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400 mb-3 text-center">Shop By Category</h2>
        <div className="grid grid-cols-3 gap-2.5">
          {CATS.map((cat) => (
            <Link key={cat.label} to={cat.to} className="group relative rounded-2xl overflow-hidden shadow-md bg-gray-100" style={{ aspectRatio: '3/4' }}>
              <img src={cat.img} alt={cat.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-active:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-2.5">
                <span className="block text-white text-[9px] font-black uppercase tracking-widest leading-none">{cat.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Desktop Categories — 3-column grid */}
      <section className="hidden md:block container mx-auto px-6 lg:px-8 pt-24 pb-40">
        <div className="grid grid-cols-3 gap-10">
          {CATS.map((cat) => (
            <Link
              key={cat.label}
              to={cat.to}
              className="group relative h-[560px] rounded-[3rem] overflow-hidden transition-all duration-700 hover:-translate-y-3 shadow-2xl bg-gray-100"
            >
              <img src={cat.img} alt={cat.label} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-700" />
              <div className="absolute bottom-10 right-10 w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-2xl translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <ArrowRight size={24} className="text-gray-900" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Editorial Banner — mobile: full-bleed image with overlay | desktop: side-by-side */}
      {/* Mobile version */}
      <div className="md:hidden mt-12 relative overflow-hidden bg-banner-blue" style={{ aspectRatio: '4/5' }}>
        <img src={IMG.banner} alt="New Arrival" className="absolute inset-0 w-full h-full object-contain object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 pb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/60 mb-2">New Arrival</p>
          <p 
            className="font-outfit font-normal uppercase tracking-[0.2em] text-white/50 mb-6 select-none"
            style={{ fontSize: '16px' }}
          >
            Ready For Your Journey
          </p>
          <div className="flex gap-5">
            <Link to="/women" className="text-[11px] font-bold uppercase tracking-widest border-b-2 border-white text-white pb-1">Shop Women</Link>
            <Link to="/men" className="text-[11px] font-bold uppercase tracking-widest border-b-2 border-white text-white pb-1">Shop Men</Link>
          </div>
        </div>
      </div>

      {/* Desktop version */}
      <section className="hidden md:block bg-banner-blue text-white relative" style={{ overflow: 'visible', zIndex: 1 }}>
        <div className="container mx-auto px-8 relative z-10">
          <div className="flex flex-row items-center gap-16">
            <div className="w-1/2 relative z-30 rounded-[3rem] overflow-hidden shadow-2xl -mt-20 -mb-20">
              <img src={IMG.banner} alt="Style" className="w-full h-auto object-cover" />
            </div>
            <div className="w-1/2 text-left py-20">
              <p 
                className="font-outfit font-normal uppercase tracking-[0.2em] text-white/50 select-none pointer-events-none"
                style={{ fontSize: '16px' }}
              >
                Ready For Your Journey
              </p>
              <div className="flex gap-6 mt-10">
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
          <h2 className="md:hidden text-base font-black uppercase tracking-[0.2em] text-[#14052b] mb-5 px-1">Browse Backpacks</h2>
          <div className="flex overflow-x-auto no-scrollbar gap-4 md:gap-8 md:justify-center md:flex-wrap mb-6 md:mb-16 border-b border-gray-100 pb-1">
            {BACKPACK_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 md:pb-4 text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.15em] md:tracking-[0.3em] transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-priority-blue' : 'text-gray-300 hover:text-gray-500'}`}
              >
                {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-priority-blue rounded-full" />}
              </button>
            ))}
          </div>

          {/* Layout: poster on desktop only, full-width product scroll on mobile */}
          <div className="flex items-start gap-8">
            {/* Poster — desktop only */}
            {tabCategory && (
              <div className="hidden lg:block w-[420px] shrink-0 h-[520px] rounded-[3rem] overflow-hidden relative group" style={{ backgroundColor: tabCategory.bgColor }}>
                <div className="absolute inset-0 p-10 z-10 flex flex-col justify-end">
                  <h3 className="text-4xl font-semibold text-white uppercase tracking-tighter leading-none mb-4">{tabCategory.subtitle}</h3>
                </div>
                <img src={IMG.refPoster} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            )}

            {/* Product scroll — full width on mobile, flex-1 on desktop */}
            <div className="flex-1 relative min-w-0 w-full">
              {/* Desktop arrow buttons */}
              <div className="absolute top-1/2 -translate-y-1/2 w-full hidden lg:flex justify-between pointer-events-none z-10">
                <button onClick={scrollLeft} className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-gray-900 hover:bg-gray-50 border border-gray-200 shadow-xl pointer-events-auto transition-all -translate-x-6 active:scale-95 hover:-translate-x-8">
                  <ChevronLeft size={24} />
                </button>
                <button onClick={scrollRight} className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-gray-900 hover:bg-gray-50 border border-gray-200 shadow-xl pointer-events-auto transition-all translate-x-6 active:scale-95 hover:translate-x-8">
                  <ChevronRight size={24} />
                </button>
              </div>
              <div
                ref={scrollRef}
                className="flex gap-3 sm:gap-4 lg:gap-6 overflow-x-auto no-scrollbar snap-x snap-proximity pb-6 px-1"
                style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}
              >
                {tabProducts.map(p => (
                  <div key={p.id} className="min-w-[47vw] sm:min-w-[220px] md:min-w-[240px] lg:min-w-[280px] snap-start shrink-0">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="pb-8 pt-10 md:pt-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-end justify-between mb-6 md:mb-14">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-1">Most Loved</p>
              <h2 className="text-lg md:text-3xl font-black uppercase tracking-[0.15em] text-[#14052b]">Shop Best Sellers</h2>
            </div>
            <Link to="/backpacks" className="hidden md:flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
              View All <ArrowRight size={13} />
            </Link>
          </div>

          <div className="relative group/carousel">
            <div className="absolute top-1/2 -translate-y-1/2 w-full hidden md:flex justify-between pointer-events-none z-10">
              <button
                onClick={() => bestSellersRef.current?.scrollBy({ left: -400, behavior: 'smooth' })}
                className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-gray-900 hover:bg-gray-50 border border-gray-200 shadow-xl pointer-events-auto transition-all -translate-x-6 active:scale-95 hover:-translate-x-8"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => bestSellersRef.current?.scrollBy({ left: 400, behavior: 'smooth' })}
                className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-gray-900 hover:bg-gray-50 border border-gray-200 shadow-xl pointer-events-auto transition-all translate-x-6 active:scale-95 hover:translate-x-8"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            <div
              ref={bestSellersRef}
              className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto no-scrollbar pb-10 px-1 sm:px-4"
              style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}
            >
              {bestSellers.map((product) => (
                <div key={product.id} className="min-w-[47vw] sm:min-w-[240px] md:min-w-[280px] lg:min-w-[320px] shrink-0">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="pt-12 pb-10 md:pt-20 md:pb-32 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-5 md:px-8">
          <div className="flex flex-col items-center mb-8 md:mb-20">
            <p className="text-base md:text-3xl font-black text-[#14052b] uppercase tracking-[0.2em]">Why Shop With Us</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-16">
            {[
              { Icon: Truck, label: 'Fast Delivery', desc: 'Secure shipping across India' },
              { Icon: CreditCard, label: 'Safe Payment', desc: 'UPI and Card ready' },
              { Icon: ShieldCheck, label: 'Brand Promise', desc: 'Certified priority items' },
              { Icon: PackageCheck, label: 'Quality Unit', desc: '8-stage strength testing' }
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-3 md:gap-4">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-100 text-priority-blue">
                  <f.Icon size={26} strokeWidth={1.5} />
                </div>
                <h3 className="text-[11px] md:text-xs font-black uppercase tracking-[0.12em]">{f.label}</h3>
                <p className="text-[10px] md:text-[10px] font-semibold text-gray-400 leading-snug">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};
