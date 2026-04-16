import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { api } from '../lib/api';
import { Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Zap, 
  ShieldCheck, 
  Clock, 
  ArrowUpRight 
} from 'lucide-react';

const IMG = {
  hero: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80",
  banner: "/banner/Red Yellow Vibrant Groovy Cool New Year Party Invitation (1).png",
  categories: {
    backpacks: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80",
    luggage: "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?auto=format&fit=crop&q=80",
    accessories: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80"
  }
};

const BACKPACK_TABS = [
  { id: 'school', label: 'School', category: 'school-backpacks' },
  { id: 'college', label: 'College', category: 'college-backpacks' },
  { id: 'office', label: 'Office', category: 'office-backpacks' },
  { id: 'travel', label: 'Travel', category: 'travel-backpacks' },
];

const BestSellerCard = ({ product }: { product: Product }) => (
  <div className="flex flex-col h-full bg-white transition-all duration-300 relative group">
    {/* Image Container matching the light gray box in reference */}
    <Link to={`/product/${product.id}`} className="aspect-[379/411] bg-[#F9F9F9] rounded-[4px] overflow-hidden flex items-center justify-center p-6 md:p-10 mb-3">
      <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" />
    </Link>
    <div className="px-1">
      <Link to={`/product/${product.id}`}>
        <h3 className="font-outfit font-semibold text-[13px] md:text-[14px] text-black leading-[1.4] mb-1.5 line-clamp-2">
          {product.name}
        </h3>
      </Link>
      <div className="flex items-center gap-2.5">
        <span className="text-[13px] md:text-[14px] font-outfit font-bold text-[#8750DA]">₹ {product.price}.00</span>
        <span className="text-[11px] md:text-[12px] text-[#A0A0A0] line-through">₹ {Math.round(product.price * 1.5)}.00</span>
        <span className="text-[11px] md:text-[12px] font-bold text-black opacity-90">50% off</span>
      </div>
    </div>
  </div>
);

export const Home = () => {
  const [activeTab, setActiveTab] = useState('school');
  const [tabProducts, setTabProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const bestSellersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoading(true);
    const category = BACKPACK_TABS.find(t => t.id === activeTab)?.category;
    
    Promise.all([
      api.getProducts({ category, limit: '8' }),
      api.getProducts({ sort: 'popular', limit: '8' })
    ]).then(([tabRes, bestRes]) => {
      setTabProducts(tabRes.products as unknown as Product[]);
      setBestSellers(bestRes.products as unknown as Product[]);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, [activeTab]);

  return (
    <main className="bg-white">
      {/* Hero Section - Vertical Flow for mobile */}
      <div className="md:hidden relative w-full h-[88vh] bg-[#F8F9FA] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={IMG.banner} 
            alt="New Arrival" 
            className="w-full h-full object-cover"
          />
        </div>
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
              <h2 className="text-6xl font-black uppercase tracking-[0.12em] text-white mb-6">New Arrival</h2>
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
                className={`text-[11px] md:text-sm font-black uppercase tracking-widest py-3 px-1 whitespace-nowrap transition-all duration-300 relative ${
                  activeTab === tab.id ? 'text-[#14052b]' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8750DA]" />
                )}
              </button>
            ))}
          </div>

          <div className="relative group">
            <div className="flex items-center justify-between mb-8 md:hidden">
               <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Featured for {activeTab}</h3>
               <Link to="/backpacks" className="text-[10px] font-bold uppercase tracking-widest text-[#8750DA]">View All</Link>
            </div>
            
            <div className="relative">
              <div className="absolute top-1/2 -translate-y-1/2 w-full hidden md:flex justify-between pointer-events-none z-10">
                <button
                  onClick={() => scrollRef.current?.scrollBy({ left: -400, behavior: 'smooth' })}
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-900 border border-gray-100 shadow-xl pointer-events-auto transition-all -translate-x-5 active:scale-95 hover:bg-gray-50"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() => scrollRef.current?.scrollBy({ left: 400, behavior: 'smooth' })}
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-900 border border-gray-100 shadow-xl pointer-events-auto transition-all translate-x-5 active:scale-95 hover:bg-gray-50"
                >
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

      {/* ═══════════════════════════════════════════════
          BEST SELLERS SECTION - EXACT REPRODUCTION
      ═══════════════════════════════════════════════ */}
      <section className="pb-16 pt-10 md:pt-20 bg-white border-t border-gray-100">
        <div className="max-w-[1440px] mx-auto px-4 md:px-14">
          <div className="text-center mb-12">
            <h2 
              className="font-outfit font-semibold uppercase tracking-[0.1em]" 
              style={{ fontSize: '16px', color: '#030014' }}
            >
              Shop Best Sellers
            </h2>
          </div>

          <div className="relative group">
            <button
              onClick={() => bestSellersRef.current?.scrollBy({ left: -400, behavior: 'smooth' })}
              className="absolute left-[-15px] md:left-[-40px] top-1/2 -translate-y-1/2 w-8 h-12 md:w-10 md:h-16 bg-[#F3F3F3] hover:bg-gray-200 flex items-center justify-center transition-colors z-30 rounded-r-lg"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            <button
              onClick={() => bestSellersRef.current?.scrollBy({ left: 400, behavior: 'smooth' })}
              className="absolute right-[-15px] md:right-[-40px] top-1/2 -translate-y-1/2 w-8 h-12 md:w-10 md:h-16 bg-[#F3F3F3] hover:bg-gray-200 flex items-center justify-center transition-colors z-30 rounded-l-lg"
            >
              <ChevronRight size={20} className="text-gray-600" />
            </button>

            <div
              ref={bestSellersRef}
              className="flex gap-4 sm:gap-6 md:gap-10 overflow-x-auto no-scrollbar pb-10 px-1 sm:px-4"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {isLoading ? (
                [1, 2, 3, 4].map(n => <div key={n} className="min-w-[200px] aspect-[379/411] bg-gray-50 animate-pulse rounded-lg" />)
              ) : bestSellers.map(p => (
                <div key={p.id} className="min-w-[230px] md:min-w-[280px] lg:min-w-[320px] shrink-0">
                  <BestSellerCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-20 bg-[#F9F9F9]">
        <div className="container mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <ShieldCheck size={32} className="text-[#8750DA] mb-6" />
              <h4 className="font-outfit font-black uppercase tracking-widest text-[11px] mb-3">Lifetime Warranty</h4>
              <p className="text-xs text-gray-500 leading-relaxed uppercase tracking-widest opacity-60">Engineered for durability</p>
            </div>
            <div className="flex flex-col items-center">
              <Clock size={32} className="text-[#8750DA] mb-6" />
              <h4 className="font-outfit font-black uppercase tracking-widest text-[11px] mb-3">24/7 Support</h4>
              <p className="text-xs text-gray-500 leading-relaxed uppercase tracking-widest opacity-60">Always here to help</p>
            </div>
            <div className="flex flex-col items-center">
              <Zap size={32} className="text-[#8750DA] mb-6" />
              <h4 className="font-outfit font-black uppercase tracking-widest text-[11px] mb-3">Fast Shipping</h4>
              <p className="text-xs text-gray-500 leading-relaxed uppercase tracking-widest opacity-60">Global delivery network</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
