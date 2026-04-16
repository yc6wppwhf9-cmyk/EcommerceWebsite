import React, { useState, useMemo, useEffect } from 'react';
import { ProductCard } from '../components/ProductCard';
import { api } from '../lib/api';
import { Product } from '../types';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';

export const JuniorPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Fetch specifically for kids/school category
    api.getProducts({ category: 'school-backpacks' }).then(res => {
      setProducts(res.products as unknown as Product[]);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  const categorizedProducts = useMemo(() => {
    const groups: Record<string, Product[]> = {};
    products.forEach(p => {
      const cat = p.subcategory || 'Junior Essentials';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });
    return groups;
  }, [products]);

  return (
    <main className="bg-white min-h-screen font-outfit">
      {/* Junior Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-32 bg-[#F8FAFC] overflow-hidden">
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 mb-6"
            >
              <div className="w-8 h-8 rounded-full bg-priority-blue flex items-center justify-center text-white">
                <Sparkles size={14} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-priority-blue">Priority Junior</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-8xl font-black text-[#111] leading-[0.9] uppercase tracking-tighter mb-8"
            >
              Small Gear,<br />Big <span className="text-priority-blue">Adventures.</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm md:text-base text-gray-500 max-w-xl leading-relaxed mb-10 font-medium"
            >
              Ergonomic, vibrant, and built to survive the playground. Explore our latest collection designed for the next generation of explorers.
            </motion.p>
          </div>
        </div>
        
        {/* Floating Decorative Elements */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1/3 h-full hidden lg:block">
           <img src="/Category/Accessories.png" className="w-full h-auto object-contain rotate-12 opacity-20 scale-150" alt="" />
        </div>
      </section>

      {/* Featured Collections (The Landing Page Style) */}
      <section className="py-20">
        <div className="container mx-auto px-6 md:px-12">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
               {[1,2,3,4].map(n => <div key={n} className="aspect-[3/4] bg-gray-50 animate-pulse rounded-3xl" />)}
            </div>
          ) : Object.keys(categorizedProducts).length > 0 ? (
            <div className="space-y-32">
              {Object.entries(categorizedProducts).map(([category, items], sectionIdx) => (
                <div key={category} className="group">
                  <div className="flex items-end justify-between mb-12 border-b border-gray-100 pb-8">
                    <div>
                      <span className="text-[10px] font-black text-priority-blue uppercase tracking-[0.4em] mb-3 block">0{sectionIdx + 1} Collection</span>
                      <h2 className="text-3xl md:text-5xl font-black text-[#111] uppercase tracking-tight">{category.replace('-', ' ')}</h2>
                    </div>
                    <div className="hidden md:block text-right">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{items.length} Unique Designs Available</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16 md:gap-y-24">
                    {items.map((product, idx) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-40 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
               <p className="text-sm font-black text-gray-400 uppercase tracking-widest">New Junior Collection Arriving Soon</p>
            </div>
          )}
        </div>
      </section>

      {/* Junior CTA */}
      <section className="bg-priority-blue py-24 md:py-32 relative overflow-hidden text-white mx-6 md:mx-12 rounded-[3.5rem] mb-24 lg:mb-32 shadow-2xl">
         <div className="container mx-auto px-8 relative z-10 text-center">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-8">
              Back to School,<br /><span className="opacity-50">Back to Style.</span>
            </h2>
            <p className="text-white/60 max-w-lg mx-auto mb-10 text-sm md:text-base font-medium">
              Join our newsletter for early access to the new season drops and exclusive junior member discounts.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <button className="px-10 py-4 bg-white text-priority-blue font-black text-xs uppercase tracking-widest rounded-full hover:scale-105 transition-transform active:scale-95">Shop All Junior</button>
            </div>
         </div>
         {/* Background text */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[25vw] font-black text-white/5 whitespace-nowrap pointer-events-none select-none">
            JUNIOR
         </div>
      </section>
    </main>
  );
};
