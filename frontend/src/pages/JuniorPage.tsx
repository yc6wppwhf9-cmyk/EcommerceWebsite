import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight, PackageCheck } from 'lucide-react';

const AGE_GROUPS = [
  { label: 'Below 3 Years', slug: 'school-backpacks', img: '/junior/Rectangle 28.png', color: '#FFBB5A' },
  { label: '3 to 5 Years', slug: 'school-backpacks', img: '/junior/Rectangle 29.png', color: '#A368FB' },
  { label: '6 to 10 Years', slug: 'school-backpacks', img: "/junior/Speedo_ Hero 1.png", color: '#FFBB5A' },
  { label: '11 Years & Above', slug: 'school-backpacks', img: "/junior/Beautiful_ Hero 1.png", color: '#FFBB5A' },
];

const CATEGORIES = [
  { label: 'School Backpacks', filter: 'school-backpacks', image: '/junior/Drift Sky Blue_ Hero 1.png' },
  { label: 'Combo Set', filter: 'combo-set', image: '/junior/Rectangle 28.png' },
  { label: 'Pouches', filter: 'pouches', image: '/junior/Rectangle 29.png' },
  { label: 'Lunch Bags', filter: 'lunch-bags', image: '/junior/Beautiful_ Hero 1.png' },
  { label: 'Trolley Backpacks', filter: 'trolley-backpacks', image: '/junior/Speedo_ Hero 1.png' },
];

