import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const AgeGroupCarousel = () => {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const touchRef = useRef<number | null>(null);
  const total = AGE_GROUPS.length;

  const goNext = () => { setDir(1); setIdx(i => (i + 1) % total); };
  const goPrev = () => { setDir(-1); setIdx(i => (i - 1 + total) % total); };

  return (
    <div className="md:hidden px-2 mb-2">
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
            <div key={`stack-${offset}`} className="absolute inset-y-0 rounded-2xl overflow-hidden pointer-events-none"
              style={{ left: `${offset * 10}px`, right: `-${offset * 10}px`, transform: `scale(${1 - offset * 0.04}) translateX(${offset * 8}px)`, filter: `brightness(${0.55 - offset * 0.1})`, zIndex: 10 - offset, transformOrigin: 'right center' }}>
              <div className="relative w-full" style={{ paddingBottom: '140%' }}>
                <img src={AGE_GROUPS[stackIdx].img} alt="" className="absolute inset-0 w-full h-full object-cover object-top" />
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
              <Link to={`/${AGE_GROUPS[idx].slug}`} className="block w-full relative" style={{ paddingBottom: '140%' }}>
                <img src={AGE_GROUPS[idx].img} alt={AGE_GROUPS[idx].label} className="absolute inset-0 w-full h-full object-cover object-top" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
                  <span className="block text-white text-[20px] font-black uppercase tracking-widest leading-tight drop-shadow-lg">{AGE_GROUPS[idx].label}</span>
                </div>
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-between items-center mt-6 px-1">
          <button onClick={goPrev} className="p-2 text-gray-400 transition-opacity"><ChevronLeft className="w-5 h-5" /></button>
          <div className="flex gap-2">
            {AGE_GROUPS.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? 'w-6 bg-[#F69245]' : 'w-1.5 bg-gray-200'}`} />
            ))}
          </div>
          <button onClick={goNext} className="p-2 text-gray-400 transition-opacity"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>
    </div>
  );
};

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
        className="relative block rounded-2xl overflow-hidden bg-white"
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
          <h3 className="text-[16px] font-bold text-[#000000] leading-snug line-clamp-2 hover:text-[#F69245] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Stars using Star 1.png — only shown when real review data exists */}
        {(product as any).reviews > 0 && (
          <div className="flex items-center gap-1.5">
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

        {/* Price */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-[16px] font-semibold text-[#F69245]">
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
          className="w-full py-2.5 bg-[#F69245] hover:bg-[#e07d3a] text-white text-[11px] font-bold uppercase tracking-[0.15em] transition-colors rounded-md mt-1"
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
    <Link to={`/product/${product.id}?theme=junior`} className="aspect-square bg-[#F9F9F9] rounded-sm overflow-hidden flex items-center justify-center p-8 mb-4">
      <img src={(product as any).image_url ?? product.image} alt={product.name} className="w-full h-full object-contain" />
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

const DRAW_COLORS = ['#F69245', '#8750DA', '#FFBB5A', '#FF6B6B', '#4ECDC4', '#000000'];

export const JuniorPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('School Backpacks');
  const [products, setProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [clickEffect, setClickEffect] = useState<'dreamy' | 'power' | null>(null);
  const tabScrollRef = useRef<HTMLDivElement>(null);

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
      const { width, height } = section.getBoundingClientRect();
      if (canvas.width !== Math.round(width) || canvas.height !== Math.round(height)) {
        canvas.width = Math.round(width);
        canvas.height = Math.round(height);
      }
    };
    syncSize();
    const ro = new ResizeObserver(syncSize);
    ro.observe(section);
    return () => ro.disconnect();
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: ((e as React.MouseEvent).clientX - rect.left) * scaleX,
      y: ((e as React.MouseEvent).clientY - rect.top) * scaleY,
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
    Promise.all(juniorCategories.map(cat => api.getProducts({ category: 'junior', sub_category: cat, sort: 'rating', limit: '4' })))
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
    if (tabScrollRef.current) tabScrollRef.current.scrollLeft = 0;
    api.getProducts({ sub_category: cat.filter, limit: '4' })
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

      <section ref={drawSectionRef} className="pt-12 md:pt-16 pb-16 md:pb-24 bg-white relative overflow-hidden">
        <img src="/junior/grid view.png" alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-100 pointer-events-none select-none" />

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

        {/* Eraser — top left */}
        <button
          onClick={clearCanvas}
          className="absolute top-4 left-4 z-[60] flex items-center justify-center gap-1.5 rounded-full px-3 h-9 shadow-md text-sm font-bold font-outfit transition-all duration-200"
          style={{ background: '#fff', color: '#e53e3e', border: '2px solid #e53e3e' }}
        >
          🧹 Erase
        </button>

        {/* Pencil / Draw — top right */}
        <button
          onClick={() => setDrawingMode(d => !d)}
          className="absolute top-4 right-4 z-[60] flex items-center justify-center gap-1.5 rounded-full px-3 h-9 shadow-md text-sm font-bold font-outfit transition-all duration-200"
          style={{ background: drawingMode ? '#8750DA' : '#fff', color: drawingMode ? '#fff' : '#8750DA', border: '2px solid #8750DA' }}
        >
          ✏️ {drawingMode ? 'Done' : 'Draw'}
        </button>

        {/* Toolbar (visible when drawing) */}
        {drawingMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
            {DRAW_COLORS.map(c => (
              <button key={c} onClick={() => setDrawColor(c)}
                className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                style={{ backgroundColor: c, outline: drawColor === c ? '2px solid #000' : '2px solid transparent', outlineOffset: '2px' }}
              />
            ))}
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <input type="range" min={2} max={20} value={brushSize} onChange={e => setBrushSize(+e.target.value)} className="w-16 accent-[#8750DA]" />
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
                <Link to={`/${group.slug}`} className="group relative block rounded-xl shadow-sm hover:shadow-xl transition-all duration-400 hover:-translate-y-2 !overflow-visible" style={{ aspectRatio: '1/1.4' }}>
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

      <section className="py-12 md:py-16 bg-white overflow-hidden relative">
        <img src="/junior/grid view.png" alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none select-none" />
        <div className="max-w-[1402px] mx-auto px-6 md:px-18 relative z-10">
          <div className="flex overflow-x-auto no-scrollbar gap-4 md:gap-8 md:justify-center mb-6 md:mb-10 border-b border-gray-100 pb-1 relative">
            {CATEGORIES.map((cat) => (
              <button key={cat.label} onClick={() => setActiveTab(cat.label)} className={`relative pb-3 text-[13px] font-outfit font-black uppercase tracking-[0.1em] transition-all duration-300 whitespace-nowrap ${activeTab === cat.label ? 'text-[#14052b]' : 'text-gray-400 hover:text-gray-600'}`}>
                {cat.label}
                {activeTab === cat.label && <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#F69245] rounded-full" />}
              </button>
            ))}
          </div>

          {/* Mobile: category strip */}
          <div className="md:hidden flex items-center gap-4 p-4 mb-6 rounded-xl overflow-hidden" style={{ backgroundColor: '#FAC05C' }}>
            <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden">
              <img src={CATEGORIES.find(c => c.label === activeTab)?.image || ''} alt={activeTab} className="w-full h-full object-cover object-top" />
            </div>
            <div className="text-white font-outfit">
              <p className="font-semibold uppercase text-[10px] tracking-widest opacity-80">Trendy</p>
              <p className="font-bold uppercase text-xl leading-tight">{activeTab}</p>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-8 md:gap-14">
            <div className="hidden lg:flex relative shrink-0 flex-col items-center justify-start">
              <Link
                to={`/${CATEGORIES.find(c => c.label === activeTab)?.filter}`}
                className="relative flex flex-col items-center pt-6 md:pt-8 w-full max-w-[260px] sm:max-w-[334px] mx-auto lg:mx-0 group"
                style={{ backgroundColor: '#FAC05C', borderRadius: '5px', minHeight: '360px' }}
              >
                <div className="overflow-hidden shadow-2xl mb-4 w-[85%] max-w-[285px] rounded-[5px]" style={{ height: 'clamp(260px, 55vw, 400px)' }}>
                  <img
                    src={CATEGORIES.find(c => c.label === activeTab)?.image || "/junior/Drift Sky Blue_ Hero 1.png"}
                    alt={activeTab}
                    className="w-full h-full object-cover object-top transition-all duration-700 group-hover:scale-105"
                  />
                </div>
                <h3 className="font-protest text-white leading-none text-center pb-5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] group-hover:text-[#8750DA] transition-colors" style={{ fontSize: 'clamp(24px, 5vw, 39.88px)' }}>{activeTab}</h3>
              </Link>
            </div>
            <div className="flex-1 min-w-0">
              <div className="relative">
                <button
                  onClick={() => tabScrollRef.current?.scrollBy({ left: -280, behavior: 'smooth' })}
                  className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 w-10 h-16 bg-[#F3F3F3] hover:bg-gray-200 items-center justify-center transition-colors z-30 rounded-r-lg"
                >
                  <ChevronLeft size={20} className="text-gray-600" />
                </button>
                <button
                  onClick={() => tabScrollRef.current?.scrollBy({ left: 280, behavior: 'smooth' })}
                  className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 w-10 h-16 bg-[#F3F3F3] hover:bg-gray-200 items-center justify-center transition-colors z-30 rounded-l-lg"
                >
                  <ChevronRight size={20} className="text-gray-600" />
                </button>
                {isLoading ? (
                  <>
                    {/* Mobile: 2-col grid skeleton */}
                    <div className="md:hidden grid grid-cols-2 gap-3 px-1">
                      {[1, 2, 3, 4].map(n => <div key={n} className="aspect-[4/5] bg-gray-50 animate-pulse rounded-2xl" />)}
                    </div>
                    {/* Desktop: scroll skeleton */}
                    <div className="hidden md:flex gap-6 overflow-x-auto pb-2 no-scrollbar px-14">
                      {[1, 2, 3, 4].map(n => <div key={n} className="flex-shrink-0 w-[200px] lg:w-[220px] aspect-[4/5] bg-gray-50 animate-pulse rounded-3xl" />)}
                    </div>
                  </>
                ) : products.length > 0 ? (
                  <>
                    {/* Mobile: clean 2-column grid */}
                    <div className="md:hidden grid grid-cols-2 gap-3 px-1">
                      {products.slice(0, 4).map((product, idx) => (
                        <motion.div key={product.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }}>
                          <JuniorProductCard product={product} />
                        </motion.div>
                      ))}
                    </div>
                    {/* Desktop: horizontal scroll */}
                    <div ref={tabScrollRef} className="hidden md:flex gap-6 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory px-14">
                      {products.slice(0, 4).map((product, idx) => (
                        <motion.div key={product.id} className="shrink-0 w-[200px] lg:w-[220px] snap-start" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }}><JuniorProductCard product={product} /></motion.div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center py-20 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-100"><p className="text-gray-400 font-outfit font-black uppercase tracking-widest">Coming Soon</p></div>
                )}
              </div>
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
