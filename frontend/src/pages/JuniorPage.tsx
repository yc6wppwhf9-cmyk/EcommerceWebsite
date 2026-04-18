import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

const AGE_GROUPS = [
  { label: 'Below 3 Years', slug: 'school-backpacks', img: '/junior/Rectangle 28.png', color: '#FFBB5A' },
  { label: '3 to 5 Years', slug: 'school-backpacks', img: '/junior/Rectangle 29.png', color: '#A368FB' },
  { label: '6 to 10 Years', slug: 'school-backpacks', img: "/junior/Speedo_ Hero 1.png", color: '#FFBB5A' },
  { label: '11 Years & Above', slug: 'college-backpacks', img: "/junior/Beautiful_ Hero 1.png", color: '#FFBB5A' },
];

const CATEGORIES = [
  { label: 'School Backpacks', filter: 'school-backpacks', image: '/junior/Drift Sky Blue_ Hero 1.png' },
  { label: 'Combo Set', filter: 'combo-set', image: '/junior/Rectangle 28.png' },
  { label: 'Pouches', filter: 'pouches', image: '/junior/Rectangle 29.png' },
  { label: 'Lunch Bags', filter: 'lunch-bags', image: '/junior/Beautiful_ Hero 1.png' },
  { label: 'Trolley Backpacks', filter: 'trolley-backpacks', image: '/junior/Speedo_ Hero 1.png' },
];

// Standard card for Junior Showcase
const JuniorProductCard = ({ product }: { product: Product }) => {
  const { addItem } = useCart();
  const originalPrice = (product as any).original_price ?? (product as any).originalPrice ?? product.price;
  const discount = originalPrice > product.price
    ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  return (
    <div className="flex flex-col font-outfit bg-white">
      {/* Image container with blue border */}
      <Link
        to={`/product/${product.slug || product.id}?theme=junior`}
        className="relative block rounded-2xl border-2 border-[#5B8DEF] overflow-hidden bg-white"
        style={{ aspectRatio: '300 / 307' }}
      >
        <div className="w-full h-full flex items-center justify-center p-4">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-500 hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        </div>
        {/* Orange NEW badge */}
        {product.isNew && (
          <span className="absolute top-2.5 right-2.5 bg-[#FFB347] text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm">
            NEW
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="pt-3 space-y-1.5">
        <Link to={`/product/${product.slug || product.id}?theme=junior`}>
          <h3 className="text-[16px] font-bold text-[#000000] leading-snug line-clamp-2 hover:text-[#755FF1] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Stars using Star 1.png */}
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <img key={i} src="/junior/Star 1.png" alt="★" className="h-3.5 w-3.5" />
            ))}
          </div>
          <span className="text-[11px] text-gray-400 font-medium">
            {(product as any).reviews ?? 10} reviews
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-[16px] font-semibold text-[#755FF1]">
            ₹ {product.price.toLocaleString('en-IN')}.00
          </span>
          {discount > 0 && (
            <>
              <span className="text-[14px] text-gray-400 line-through">
                ₹ {originalPrice.toLocaleString('en-IN')}.00
              </span>
              <span className="text-[13px] font-semibold text-black">
                {discount}% off
              </span>
            </>
          )}
        </div>

        {/* Move to Cart */}
        <button
          onClick={handleAddToCart}
          className="w-full py-2.5 bg-[#755FF1] hover:bg-[#6147d3] text-white text-[11px] font-bold uppercase tracking-[0.15em] transition-colors rounded-md mt-1"
        >
          + MOVE TO CART
        </button>
      </div>
    </div>
  );
};

// Simplified Best Seller card matching user image precisely
const BestSellerCard = ({ product }: { product: Product }) => (
  <div className="flex flex-col h-full bg-white transition-all duration-300 relative group">
    <Link to={`/product/${product.slug || product.id}?theme=junior`} className="aspect-square bg-[#F9F9F9] rounded-sm overflow-hidden flex items-center justify-center p-8 mb-4">
      <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
    </Link>
    <div className="px-1">
      <Link to={`/product/${product.id}?theme=junior`}>
        <h3 className="font-outfit font-bold text-[14px] text-black leading-snug mb-2 line-clamp-2">{product.name}</h3>
      </Link>
      <div className="flex items-baseline gap-2">
        <span className="text-[14px] font-outfit font-bold text-[#8750DA]">₹ {product.price}.00</span>
        <span className="text-[11px] text-gray-400 line-through">₹ {Math.round(product.price * 1.5)}.00</span>
        <span className="text-[11px] font-bold text-black opacity-80">50% off</span>
      </div>
    </div>
  </div>
);

