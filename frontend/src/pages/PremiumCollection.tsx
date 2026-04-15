import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ProductCard } from '../components/ProductCard';
import { api } from '../lib/api';
import type { Product } from '../types';

export const PremiumCollection = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    api.getProducts({ isPremium: 'true' }).then(res => {
      if (res.success) setProducts(res.data as unknown as Product[]);
    }).catch(() => {});
  }, []);

  return (
    <main className="bg-[#fcf8f1] min-h-screen">
      {/* Editorial Hero */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-priority-dark">
        {/* Abstract luxury background */}
        <div className="absolute inset-0 opacity-40">
           <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-priority-blue rounded-full blur-[120px]" />
           <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#5c83e8] rounded-full blur-[150px]" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-white/60 text-xs font-bold tracking-[0.4em] uppercase mb-6 block">
              The Digital Atelier
            </span>
            <h1 className="text-white font-outfit text-6xl md:text-8xl font-black mb-6 leading-tight uppercase">
              Premium<br /><span className="text-priority-blue">Collection</span>
            </h1>
            <p className="text-white/70 max-w-2xl mx-auto text-sm md:text-base leading-relaxed font-light tracking-wide">
              Excellence defined by craftsmanship. Discover our curated selection of high-end travel gear, 
              engineered for performance and designed for the discerning individual.
            </p>
          </motion.div>
        </div>

        {/* Decorative scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/0 via-white/50 to-white/0" />
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="relative group">
            <div className="absolute -inset-4 bg-priority-blue/5 rounded-2xl scale-95 group-hover:scale-100 transition-transform duration-700" />
            <img 
              src="/Creatives/editorial-5.jpg" 
              alt="Craftsmanship" 
              className="rounded-xl shadow-2xl relative z-10 w-full object-cover h-[500px]"
            />
          </div>
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold font-outfit text-gray-900 leading-tight uppercase">
              Crafted Without <span className="text-priority-blue">Compromise</span>
            </h2>
            <div className="w-20 h-1 bg-priority-blue" />
            <p className="text-gray-600 text-lg leading-relaxed font-light">
              Every piece in the Premium Collection represents the pinnacle of Priority's design philosophy. 
              Using full-grain leathers, aerospace-grade aluminium, and high-density ballistic nylon, 
              we create luggage that doesn't just transport your belongings—it protects your journey.
            </p>
            <ul className="space-y-4">
              {['Italian Full-Grain Leather', 'Reinforced Aluminium Shells', 'YKK® Excella Metal Zippers', 'Lifetime Craftsmanship Warranty'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm font-bold tracking-wider text-gray-800 uppercase">
                  <div className="w-1.5 h-1.5 bg-priority-blue rounded-full" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="bg-white py-24 border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <span className="text-priority-blue font-bold tracking-widest text-xs uppercase mb-2 block">Available Now</span>
              <h2 className="text-3xl md:text-4xl font-bold font-outfit uppercase">The Premium Lineup</h2>
            </div>
            <div className="text-right text-gray-400 text-xs font-bold tracking-widest uppercase">
              {products.length} EXCLUSIVE PIECES
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="relative">
                  <div className="absolute -top-3 -left-3 z-30 bg-black text-white text-[8px] font-black px-2 py-1 tracking-[0.2em] uppercase">
                    PLATINUM
                  </div>
                  <ProductCard product={product} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium CTA */}
      <section className="bg-priority-dark text-white py-24 overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black text-white/[0.03] whitespace-nowrap z-0 pointer-events-none uppercase select-none">
          STAY PRIORITY
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-black font-outfit mb-8 uppercase leading-tight">
            Elevate Your <span className="text-priority-blue">Travel Experience</span>
          </h2>
          <p className="text-white/60 max-w-xl mx-auto mb-10 text-sm md:text-base leading-relaxed tracking-wide">
            Join the inner circle for early access to limited edition drops and bespoke personalisations.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-priority-blue text-white px-10 py-4 font-bold text-xs tracking-widest uppercase rounded-full hover:bg-white hover:text-priority-dark transition-all duration-300">
              Join the Circle
            </button>
            <button className="border border-white/20 text-white px-10 py-4 font-bold text-xs tracking-widest uppercase rounded-full hover:bg-white/10 transition-all duration-300">
              Contact Concierge
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};