const AgeGroupCarousel = () => {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const touchRef = useRef<number | null>(null);
  const total = AGE_GROUPS.length;

  const goNext = () => { setDir(1); setIdx(i => (i + 1) % total); };
  const goPrev = () => { setDir(-1); setIdx(i => (i - 1 + total) % total); };

  return (
    <div className="md:hidden px-2 mb-0">
      <div
        className="relative select-none max-w-sm mx-auto"
        style={{ perspective: '1200px' }}
        onTouchStart={e => { touchRef.current = e.touches[0].clientX; }}
        onTouchEnd={e => {
          if (touchRef.current === null) return;
          const diff = touchRef.current - e.changedTouches[0].clientX;
          if (diff > 40) goNext(); else if (diff < -40) goPrev();
          touchRef.current = null;
        }}
      >
        {[2, 1].map(offset => {
          const stackIdx = (idx + offset) % total;
          return (
            <div key={`stack-${offset}`} className="absolute inset-y-0 rounded-2xl overflow-hidden pointer-events-none transition-all duration-500 shadow-sm"
              style={{ 
                left: `${offset * 12}px`, 
                right: `-${offset * 12}px`, 
                transform: `scale(${1 - offset * 0.06}) translateY(${offset * 4}px)`, 
                filter: `brightness(${0.6 - offset * 0.15}) grayscale(${offset * 0.2})`, 
                zIndex: 10 - offset, 
                transformOrigin: 'center right' 
              }}>
              <div className="relative w-full" style={{ paddingBottom: '140%' }}>
                <img src={AGE_GROUPS[stackIdx].img} alt="" className="absolute inset-0 w-full h-full object-cover object-top opacity-80" />
              </div>
            </div>
          );
        })}

        <div style={{ position: 'relative', zIndex: 20, overflow: 'hidden', borderRadius: '1rem' }}>
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={idx}
              custom={dir}
              variants={{
                enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%' }),
                center: { x: 0 },
                exit: (d: number) => ({ x: d > 0 ? '-100%' : '100%' }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full rounded-2xl overflow-hidden shadow-xl"
            >
              <Link to={`/${AGE_GROUPS[idx].slug}?theme=junior`} className="block w-full relative" style={{ paddingBottom: '140%' }}>
                <img src={AGE_GROUPS[idx].img} alt={AGE_GROUPS[idx].label} className="absolute inset-0 w-full h-full object-cover object-top" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
                  <span className="block text-white text-[20px] font-black uppercase tracking-widest leading-tight drop-shadow-lg">{AGE_GROUPS[idx].label}</span>
                </div>
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-center items-center mt-6 px-1">
          <div className="flex gap-2">
            {AGE_GROUPS.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? 'w-6 bg-[#F69245]' : 'w-1.5 bg-gray-200'}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Standard card for Junior Showcase
const JuniorProductCard = ({ product }: { product: Product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const originalPrice = (product as any).original_price ?? (product as any).originalPrice ?? product.price;
  const discount = originalPrice > product.price
    ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
    : 0;

  const secondaryImage = product.images?.[1] || product.image;
  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  const displayImage = !isTouchDevice && isHovered ? secondaryImage : product.image;

  const amazonUrl = (product as any).amazon_url;
  const handleBuyOnAmazon = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (amazonUrl) {
      api.trackAmazonClick(product.id);
      window.open(amazonUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Mobile-friendly tap to swap
  const handleTap = () => {
    if (isTouchDevice) {
      setIsHovered(!isHovered);
    }
  };

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleTap}
      className="flex h-full flex-col font-outfit junior-glass-card magnetic-shadow rounded-3xl overflow-hidden shadow-lg md:shadow-none cursor-pointer"
    >
      {/* Image container with blue border */}
      <Link
        to={`/product/${product.slug || product.id}?theme=junior`}
        className="relative block bg-white shrink-0"
        style={{ aspectRatio: '300 / 307' }}
      >
        <div className="w-full h-full flex items-center justify-center p-1.5 md:p-4">
          <img
            src={displayImage}
            alt={product.name}
            className="w-full h-full object-contain transition-all duration-500"
            loading="lazy"
            decoding="async"
            crossOrigin="anonymous"
          />
        </div>
        {product.isNew && (
          <span className="absolute top-2 right-2 bg-[#8750DA] text-white text-[8px] md:text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full">
            NEW
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3 md:p-4 pt-2 md:pt-3">
        <Link to={`/product/${product.slug || product.id}?theme=junior`}>
          <h3 className="min-h-[40px] text-[13px] md:text-[15px] font-black text-[#030014] leading-snug line-clamp-2 hover:text-[#F69245] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Stars using Star 1.png — only shown when real review data exists */}
        {(product as any).reviews > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <img key={i} src="/junior/Star 1.png" alt="★" className="h-3.5 w-3.5" />
              ))}
            </div>
            <span className="text-[11px] text-gray-400 font-medium">
              {(product as any).reviews} reviews
            </span>
          </div>
        )}


        {/* Buy on Amazon */}
        {amazonUrl ? (
          <button
            onClick={handleBuyOnAmazon}
            className="mt-auto w-full h-10 md:h-11 bg-[#F69245] hover:bg-[#e07d3a] text-white text-[10px] md:text-[11px] font-black uppercase tracking-[0.14em] transition-colors rounded-md"
          >
            Buy on Amazon
          </button>
        ) : (
          <button
            disabled
            className="mt-auto w-full h-10 md:h-11 bg-gray-100 text-gray-400 text-[10px] md:text-[11px] font-black uppercase tracking-[0.14em] rounded-md cursor-not-allowed"
          >
            Coming Soon
          </button>
        )}
      </div>
    </div>
  );
};

// Simplified Best Seller card matching user image precisely
const BestSellerCard = ({ product }: { product: Product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const originalPrice = (product as any).original_price ?? (product as any).originalPrice ?? product.price;
  const discount = originalPrice > product.price
    ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
    : 0;

  const secondaryImage = product.images?.[1] || product.image;
  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  const displayImage = !isTouchDevice && isHovered ? secondaryImage : ((product as any).image_url ?? product.image);

  return (
    <Link 
      to={`/product/${product.id}?theme=junior`} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex flex-col bg-white group"
    >
      <div className="overflow-hidden bg-[#F9F9F9] rounded-xl" style={{ aspectRatio: '1 / 1' }}>
        <img
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-contain p-2 md:p-4 transition-all duration-500"
          loading="lazy"
          crossOrigin="anonymous"
        />
      </div>
      <div className="pt-3 space-y-1">
        <h3 className="font-outfit font-bold text-[13px] md:text-[14px] text-black uppercase tracking-wide leading-snug line-clamp-1 group-hover:text-[#8750DA] transition-colors">
          {product.name}
        </h3>
      </div>
    </Link>
  );
};

const DRAW_COLORS = ['#F69245', '#8750DA', '#FFBB5A', '#FF6B6B', '#4ECDC4', '#000000'];

export const JuniorPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('School Backpacks');
  const [products, setProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tabPage, setTabPage] = useState(0);
  const [clickEffect, setClickEffect] = useState<'dreamy' | 'power' | null>(null);
  const activeCategory = CATEGORIES.find(c => c.label === activeTab) || CATEGORIES[0];
  const currentIndex = CATEGORIES.findIndex(c => c.label === activeTab);
  const nextCategory = CATEGORIES[(currentIndex + 1) % CATEGORIES.length];
  const activeCategoryHref = `/${activeCategory.filter}?theme=junior`;
  const nextCategoryHref = `/${nextCategory.filter}?theme=junior`;

  const handleStyleClick = (e: React.MouseEvent, type: 'dreamy' | 'power') => {
    e.preventDefault();
    setClickEffect(type);
    setTimeout(() => {
      setClickEffect(null);
      navigate(`/junior/${type}`);
    }, 750);
  };

  const [drawingMode, setDrawingMode] = useState(false);
  const [drawColor, setDrawColor] = useState('#F69245');
  const [brushSize, setBrushSize] = useState(5);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const drawSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = drawSectionRef.current;
    if (!canvas || !section) return;

    const syncSize = () => {
      const rect = section.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      // Physical dimensions
      const displayWidth = Math.round(rect.width);
      const displayHeight = Math.round(rect.height);

      if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
        // Set internal buffer size
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
        
        // Scale context once
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.scale(dpr, dpr);
        }
      }
    };

    syncSize();
    const ro = new ResizeObserver(() => {
      // Use requestAnimationFrame to avoid "ResizeObserver loop limit exceeded"
      window.requestAnimationFrame(syncSize);
    });
    ro.observe(section);
    return () => ro.disconnect();
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    
    // Get relative position in CSS pixels
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left),
        y: (e.touches[0].clientY - rect.top),
      };
    }
    return {
      x: ((e as React.MouseEvent).clientX - rect.left),
      y: ((e as React.MouseEvent).clientY - rect.top),
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDrawingRef.current = true;
    const pos = getPos(e);
    lastPosRef.current = pos;
    if (pos) {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = drawColor;
        ctx.fill();
      }
    }
  };

  const onDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    const pos = getPos(e);
    if (!ctx || !pos || !lastPosRef.current) return;
    {
      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
    lastPosRef.current = pos;
  };

  const endDraw = () => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.classList.remove('dark');
    sessionStorage.setItem('siteTheme', 'junior');
    const juniorCategories = ['school-backpacks', 'trolley-backpacks', 'lunch-bags', 'combo-set', 'pouches'];
    Promise.all(juniorCategories.map(cat => api.getProducts({ category: 'junior', sub_category: cat, sort: 'bestseller', limit: '4' })))
      .then(juniorResults => {
        const seen = new Set<string>();
        const combined = juniorResults
          .flatMap(r => r.products as unknown as Product[])
          .filter(p => { if (seen.has(p.id)) return false; seen.add(p.id); return true; })
          .slice(0, 8);
        setBestSellers(combined);
        setIsLoading(false);
      }).catch(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const cat = CATEGORIES.find(c => c.label === activeTab);
    if (!cat) return;
    setIsLoading(true);
    setProducts([]);
    setTabPage(0);
    api.getProducts({ sub_category: cat.filter, limit: '20' })
      .then(res => { setProducts(res.products as unknown as Product[]); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, [activeTab]);

  return (
    <main className="bg-white min-h-screen overflow-x-hidden junior-theme">

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

      <section ref={drawSectionRef} className="pt-2 md:pt-16 pb-16 md:pb-24 bg-white relative overflow-hidden">
        {/* Dynamic CSS Grid — perfectly aligned with canvas coordinates */}
        <div className="absolute inset-0 junior-grid-bg opacity-100 pointer-events-none" />

        {/* Drawing canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-50"
          style={{ width: '100%', height: '100%', pointerEvents: drawingMode ? 'auto' : 'none', cursor: drawingMode ? 'crosshair' : 'inherit', touchAction: 'none' }}
          onMouseDown={startDraw}
          onMouseMove={onDraw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={onDraw}
          onTouchEnd={endDraw}
        />

        {/* Draw controls — sticky so they stay within section and never overlap navbar */}
        <div className="sticky top-16 z-[60] flex items-center justify-between px-4 pointer-events-none" style={{ height: 0 }}>
          <button
            onClick={clearCanvas}
            className="pointer-events-auto flex items-center justify-center gap-1.5 rounded-full px-3 h-9 shadow-md text-sm font-bold font-outfit transition-all duration-200"
            style={{ background: '#fff', color: '#e53e3e', border: '2px solid #e53e3e', marginTop: '1rem' }}
          >
            🧹 Erase
          </button>
          <button
            onClick={() => setDrawingMode(d => !d)}
            className="pointer-events-auto flex items-center justify-center gap-1.5 rounded-full px-3 h-9 shadow-md text-sm font-bold font-outfit transition-all duration-200"
            style={{ background: drawingMode ? '#8750DA' : '#fff', color: drawingMode ? '#fff' : '#8750DA', border: '2px solid #8750DA', marginTop: '1rem' }}
          >
            ✏️ {drawingMode ? 'Done' : 'Draw'}
          </button>
        </div>

        {/* Toolbar (visible when drawing) */}
        {drawingMode && (
          <div className="sticky top-16 z-[60] flex items-center justify-center pointer-events-none" style={{ height: 0 }}>
          <div className="pointer-events-auto flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg" style={{ marginTop: '1rem' }}>
            {DRAW_COLORS.map(c => (
              <button key={c} onClick={() => setDrawColor(c)}
                className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                style={{ backgroundColor: c, outline: drawColor === c ? '2px solid #000' : '2px solid transparent', outlineOffset: '2px' }}
              />
            ))}
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <input type="range" min={2} max={20} value={brushSize} onChange={e => setBrushSize(+e.target.value)} className="w-16 accent-[#8750DA]" />
          </div>
          </div>
        )}

        <div className="max-w-[1280px] mx-auto px-6 md:px-14 relative z-10">
          <div className="flex items-center justify-center gap-3 mb-10">
            <img src="/junior/flower.png" alt="" aria-hidden className="w-4 h-4 select-none" />
            <h2 className="font-protest" style={{ fontSize: 'clamp(22px, 5vw, 36px)', color: '#F69245', lineHeight: '125.7%' }}>Shop By Age</h2>
            <img src="/junior/flower.png" alt="" aria-hidden className="w-4 h-4 select-none" />
          </div>

          {/* Mobile: swipe carousel */}
          <AgeGroupCarousel />

          {/* Desktop: 4-column grid */}
          <div className="hidden md:grid grid-cols-4 gap-8 lg:gap-10">
            {AGE_GROUPS.map((group, i) => (
              <motion.div key={group.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Link to={`/${group.slug}?theme=junior`} className="group relative block rounded-xl shadow-sm hover:shadow-xl transition-all duration-400 hover:-translate-y-2 !overflow-visible" style={{ aspectRatio: '1/1.4' }}>
                  <div className="absolute inset-0 rounded-xl overflow-hidden"><img src={group.img} alt={group.label} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" /></div>
                  <div className="absolute bottom-0 inset-x-0 flex items-center justify-center z-20 transition-colors duration-300 bg-[#FFBB5A] group-hover:bg-[#8750DA] h-[52px] rounded-tl-[40px]">
                    <p className="relative z-10 text-[14px] font-outfit font-black uppercase tracking-tight text-white drop-shadow-sm text-center px-1">{group.label}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative mb-6 overflow-visible px-4 md:px-0 flex justify-center">
        <div className="relative w-full max-w-[1600px] rounded-[5px] py-8 md:py-14 flex flex-col items-center justify-center text-center overflow-visible shadow-sm" style={{ backgroundColor: '#8750DA', minHeight: 'clamp(260px, 45vw, 500px)' }}>

          <div className="absolute left-2 md:left-24 top-1/2 -translate-y-1/2 w-[120px] sm:w-[180px] md:w-[380px] aspect-square opacity-100 pointer-events-none" style={{ backgroundImage: "url('/junior/Group 36.png')", backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'left center' }} />
          <div className="absolute right-2 md:right-24 top-1/2 -translate-y-1/2 w-[120px] sm:w-[180px] md:w-[380px] aspect-square opacity-100 pointer-events-none" style={{ backgroundImage: "url('/junior/Group 36.png')", backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center' }} />

          <div className="relative w-full flex flex-col items-center justify-center px-6 mt-[-70px] sm:mt-[-100px] md:mt-[-120px] mb-4 overflow-visible">
            <div className="relative w-[220px] sm:w-[340px] md:w-[463px] md:h-[423px] overflow-visible">
              <img src="/junior/Layer 1.png" alt="" aria-hidden className="w-full h-full object-contain pointer-events-none select-none drop-shadow-2xl" />
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-2 md:pt-6">
                <h2 className="font-protest tracking-tight max-w-[433px] mx-auto text-center" style={{ fontSize: 'clamp(20px, 6.5vw, 50.82px)', color: '#FFFFFF', lineHeight: '104.7%' }}>Made for Little Adventures</h2>
              </div>
            </div>
          </div>
          <div className="flex gap-8 md:gap-32 mt-4 md:mt-6 relative z-10">
            <a href="/junior/dreamy" onClick={e => handleStyleClick(e, 'dreamy')} className="text-white font-outfit font-semibold uppercase tracking-[0.1em] border-b-2 border-white/60 pb-1.5 hover:border-white transition-colors cursor-pointer" style={{ fontSize: 'clamp(12px, 3vw, 16px)' }}>Dreamy Styles</a>
            <a href="/junior/power" onClick={e => handleStyleClick(e, 'power')} className="text-white font-outfit font-semibold uppercase tracking-[0.1em] border-b-2 border-white/60 pb-1.5 hover:border-white transition-colors cursor-pointer" style={{ fontSize: 'clamp(12px, 3vw, 16px)' }}>Power Styles</a>
          </div>
        </div>
      </section>

      <section className="pt-10 pb-4 md:py-20 bg-white overflow-hidden relative">
        {/* Dynamic Background Glows */}
        <div 
          className="absolute top-1/4 -left-20 w-[400px] h-[400px] rounded-full blur-[120px] transition-colors duration-1000 opacity-20 pointer-events-none"
          style={{ backgroundColor: activeTab === 'School Backpacks' ? '#F69245' : activeTab === 'Pouches' ? '#8750DA' : '#FFBB5A' }}
        />
        <div 
          className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] rounded-full blur-[120px] transition-colors duration-1000 opacity-20 pointer-events-none"
          style={{ backgroundColor: activeTab === 'Lunch Bags' ? '#4ECDC4' : '#F69245' }}
        />

        <div className="absolute inset-0 junior-grid-bg opacity-[0.15] pointer-events-none" />
        
        {/* Floating Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[15%] left-[5%] text-[#F69245]/20"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L14.39 8.26H22L15.81 12.75L18.19 20L12 15.5L5.81 20L8.19 12.75L2 8.26H9.61L12 1Z"/></svg></motion.div>
          <motion.div animate={{ y: [0, 25, 0], x: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-[20%] right-[10%] text-[#8750DA]/20"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8"/></svg></motion.div>
        </div>

        <div className="max-w-[1420px] mx-auto px-4 sm:px-6 md:px-12 relative z-10">
          <div className="flex justify-center mb-10 md:mb-14">
            <div className="relative w-full flex justify-center">
              <div className="flex overflow-x-auto no-scrollbar gap-2 rounded-xl border border-gray-100 bg-white/90 p-1.5 shadow-sm px-4">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.label}
                    onClick={() => setActiveTab(cat.label)}
                    className={`relative h-11 px-5 rounded-lg text-[11px] md:text-[13px] font-black uppercase tracking-[0.14em] transition-all duration-500 whitespace-nowrap ${
                      activeTab === cat.label ? 'text-white' : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    {activeTab === cat.label && (
                      <motion.div
                        layoutId="activeTabJunior"
                        className="absolute inset-0 bg-[#F69245] rounded-lg shadow-lg"
                        transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10">{cat.label}</span>
                  </button>
                ))}
              </div>
              {/* Right fade hint — narrowed to prevent cutting */}
              <div className="pointer-events-none absolute right-0 top-0 h-full w-6 rounded-r-xl bg-gradient-to-l from-white/90 to-transparent lg:hidden" />
            </div>
          </div>


          <div className="grid lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[350px_minmax(0,1fr)] gap-6 lg:gap-8 items-start">
            {/* Left Banner — 3D Parallax Effect */}
            <motion.div 
              style={{ perspective: "1000px" }}
              className="hidden lg:block h-[500px] shrink-0"
            >
              <motion.div
                whileHover={{ rotateY: 8, rotateX: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 150, damping: 20 }}
                className="h-full relative shrink-0 flex flex-col overflow-hidden rounded-3xl bg-[#FAC05C] shadow-2xl group cursor-pointer"
                style={{ transformStyle: "preserve-3d" }}
              >
                <Link to={activeCategoryHref} className="absolute inset-0 z-20" />
                <div className="p-6 pb-4" style={{ transform: "translateZ(30px)" }}>
                  <div className="overflow-hidden rounded-2xl bg-white/30 shadow-2xl h-[360px] border border-white/40">
                    <img
                      src={activeCategory.image}
                      alt={activeTab}
                      className="w-full h-full object-cover object-top transition-all duration-700 group-hover:scale-110"
                      crossOrigin="anonymous"
                    />
                  </div>
                </div>
                <div className="mt-auto flex min-h-[92px] items-center justify-between gap-4 bg-[#F69245] px-8 py-4" style={{ transform: "translateZ(50px)" }}>
                  <h3 className="font-protest text-white leading-none drop-shadow-lg" style={{ fontSize: 'clamp(24px, 2.5vw, 34px)' }}>
                    {activeTab}
                  </h3>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#F69245] shadow-2xl transition-transform group-hover:translate-x-2">
                    <ArrowRight size={22} />
                  </span>
                </div>
              </motion.div>
            </motion.div>

            <div className="min-w-0">
              <div className="relative">
                {products.length > 3 && (
                  <>
                    <button
                      onClick={() => setTabPage(p => Math.max(0, p - 1))}
                      disabled={tabPage === 0}
                      className="hidden md:flex absolute left-0 top-[35%] -translate-x-1/2 w-11 h-11 bg-white hover:bg-[#F69245] hover:text-white items-center justify-center transition-all z-30 rounded-full shadow-lg border border-gray-100 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-current"
                      aria-label="Previous junior products"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => setTabPage(p => Math.min(Math.ceil(products.length / 3) - 1, p + 1))}
                      disabled={tabPage >= Math.ceil(products.length / 3) - 1}
                      className="hidden md:flex absolute right-0 top-[35%] translate-x-1/2 w-11 h-11 bg-white hover:bg-[#F69245] hover:text-white items-center justify-center transition-all z-30 rounded-full shadow-lg border border-gray-100 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-current"
                      aria-label="Next junior products"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}

                {isLoading ? (
                  <>
                    <div className="md:hidden flex gap-3 overflow-x-auto no-scrollbar pb-4">
                      {[1, 2, 3].map(n => (
                        <div key={n} className="w-[72vw] shrink-0">
                          <div className="aspect-[300/307] bg-gray-50 animate-pulse rounded-xl" />
                          <div className="mt-3 h-4 w-4/5 bg-gray-50 animate-pulse rounded" />
                          <div className="mt-3 h-10 w-full bg-gray-50 animate-pulse rounded" />
                        </div>
                      ))}
                    </div>
                    <div className="hidden md:grid grid-cols-3 gap-6">
                      {[1, 2, 3].map(n => (
                        <div key={n}>
                          <div className="aspect-[300/307] bg-gray-50 animate-pulse rounded-xl" />
                          <div className="mt-4 h-4 w-4/5 bg-gray-50 animate-pulse rounded" />
                          <div className="mt-3 h-4 w-1/2 bg-gray-50 animate-pulse rounded" />
                          <div className="mt-4 h-11 w-full bg-gray-50 animate-pulse rounded" />
                        </div>
                      ))}
                    </div>
                  </>
                ) : products.length > 0 ? (
                  <>
                    <div className="md:hidden grid grid-cols-2 gap-3 pb-8 px-4">
                      {products.slice(0, 8).map((product, idx) => (
                        <motion.div key={product.id} className="min-w-0" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }}>
                          <JuniorProductCard product={product} />
                        </motion.div>
                      ))}
                    </div>
                    <div className="hidden md:grid grid-cols-3 gap-6">
                      {products.slice(tabPage * 3, tabPage * 3 + 3).map((product, idx) => (
                        <motion.div key={product.id} className="min-w-0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                          <JuniorProductCard product={product} />
                        </motion.div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="min-h-[330px] lg:min-h-[500px] flex flex-col items-center justify-center rounded-xl bg-white border border-dashed border-[#F69245]/30 px-6 text-center">
                    <PackageCheck size={36} className="text-[#F69245] mb-4" />
                    <p className="text-sm font-black uppercase tracking-[0.2em] text-[#14052b] mb-2">Fresh stock coming soon</p>
                    <Link to={activeCategoryHref} className="mt-4 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#F69245]">
                      View category <ArrowRight size={14} />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          EXACT BEST SELLERS SECTION
      ═══════════════════════════════════════════════ */}
      <section className="pt-8 pb-16 bg-white relative">
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

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10">
            {isLoading ? (
              [1, 2, 3, 4].map(n => <div key={n} className="aspect-square bg-gray-50 animate-pulse rounded-sm" />)
            ) : bestSellers.slice(0, 4).map((product) => (
              <BestSellerCard key={product.id} product={product} />
            ))}
          </div>

        </div>
      </section>

      {/* Click-burst effect overlay for Dreamy / Power */}
      <AnimatePresence>
        {clickEffect && (
          <motion.div
            key="style-effect"
            className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.img
              src={clickEffect === 'dreamy' ? '/junior/Dreamy.png' : '/junior/Power.png'}
              alt=""
              aria-hidden
              className="w-[320px] md:w-[480px] h-auto"
              style={{ willChange: 'transform', imageRendering: 'crisp-edges' }}
              initial={{ scale: 0.75, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.08, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
};
