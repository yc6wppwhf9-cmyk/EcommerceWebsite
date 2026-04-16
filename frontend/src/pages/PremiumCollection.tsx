import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { ProductCard } from '../components/ProductCard';
import { api } from '../lib/api';
import type { Product } from '../types';

export const PremiumCollection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    api.getProducts({ isPremium: 'true' }).then(res => {
      setProducts(res.products as unknown as Product[]);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  const categorizedProducts = useMemo(() => {
    const groups: Record<string, Product[]> = {};
    products.forEach(p => {
      const cat = p.category || 'Premium Selection';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });
    return groups;
  }, [products]);

  return (
    <main className="bg-[#fcf8f1] min-h-screen font-outfit">
      {/* Editorial Hero */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-priority-dark">
        <div className="absolute inset-0 opacity-40">
           <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-priority-blue rounded-full blur-[120px]" />
           <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#5c83e8] rounded-full blur-[150px]" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-white/60 text-[10px] font-black tracking-[0.5em] uppercase mb-8 block">
              The Digital Atelier
            </span>
            <h1 className="text-white text-6xl md:text-9xl font-black mb-8 leading-[0.85] uppercase tracking-tighter">
              Premium<br /><span className="text-priority-blue">Collection.</span>
            </h1>
            <p className="text-white/70 max-w-xl mx-auto text-sm md:text-base leading-relaxed font-medium tracking-wide">
              Excellence defined by craftsmanship. Engineered for performance and designed for the discerning individual.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="container mx-auto px-6 md:px-12 py-32">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          <div className="relative group">
            <div className="absolute -inset-6 bg-priority-blue/5 rounded-[3rem] scale-95 group-hover:scale-100 transition-transform duration-700" />
            <img 
              src="/Creatives/editorial-5.jpg" 
              alt="Craftsmanship" 
              className="rounded-[2.5rem] shadow-2xl relative z-10 w-full aspect-[4/5] object-cover"
            />
          </div>
          <div className="space-y-10">
            <div className="w-16 h-1 bg-priority-blue mb-4" />
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 leading-[0.9] uppercase tracking-tighter">
              Crafted Without <span className="text-priority-blue">Compromise.</span>
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed font-medium">
              Every piece in the Premium Collection represents the pinnacle of Priority's design philosophy. 
              Using full-grain leathers and aerospace-grade materials, we create luggage that protects your journey.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {['Full-Grain Leather', 'Aerospace Aluminium', 'YKK® Metal Zippers', 'Lifetime Warranty'].map((item) => (
                <div key={item} className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="w-2 h-2 bg-priority-blue rounded-full" />
                  <span className="text-[10px] font-black tracking-widest text-gray-800 uppercase">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categorized Product Sections */}
      <section className="bg-white py-32 border-t border-gray-100">
        <div className="container mx-auto px-6 md:px-12">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
               {[1,2,3,4].map(n => <div key={n} className="aspect-[3/4] bg-gray-50 animate-pulse rounded-3xl" />)}
            </div>
          ) : (
            <div className="space-y-40">
              {(Object.entries(categorizedProducts) as [string, Product[]][]).map(([category, items], idx) => (
                <div key={category}>
                   <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 border-b border-gray-100 pb-10">
                    <div>
                      <span className="text-priority-blue font-black tracking-[0.4em] text-[10px] uppercase mb-3 block">Category 0{idx+1}</span>
                      <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tighter">{category.replace('-', ' ')}</h2>
                    </div>
                    <div className="text-right text-gray-400 text-[10px] font-black tracking-widest uppercase pb-1">
                      {items.length} PLATINUM EDITION PIECES
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-24">
                    {items.map((product, pIdx) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: pIdx * 0.05 }}
                      >
                        <div className="relative group/card">
                          <div className="absolute -top-3 -left-3 z-30 bg-black text-white text-[8px] font-black px-2 py-1 tracking-[0.2em] uppercase rounded-sm">
                            PLATINUM
                          </div>
                          <ProductCard product={product} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Premium CTA */}
      <section className="bg-priority-dark text-white py-32 overflow-hidden relative mx-6 md:mx-12 rounded-[4rem] mb-24 lg:mb-32 shadow-2xl">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[25vw] font-black text-white/[0.04] whitespace-nowrap z-0 pointer-events-none uppercase select-none">
          LUXE
        </div>
        <div className="container mx-auto px-8 relative z-10 text-center">
          <h2 className="text-4xl md:text-7xl font-black mb-10 uppercase tracking-tighter leading-[0.85]">
            Elevate Your<br /><span className="text-priority-blue">Experience.</span>
          </h2>
          <p className="text-white/60 max-w-xl mx-auto mb-12 text-sm md:text-base font-medium tracking-wide">
            Join the inner circle for early access to limited edition drops and bespoke personalisations.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-priority-blue text-white px-12 py-5 font-black text-[10px] tracking-widest uppercase rounded-full hover:scale-105 transition-all shadow-xl shadow-priority-blue/20">
              Join the Circle
            </button>
            <button className="border border-white/20 text-white px-12 py-5 font-black text-[10px] tracking-widest uppercase rounded-full hover:bg-white/10 transition-all">
              Contact Concierge
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};