export const JuniorPage = () => {
  const [activeTab, setActiveTab] = useState('School Backpacks');
  const [products, setProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Age group flip-card state
  const [ageFlipIndex, setAgeFlipIndex] = useState(0);
  const [ageFlipDir, setAgeFlipDir] = useState(1);
  const ageTouchRef = useRef<number | null>(null);

  const goNextAge = (total: number) => {
    if (ageFlipIndex < total - 1) { setAgeFlipDir(1); setAgeFlipIndex(i => i + 1); }
  };
  const goPrevAge = () => {
    if (ageFlipIndex > 0) { setAgeFlipDir(-1); setAgeFlipIndex(i => i - 1); }
  };
  const handleAgeTouchStart = (e: React.TouchEvent) => { ageTouchRef.current = e.touches[0].clientX; };
  const handleAgeTouchEnd = (e: React.TouchEvent, total: number) => {
    if (ageTouchRef.current === null) return;
    const diff = ageTouchRef.current - e.changedTouches[0].clientX;
    if (diff > 40) goNextAge(total);
    else if (diff < -40) goPrevAge();
    ageTouchRef.current = null;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.classList.remove('dark');
    const juniorCategories = ['school-backpacks', 'combo-set', 'pouches', 'lunch-bags', 'trolley-backpacks'];
    Promise.all([
      api.getProducts({ category: 'school-backpacks', limit: '8' }),
      ...juniorCategories.map(cat => api.getProducts({ category: cat, sort: 'popular', limit: '8' })),
    ]).then(([school, ...popularResults]) => {
      setProducts(school.products as unknown as Product[]);
      const seen = new Set<string>();
      const merged: Product[] = [];
      for (const res of popularResults) {
        for (const p of res.products as unknown as Product[]) {
          if (!seen.has(p.id)) { seen.add(p.id); merged.push(p); }
        }
      }
      setBestSellers(merged);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  return (
    <main className="bg-white min-h-screen overflow-x-hidden">

      {/* ═══════════════════════════════════════════════
          RESPONSIVE HERO — scales with image's natural aspect ratio
      ═══════════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden">
        <img
          src="/junior/junior hero.png"
          alt="Junior Collection Preview"
          className="w-full h-auto object-contain block"
        />
      </section>

      <section className="py-12 md:py-16 bg-white relative overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-6 md:px-14 relative z-10">
          <div className="flex items-center justify-center gap-3 mb-10">
            <img src="/junior/flower.png" alt="" aria-hidden className="w-4 h-4 select-none" />
            <h2 className="font-protest" style={{ fontSize: 'clamp(22px, 5vw, 36px)', color: '#A368FB', lineHeight: '125.7%' }}>Shop By Age</h2>
            <img src="/junior/flower.png" alt="" aria-hidden className="w-4 h-4 select-none" />
          </div>

          {/* Desktop: 4-column grid */}
          <div className="hidden md:grid md:grid-cols-4 gap-8 lg:gap-10">
            {AGE_GROUPS.map((group, i) => (
              <motion.div key={group.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Link to={`/${group.slug}`} className="group relative block rounded-2xl shadow-sm hover:shadow-xl transition-all duration-400 hover:-translate-y-2 !overflow-visible" style={{ aspectRatio: '1/1.4' }}>
                  <div className="absolute inset-0 rounded-2xl overflow-hidden"><img src={group.img} alt={group.label} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" /></div>
                  <div className="absolute bottom-0 inset-x-0 flex items-center justify-center z-20 transition-colors duration-300 bg-[#FFBB5A] group-hover:bg-[#A368FB] h-[52px] rounded-tl-[40px]">
                    <p className="relative z-10 text-[14px] font-outfit font-black uppercase tracking-widest text-white drop-shadow-sm text-center px-1">{group.label}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Mobile: Book-page flip stack */}
          <div className="md:hidden px-2">
            {(() => {
              const total = AGE_GROUPS.length;
              return (
                <div
                  className="relative select-none max-w-sm mx-auto"
                  style={{ perspective: '1200px' }}
                  onTouchStart={handleAgeTouchStart}
                  onTouchEnd={(e) => handleAgeTouchEnd(e, total)}
                >
                  {/* Stacked cards behind (depth effect) */}
                  {[2, 1].map((offset) => {
                    const idx = ageFlipIndex + offset;
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
                            src={AGE_GROUPS[idx]?.img || ''}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover object-top"
                          />
                        </div>
                      </div>
                    );
                  })}

                  {/* Active card */}
                  <div style={{ position: 'relative', zIndex: 20 }}>
                    <AnimatePresence mode="wait" custom={ageFlipDir}>
                      <motion.div
                        key={ageFlipIndex}
                        custom={ageFlipDir}
                        initial={{ x: ageFlipDir * 150, opacity: 0, scale: 0.95 }}
                        animate={{ x: 0, opacity: 1, scale: 1 }}
                        exit={{ x: ageFlipDir * -150, opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        className="w-full rounded-2xl overflow-hidden shadow-xl"
                      >
                        <Link to={`/${AGE_GROUPS[ageFlipIndex].slug}`} className="block w-full relative" style={{ paddingBottom: '140%' }}>
                          <img
                            src={AGE_GROUPS[ageFlipIndex].img}
                            alt={AGE_GROUPS[ageFlipIndex].label}
                            className="absolute inset-0 w-full h-full object-cover object-top"
                          />
                          <div className="absolute bottom-0 inset-x-0 flex items-center justify-center z-20 bg-[#FFBB5A] h-[52px] rounded-tl-[24px]">
                            <p className="text-[16px] font-outfit font-black uppercase tracking-widest text-white drop-shadow-sm text-center px-2">{AGE_GROUPS[ageFlipIndex].label}</p>
                          </div>
                        </Link>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Navigation controls */}
                  <div className="flex justify-between items-center mt-6 px-1">
                    <button onClick={goPrevAge} disabled={ageFlipIndex === 0} className="p-2 text-gray-400 disabled:opacity-30 transition-opacity">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex gap-2">
                      {AGE_GROUPS.map((_, i) => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === ageFlipIndex ? 'w-6 bg-[#A368FB]' : 'w-1.5 bg-gray-200'}`} />
                      ))}
                    </div>
                    <button onClick={() => goNextAge(total)} disabled={ageFlipIndex === total - 1} className="p-2 text-gray-400 disabled:opacity-30 transition-opacity">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      <section className="relative mt-16 md:mt-24 mb-6 overflow-visible px-4 md:px-0 flex justify-center">
        <div className="relative w-full max-w-[1402px] rounded-[5px] py-8 md:py-14 flex flex-col items-center justify-center text-center overflow-visible shadow-sm" style={{ backgroundColor: '#8750DA', minHeight: 'clamp(260px, 45vw, 500px)' }}>

          <div className="absolute left-2 md:left-24 top-1/2 -translate-y-1/2 w-[120px] sm:w-[180px] md:w-[380px] aspect-square opacity-100 pointer-events-none" style={{ backgroundImage: "url('/junior/Group 36.png')", backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'left center' }} />
          <div className="absolute right-2 md:right-24 top-1/2 -translate-y-1/2 w-[120px] sm:w-[180px] md:w-[380px] aspect-square opacity-100 pointer-events-none" style={{ backgroundImage: "url('/junior/Group 36.png')", backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center' }} />

          <div className="relative w-full flex flex-col items-center justify-center px-6 mt-[-70px] sm:mt-[-100px] md:mt-[-120px] mb-4 overflow-visible">
            <div className="relative w-[220px] sm:w-[340px] md:w-[463px] md:h-[423px] overflow-visible">
              <img src="/junior/Layer 1.png" alt="" aria-hidden className="w-full h-full object-contain pointer-events-none select-none drop-shadow-2xl" />
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-2 md:pt-6">
                <span className="font-outfit uppercase tracking-[0.2em] mb-1 md:mb-2" style={{ fontSize: 'clamp(14px, 4vw, 28.36px)', fontWeight: 400, color: '#966512' }}>New Arrival</span>
                <h2 className="font-protest tracking-tight max-w-[433px] mx-auto" style={{ fontSize: 'clamp(20px, 6.5vw, 50.82px)', color: '#3E92E6', lineHeight: '104.7%' }}>Made for Little Adventures</h2>
              </div>
            </div>
          </div>
          <div className="flex gap-8 md:gap-32 mt-4 md:mt-6 relative z-10">
            <Link to="/school-backpacks" className="text-white font-outfit font-semibold uppercase tracking-[0.1em] border-b-2 border-white/60 pb-1.5 hover:border-white transition-colors" style={{ fontSize: 'clamp(12px, 3vw, 16px)' }}>Dreamy Styles</Link>
            <Link to="/school-backpacks" className="text-white font-outfit font-semibold uppercase tracking-[0.1em] border-b-2 border-white/60 pb-1.5 hover:border-white transition-colors" style={{ fontSize: 'clamp(12px, 3vw, 16px)' }}>Power Styles</Link>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-white overflow-hidden">
        <div className="max-w-[1402px] mx-auto px-6 md:px-14">
          <div className="flex flex-wrap items-center justify-center gap-x-8 md:gap-x-12 gap-y-4 mb-6 relative">
            {CATEGORIES.map((cat) => (
              <button key={cat.label} onClick={() => setActiveTab(cat.label)} className={`relative pb-3 text-[11px] md:text-[13px] font-outfit font-black uppercase tracking-[0.1em] transition-all duration-300 ${activeTab === cat.label ? 'scale-105' : 'hover:text-gray-600'}`} style={{ color: activeTab === cat.label ? '#030014' : '#AEADB4' }}>
                {cat.label}
                {activeTab === cat.label && <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FDB913] rounded-full" />}
              </button>
            ))}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gray-100 -z-10" />
          </div>
          <div className="flex flex-col lg:flex-row gap-8 md:gap-14">
            <div className="relative shrink-0 flex flex-col items-center justify-center lg:justify-start">
              <div className="relative flex flex-col items-center pt-6 md:pt-8 w-full max-w-[260px] sm:max-w-[334px] mx-auto lg:mx-0" style={{ backgroundColor: '#FAC05C', borderRadius: '5px', minHeight: '360px' }}>
                <div className="overflow-hidden mb-4 w-[85%] max-w-[285px]" style={{ height: 'clamp(260px, 55vw, 400px)', borderRadius: '5px' }}>
                  <img 
                    src={CATEGORIES.find(c => c.label === activeTab)?.image || "/junior/Drift Sky Blue_ Hero 1.png"} 
                    alt={activeTab} 
                    className="w-full h-full object-cover object-top transition-all duration-500" 
                  />
                </div>
                <h3 className="font-protest text-white leading-none text-center pb-5" style={{ fontSize: 'clamp(24px, 5vw, 39.88px)' }}>{activeTab}</h3>
              </div>
            </div>
            <div className="flex-1">
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                  {[1, 2, 3].map(n => <div key={n} className="aspect-[4/5] bg-gray-50 animate-pulse rounded-3xl" />)}
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                  {products.map((product, idx) => (
                    <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }}><JuniorProductCard product={product} /></motion.div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-20 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-100"><p className="text-gray-400 font-outfit font-black uppercase tracking-widest">Coming Soon</p></div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          EXACT BEST SELLERS SECTION
      ═══════════════════════════════════════════════ */}
      <section className="py-20 bg-white relative">
        <div className="max-w-[1402px] mx-auto px-6 md:px-14">

          <div className="text-center mb-12">
            {/* FIGMA TYPOGRAPHY: Outfit SemiBold 16px #030014 */}
            <h2
              className="font-outfit font-semibold uppercase tracking-[0.1em]"
              style={{ fontSize: '16px', color: '#030014' }}
            >
              Shop Best Sellers
            </h2>
          </div>

          <div className="relative group">
            <button className="absolute left-[-20px] md:left-[-40px] top-1/2 -translate-y-1/2 w-8 h-12 md:w-10 md:h-16 bg-[#F3F3F3] hover:bg-gray-200 flex items-center justify-center transition-colors z-30 rounded-r-lg">
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            <button className="absolute right-[-20px] md:right-[-40px] top-1/2 -translate-y-1/2 w-8 h-12 md:w-10 md:h-16 bg-[#F3F3F3] hover:bg-gray-200 flex items-center justify-center transition-colors z-30 rounded-l-lg">
              <ChevronRight size={20} className="text-gray-600" />
            </button>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
              {isLoading ? (
                [1, 2, 3, 4].map(n => <div key={n} className="aspect-square bg-gray-50 animate-pulse" />)
              ) : bestSellers.slice(0, 4).map((product) => (
                <BestSellerCard key={product.id} product={product} />
              ))}
            </div>
          </div>

        </div>
      </section>

    </main>
  );
};
