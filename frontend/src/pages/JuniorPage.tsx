import React, { useState, useMemo, useEffect } from 'react';
import { ProductCard } from '../components/ProductCard';
import { api } from '../lib/api';
import { Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Sparkles } from 'lucide-react';

export const JuniorPage = () => {
  const [priceRange, setPriceRange] = useState<number>(10000);
  const [sortBy, setSortBy] = useState('newest');
  const [openFilters, setOpenFilters] = useState<string[]>(['price', 'age']);

  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    api.getProducts({ category: 'school-backpacks' }).then(res => {
      if (res.success) setAllProducts(res.data as unknown as Product[]);
    }).catch(() => {});
  }, []);

  const filteredProducts = useMemo(() => {
    let result = allProducts.filter(product => product.price <= priceRange);
    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    return result;
  }, [allProducts, priceRange, sortBy]);

  const toggleFilter = (id: string) => {
    setOpenFilters(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const FilterSection = ({ id, title, children }: { id: string, title: string, children: React.ReactNode }) => {
    const isOpen = openFilters.includes(id);
    return (
      <div className="border-b border-gray-100 py-4">
        <button 
          onClick={() => toggleFilter(id)}
          className="w-full flex justify-between items-center text-[11px] font-semibold uppercase tracking-widest text-gray-900"
        >
          {title}
          <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="pt-4 pb-2">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <main className="bg-white min-h-screen font-outfit pt-8">
      {/* Junior Hero / Banner */}
      <div className="container mx-auto px-8 mb-12">
        <div className="relative h-[400px] w-full bg-[#f4f7ff] rounded-[2rem] overflow-hidden flex items-center px-16 border border-[#e0e7ff]">
          <div className="max-w-md relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 bg-priority-blue rounded-full flex items-center justify-center text-white">
                <Sparkles size={16} />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-priority-blue">Junior Collection</span>
            </div>
            <h1 className="text-5xl font-semibold text-[#14052b] uppercase tracking-tighter leading-[0.9] mb-6">
              Small Gear<br />Big Adventures
            </h1>
            <p className="text-gray-500 font-medium text-sm leading-relaxed mb-8">
              Discover the Priority Junior collection. Ergonomically designed, incredibly durable, and built for the next generation of explorers.
            </p>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-white/40 to-transparent pointer-events-none"></div>
          <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-[#4b48b5]/5 rounded-full blur-3xl"></div>
        </div>
      </div>

      <div className="container mx-auto px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Filters Sidebar */}
          <aside className="lg:w-64 shrink-0 space-y-8">
            <div>
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.2em] border-b border-gray-900 pb-2 mb-4">Filters</h3>
              
              <FilterSection id="age" title="Age Group">
                <div className="space-y-2">
                  {['3-6 Years', '7-12 Years', 'Teens'].map(age => (
                    <label key={age} className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 border-gray-300 rounded accent-priority-blue" />
                      <span className="text-[12px] font-medium text-gray-600 group-hover:text-black transition-colors">{age}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              <FilterSection id="price" title="Price Range">
                <div className="px-1 py-2">
                  <div className="flex justify-between items-center mb-6">
                    <div className="bg-gray-50 px-3 py-1.5 rounded border border-gray-100">
                       <span className="text-[10px] block text-gray-400 font-semibold uppercase mb-0.5">Min</span>
                       <span className="text-[12px] font-semibold tracking-tight">Rs. 400</span>
                    </div>
                    <div className="w-4 h-[1px] bg-gray-200"></div>
                    <div className="bg-gray-50 px-3 py-1.5 rounded border border-gray-100 text-right">
                       <span className="text-[10px] block text-gray-400 font-semibold uppercase mb-0.5">Max</span>
                       <span className="text-[12px] font-semibold tracking-tight">Rs. {priceRange.toLocaleString()}</span>
                    </div>
                  </div>
                  <input type="range" min="400" max="10000" step="100" value={priceRange} onChange={(e) => setPriceRange(parseInt(e.target.value))} className="w-full cursor-pointer" />
                </div>
              </FilterSection>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-8">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">{filteredProducts.length} Junior Essentials</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-gray-50 border border-gray-100 px-4 py-2 rounded-lg text-[11px] font-semibold uppercase tracking-widest outline-none cursor-pointer">
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            <AnimatePresence mode="wait">
              <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
};
