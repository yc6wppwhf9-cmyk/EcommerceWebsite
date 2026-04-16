import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { api } from '../lib/api';
import { Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Star, ChevronLeft, ChevronRight } from 'lucide-react';

const AGE_GROUPS = [
  { label: 'Below 3 Years', slug: 'school-backpacks', img: '/junior/Rectangle 28.png', color: '#FFBB5A' },
  { label: '3 to 5 Years', slug: 'school-backpacks', img: '/junior/Rectangle 29.png', color: '#A368FB' },
  { label: '6 to 10 Years', slug: 'school-backpacks', img: "/junior/Speedo_ Hero 1.png", color: '#FFBB5A' },
  { label: '11 Years & Above', slug: 'college-backpacks', img: "/junior/Drift Sky Blue_ Hero 1.png", color: '#FFBB5A' },
];

const CATEGORIES = [
  { label: 'School Backpacks', filter: 'school-backpacks' },
  { label: 'Combo Set', filter: 'combo-set' },
  { label: 'Pouches', filter: 'pouches' },
  { label: 'Lunch Bags', filter: 'lunch-bags' },
  { label: 'Trolley Backpacks', filter: 'trolley-backpacks' },
];

// Standard card for Showcase (with Move to Cart)
const JuniorProductCard = ({ product }: { product: Product }) => (
  <div className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl relative border border-gray-100/50">
    <div className="absolute top-2 right-2 z-10 bg-[#FFB347] text-white text-[9px] font-black px-2 py-0.5 rounded-sm uppercase tracking-tighter">New</div>
    <Link to={`/product/${product.id}`} className="aspect-[4/5] overflow-hidden bg-[#F9F9F9] flex items-center justify-center p-6">
      <img src={product.image_url} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
    </Link>
    <div className="p-4 flex flex-col flex-1">
      <Link to={`/product/${product.id}`}>
        <h3 className="font-outfit font-semibold leading-tight mb-2 line-clamp-2" style={{ fontSize: '16px', color: '#030014' }}>{product.name}</h3>
      </Link>
      <div className="flex items-center gap-1 mb-3">
        <div className="flex">{[1, 2, 3, 4, 5].map(i => <Star key={i} size={11} fill="#FFD700" color="#FFD700" />)}</div>
        <span className="text-[10px] text-gray-400 font-outfit font-medium">10 reviews</span>
      </div>
      <div className="mt-auto flex flex-col gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-[15px] font-outfit font-bold text-[#7C3AED]">₹ {product.price}</span>
          <span className="text-[11px] text-gray-400 line-through">₹ {Math.round(product.price * 1.5)}</span>
          <span className="text-[11px] font-bold text-[#FF6B6B]">50% off</span>
        </div>
        <button className="w-full bg-[#8750DA] hover:bg-[#723ac9] text-white text-[10px] font-outfit font-black uppercase tracking-widest py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">+ Move to Cart</button>
      </div>
    </div>
  </div>
);

