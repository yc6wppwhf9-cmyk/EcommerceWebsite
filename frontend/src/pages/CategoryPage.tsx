import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { getCategoryBySlug, CATEGORIES } from '../constants/products';
import { api } from '../lib/api';
import { Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Filter, ChevronRight, X, SlidersHorizontal } from 'lucide-react';

export const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const [priceRange, setPriceRange] = useState<number>(10000);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [openFilters, setOpenFilters] = useState<string[]>(['categories', 'price', 'specifications']);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const slug = category || 'backpacks';
  const currentCategory = getCategoryBySlug(slug);

  const isGenderFilter = ['men', 'women', 'kids'].includes(slug);
  const isPremiumFilter = slug === 'premium';

  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (isGenderFilter) params.gender = slug;
    else if (isPremiumFilter) params.isPremium = 'true';
    else params.category = slug;

    api.getProducts(params).then(res => {
      setAllProducts(res.products as unknown as Product[]);
    }).catch(() => {});
  }, [slug, isGenderFilter, isPremiumFilter]);

  const filteredProducts = useMemo(() => {
    let result = allProducts.filter(product => {
      const matchesPrice = product.price <= priceRange;
      const matchesSub = selectedSubcategories.length === 0 || selectedSubcategories.includes(product.category);
      return matchesPrice && matchesSub;
    });
    
    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    
    return result;
  }, [allProducts, priceRange, sortBy, selectedSubcategories]);

  const subcategories = useMemo(() => {
    return CATEGORIES.filter(c => c.parentCategory === slug);
  }, [slug]);

  const toggleFilter = (id: string) => {
    setOpenFilters(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const FilterSection = ({ id, title, children }: { id: string, title: string, children: React.ReactNode }) => {
    const isOpen = openFilters.includes(id);
    return (
      <div className="border-b border-gray-100 py-4">
        <button 
          onClick={() => toggleFilter(id)}
          className="w-full flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-gray-900"
        >
          {title}
          <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 pb-2">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <main className="bg-white min-h-screen font-outfit pt-4 md:pt-8">
      {/* Category Header */}
      <div className="py-4 md:py-6 border-b border-gray-50">
        <div className="container mx-auto px-4 md:px-8">
           <h1 className="text-xl md:text-3xl font-black text-center uppercase tracking-[0.1em] md:tracking-[0.2em] text-[#14052b]">
             {category === 'junior' ? 'PRIORITY JUNIOR' :
              (isGenderFilter ? `FOR ${slug}` :
              (currentCategory ? (currentCategory.subtitle || currentCategory.title) : slug.replace('-', ' ')))}
           </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-6 md:py-12">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-12">

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center justify-center gap-2 w-full py-3 border border-gray-200 rounded-xl text-[11px] font-bold uppercase tracking-widest text-gray-700"
          >
            <SlidersHorizontal size={14} /> Filters
          </button>

          {/* Mobile Filter Drawer */}
          <AnimatePresence>
            {mobileFilterOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/40 z-[80] lg:hidden"
                  onClick={() => setMobileFilterOpen(false)}
                />
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                  className="fixed left-0 top-0 h-full w-[85%] max-w-[320px] bg-white z-[90] shadow-2xl overflow-y-auto lg:hidden"
                >
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <span className="text-sm font-black uppercase tracking-widest">Filters</span>
                    <button onClick={() => setMobileFilterOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
                  </div>
                  <div className="px-5 py-4">
                    {subcategories.length > 0 && (
                      <FilterSection id="categories" title="Collection">
                        <div className="space-y-2">
                          {subcategories.map(sub => (
                            <label key={sub.slug} className="flex items-center gap-3 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={selectedSubcategories.includes(sub.slug)}
                                onChange={() => setSelectedSubcategories(prev => prev.includes(sub.slug) ? prev.filter(s => s !== sub.slug) : [...prev, sub.slug])}
                                className="w-4 h-4 border-gray-300 rounded accent-[#14052b]"
                              />
                              <span className="text-[12px] font-medium text-gray-600">{sub.subtitle || sub.slug}</span>
                            </label>
                          ))}
                        </div>
                      </FilterSection>
                    )}
                    <FilterSection id="price" title="Price Range">
                      <div className="px-1 py-2">
                        <div className="flex justify-between items-center mb-6">
                          <div className="bg-gray-50 px-3 py-1.5 rounded border border-gray-100">
                            <span className="text-[10px] block text-gray-400 font-bold uppercase mb-0.5">Min</span>
                            <span className="text-[12px] font-black tracking-tight">Rs. 400</span>
                          </div>
                          <div className="w-4 h-[1px] bg-gray-200"></div>
                          <div className="bg-gray-50 px-3 py-1.5 rounded border border-gray-100 text-right">
                            <span className="text-[10px] block text-gray-400 font-bold uppercase mb-0.5">Max</span>
                            <span className="text-[12px] font-black tracking-tight">Rs. {priceRange.toLocaleString()}</span>
                          </div>
                        </div>
                        <input type="range" min="400" max="10000" step="100" value={priceRange} onChange={(e) => setPriceRange(parseInt(e.target.value))} className="w-full cursor-pointer" />
                      </div>
                    </FilterSection>
                  </div>
                  <div className="px-5 py-4 border-t border-gray-100">
                    <button onClick={() => setMobileFilterOpen(false)} className="w-full bg-[#14052b] text-white py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-widest">Apply Filters</button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Filters Sidebar (Desktop) */}
          <aside className="hidden lg:block lg:w-64 shrink-0 space-y-8">
            <div>
              <h3 className="text-[12px] font-black uppercase tracking-[0.2em] border-b border-gray-900 pb-2 mb-4">Filters</h3>
              
              {subcategories.length > 0 && (
                <FilterSection id="categories" title="Collection">
                  <div className="space-y-2">
                    {subcategories.map(sub => (
                      <label key={sub.slug} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={selectedSubcategories.includes(sub.slug)}
                          onChange={() => {
                            setSelectedSubcategories(prev => 
                              prev.includes(sub.slug) ? prev.filter(s => s !== sub.slug) : [...prev, sub.slug]
                            );
                          }}
                          className="w-4 h-4 border-gray-300 rounded accent-[#14052b]" 
                        />
                        <span className="text-[12px] font-medium text-gray-600 group-hover:text-black transition-colors">{sub.subtitle || sub.slug}</span>
                      </label>
                    ))}
                  </div>
                </FilterSection>
              )}

              <FilterSection id="price" title="Price Range">
                <div className="px-1 py-2">
                  <div className="flex justify-between items-center mb-6">
                    <div className="bg-gray-50 px-3 py-1.5 rounded border border-gray-100">
                       <span className="text-[10px] block text-gray-400 font-bold uppercase mb-0.5">Min</span>
                       <span className="text-[12px] font-black tracking-tight">Rs. 400</span>
                    </div>
                    <div className="w-4 h-[1px] bg-gray-200"></div>
                    <div className="bg-gray-50 px-3 py-1.5 rounded border border-gray-100 text-right">
                       <span className="text-[10px] block text-gray-400 font-bold uppercase mb-0.5">Max</span>
                       <span className="text-[12px] font-black tracking-tight">Rs. {priceRange.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <input 
                    type="range" 
                    min="400" 
                    max="10000" 
                    step="100"
                    value={priceRange}
                    onChange={(e) => setPriceRange(parseInt(e.target.value))}
                    className="w-full cursor-pointer"
                  />
                  
                  <p className="mt-4 text-[9px] font-bold text-gray-400 uppercase tracking-widest text-center">
                    Showing products up to Rs. {priceRange.toLocaleString()}
                  </p>
                </div>
              </FilterSection>

              {/* Dynamic Specifications Filter */}
              <FilterSection id="specifications" title="Specifications">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</p>
                    {slug === 'luggage' ? (
                       ['Hard Shell', 'Soft Shell'].map(type => (
                         <label key={type} className="flex items-center gap-3 cursor-pointer group">
                           <input type="checkbox" className="w-4 h-4 border-gray-300 rounded accent-[#14052b]" />
                           <span className="text-[12px] font-medium text-gray-600 group-hover:text-black transition-colors">{type}</span>
                         </label>
                       ))
                    ) : (
                       ['Daily Use', 'Travel', 'Professional'].map(type => (
                        <label key={type} className="flex items-center gap-3 cursor-pointer group">
                          <input type="checkbox" className="w-4 h-4 border-gray-300 rounded accent-[#14052b]" />
                          <span className="text-[12px] font-medium text-gray-600 group-hover:text-black transition-colors">{type}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </FilterSection>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1">
            {/* Sort Bar */}
            <div className="flex justify-between items-center mb-6 md:mb-8">
              <span className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-wider md:tracking-widest">{filteredProducts.length} Products</span>
              <div className="flex items-center gap-2 md:gap-4 bg-gray-50 border border-gray-100 px-3 md:px-4 py-2 rounded-lg">
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-[10px] md:text-[11px] font-bold uppercase tracking-wider md:tracking-widest outline-none cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            <AnimatePresence mode="wait">
              {filteredProducts.length > 0 ? (
                <motion.div
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-6 md:gap-x-8 md:gap-y-12 pb-20 md:pb-0"
                >
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </motion.div>
              ) : (
                <div className="py-40 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No products found matching your inventory path.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
};