// Simplified Best Seller card matching user image precisely
const BestSellerCard = ({ product }: { product: Product }) => (
  <div className="flex flex-col h-full bg-white transition-all duration-300 relative group">
    <Link to={`/product/${product.id}`} className="aspect-square bg-[#F9F9F9] rounded-sm overflow-hidden flex items-center justify-center p-8 mb-4">
      <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" />
    </Link>
    <div className="px-1">
      <Link to={`/product/${product.id}`}>
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

  useEffect(() => {
    window.scrollTo(0, 0);
    Promise.all([
      api.getProducts({ category: 'school-backpacks', limit: '8' }),
      api.getProducts({ sort: 'popular', limit: '8' }),
    ]).then(([school, popular]) => {
      setProducts(school.products as unknown as Product[]);
      setBestSellers(popular.products as unknown as Product[]);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  return (
    <main className="bg-white min-h-screen overflow-x-hidden">

      <section className="relative w-full h-[450px] md:h-[650px] overflow-hidden">
        <img src="/junior/junior hero.png" alt="Junior Collection Preview" className="w-full h-full object-cover" />
      </section>

      <section className="py-12 md:py-16 bg-white relative overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-6 md:px-14 relative z-10">
          <div className="flex items-center justify-center gap-3 mb-10">
            <img src="/junior/flower.png" alt="" aria-hidden className="w-4 h-4 select-none" />
            <h2 className="font-protest" style={{ fontSize: '36px', color: '#A368FB', lineHeight: '125.7%' }}>Shop By Age</h2>
            <img src="/junior/flower.png" alt="" aria-hidden className="w-4 h-4 select-none" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 lg:gap-10">
            {AGE_GROUPS.map((group, i) => (
              <motion.div key={group.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Link to={`/${group.slug}`} className="group relative block rounded-xl shadow-sm hover:shadow-xl transition-all duration-400 hover:-translate-y-2 !overflow-visible" style={{ aspectRatio: '305/444' }}>
                  <div className="absolute inset-0 rounded-xl overflow-hidden"><img src={group.img} alt={group.label} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" /></div>
                  <div className="absolute bottom-0 inset-x-0 flex items-center justify-center z-20" style={{ height: '52px', backgroundColor: group.color, borderTopLeftRadius: '40px' }}><p className="relative z-10 text-[13px] md:text-[14px] font-outfit font-black uppercase tracking-tight text-white drop-shadow-sm">{group.label}</p></div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative mt-24 mb-6 overflow-visible px-4 md:px-0 flex justify-center">
        <div className="relative w-full max-w-[1402px] rounded-[5px] py-10 md:py-14 flex flex-col items-center justify-center text-center overflow-visible shadow-sm" style={{ backgroundColor: '#8750DA', minHeight: '380px' }}>
          
          {/* Group 36 side Doodles - Restored and High Opacity */}
          <div className="absolute left-4 md:left-24 top-1/2 -translate-y-1/2 w-[220px] md:w-[380px] aspect-square opacity-100 pointer-events-none" style={{ backgroundImage: "url('/junior/Group 36.png')", backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'left center' }} />
          <div className="absolute right-4 md:right-24 top-1/2 -translate-y-1/2 w-[220px] md:w-[380px] aspect-square opacity-100 pointer-events-none" style={{ backgroundImage: "url('/junior/Group 36.png')", backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center' }} />

          <div className="relative w-full flex flex-col items-center justify-center px-6 mt-[-100px] md:mt-[-120px] mb-4 overflow-visible">
            <div className="relative w-[340px] md:w-[463px] md:h-[423px] overflow-visible">
              <img src="/junior/Layer 1.png" alt="" aria-hidden className="w-full h-full object-contain pointer-events-none select-none drop-shadow-2xl" />
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-8 md:pt-16">
                <span className="font-outfit uppercase tracking-[0.2em] mb-2" style={{ fontSize: '28.36px', fontWeight: 400, color: '#966512' }}>New Arrival</span>
                <h2 className="font-protest tracking-tight max-w-[433px] mx-auto" style={{ fontSize: '50.82px', color: '#3E92E6', lineHeight: '104.7%' }}>Made for Little Adventures</h2>
              </div>
            </div>
          </div>
          <div className="flex gap-10 md:gap-32 mt-4 md:mt-6 relative z-10">
            <Link to="/school-backpacks" className="text-white font-outfit font-semibold uppercase tracking-[0.1em] border-b-2 border-white/60 pb-1.5 hover:border-white transition-colors" style={{ fontSize: '16px' }}>Dreamy Styles</Link>
            <Link to="/school-backpacks" className="text-white font-outfit font-semibold uppercase tracking-[0.1em] border-b-2 border-white/60 pb-1.5 hover:border-white transition-colors" style={{ fontSize: '16px' }}>Power Styles</Link>
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
               <div className="relative flex flex-col items-center pt-8" style={{ width: '334px', height: '486px', backgroundColor: '#FAC05C', borderRadius: '5px' }}>
                 <div className="overflow-hidden shadow-2xl mb-4" style={{ width: '285px', height: '400px', borderRadius: '5px' }}><img src="/junior/Beautiful_ Hero 1.png" alt="Featured School Backpack" className="w-full h-full object-cover object-top" /></div>
                 <h3 className="font-protest text-white leading-none text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" style={{ fontSize: '39.88px' }}>{activeTab}</h3>
               </div>
            </div>
            <div className="flex-1">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {[1, 2, 3].map(n => <div key={n} className="aspect-[4/5] bg-gray-50 animate-pulse rounded-3xl" />)}
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
          
          <div className="mt-24 text-center">
            <p 
              className="font-outfit font-normal uppercase tracking-[0.15em]" 
              style={{ fontSize: '16px', color: '#B0B0B0' }}
            >
              Ready For Your Journey
            </p>
          </div>
        </div>
      </section>

    </main>
  );
};
