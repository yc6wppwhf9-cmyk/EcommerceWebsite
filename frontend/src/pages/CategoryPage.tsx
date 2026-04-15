import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { getCategoryBySlug, CATEGORIES } from '../constants/products';
import { api } from '../lib/api';
import { Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Filter, ChevronRight, X, SlidersHorizontal, ArrowLeft } from 'lucide-react';

export const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const [priceRange, setPriceRange] = useState<number>(10000);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [openFilters, setOpenFilters] = useState<string[]>(['categories', 'price']);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const slug = category || 'backpacks';
  const currentCategory = getCategoryBySlug(slug);

  const isGenderFilter = ['men', 'women', 'kids'].includes(slug);
  const isPremiumFilter = slug === 'premium';

  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    setIsLoading(true);
    const params: Record<string, string> = {};
    if (isGenderFilter) params.gender = slug;
    else if (isPremiumFilter) params.isPremium = 'true';
    else params.category = slug;

    api.getProducts(params).then(res => {
      setAllProducts(res.products as unknown as Product[]);
      setIsLoading(false);
      window.scrollTo(0, 0); // Reset scroll on category change
    }).catch(() => setIsLoading(false));
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
      <div className="border-b border-gray-100 py-6">
        <button 
          onClick={() => toggleFilter(id)}
          className="w-full flex justify-between items-center text-[10px] font-black uppercase tracking-[0.25em] text-gray-900"
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
              <div className="pt-6 pb-2">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <main className="bg-white min-h-screen font-outfit">
      {/* Premium Hero Banner */}
      <section 
        className="relative pt-32 pb-24 md:pt-48 md:pb-40 overflow-hidden" 
        style={{ backgroundColor: currentCategory?.bgColor || '#f9f9f9' }}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 p-20 scale-150 rotate-12">
            <img src={currentCategory?.image} alt="" className="w-[800px] h-auto object-contain blur-sm grayscale" />
          </div>
        </div>

        <div className="container mx-auto px-6 md:px-8 relative z-10 flex flex-col md:flex-row items-end justify-between gap-8">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-6"
            >
              <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-[#14052b]/50 hover:text-[#14052b] transition-colors">Home</Link>
              <ChevronRight size={10} className="text-[#14052b]/20" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#14052b]">Shop</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-8xl font-black uppercase tracking-[-0.04em] leading-[0.85] text-[#14052b] mb-8"
            >
              {currentCategory?.subtitle || currentCategory?.title || slug.replace('-', ' ')}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm md:text-lg font-medium text-[#14052b]/60 leading-relaxed max-w-lg"
            >
              {currentCategory?.description || 'Crafted for durability and style, our collection redefined the standards of premium travel gear.'}
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hidden lg:block w-72 h-72 rounded-[3rem] overflow-hidden shadow-2xl bg-white/30 backdrop-blur-xl border border-white/40 p-10"
          >
             <img src={currentCategory?.image} alt={slug} className="w-full h-full object-contain filter drop-shadow-2xl" />
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-8 py-12 md:py-24">
        <div className="flex flex-col lg:flex-row gap-12 md:gap-20">

          {/* Sidebar Filters */}
          <aside className="hidden lg:block lg:w-72 shrink-0">
            <div className="sticky top-32">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#14052b]">Refine By</h3>
                {(selectedSubcategories.length > 0 || priceRange < 10000) && (
                  <button 
                    onClick={() => { setSelectedSubcategories([]); setPriceRange(10000); }}
                    className="text-[10px] font-black uppercase tracking-widest text-[#14052b]/50 hover:text-red-500 transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
              
              {subcategories.length > 0 && (
                <FilterSection id="categories" title="Collection">
                  <div className="space-y-4">
                    {subcategories.map(sub => (
                      <label key={sub.slug} className="flex items-center group cursor-pointer">
                        <div className="relative flex items-center">
                          <input 
                            type="checkbox" 
                            checked={selectedSubcategories.includes(sub.slug)}
                            onChange={() => setSelectedSubcategories(prev => prev.includes(sub.slug) ? prev.filter(s => s !== sub.slug) : [...prev, sub.slug])}
                            className="peer sr-only" 
                          />
                          <div className="w-5 h-5 border-2 border-gray-100 rounded-md peer-checked:bg-[#14052b] peer-checked:border-[#14052b] transition-all duration-300" />
                          <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 left-1 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="ml-4 text-xs font-bold text-gray-500 group-hover:text-black transition-colors">{sub.subtitle || sub.slug}</span>
                      </label>
                    ))}
                  </div>
                </FilterSection>
              )}

              <FilterSection id="price" title="Price Range">
                <div className="space-y-8">
                  <div className="flex justify-between items-center bg-gray-50 rounded-2xl p-4">
                    <div className="text-center flex-1">
                       <span className="text-[9px] block text-gray-400 font-black uppercase mb-1">Max Budget</span>
                       <span className="text-sm font-black text-[#14052b]">Rs. {priceRange.toLocaleString()}</span>
                    </div>
                  </div>
                  <input 
                    type="range" min="400" max="10000" step="100"
                    value={priceRange} onChange={(e) => setPriceRange(parseInt(e.target.value))}
                    className="w-full accent-[#14052b] h-1.5 bg-gray-100 rounded-lg cursor-pointer"
                  />
                </div>
              </FilterSection>
              
              <div className="mt-12 p-8 rounded-[2rem] bg-gray-50 border border-gray-100">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#14052b] mb-4">Need Help?</p>
                <p className="text-[11px] font-medium text-gray-400 mb-6">Our product experts are available 24/7 to help you find the perfect bag.</p>
                <Link to="/contact" className="text-[11px] font-black uppercase tracking-widest text-[#14052b] inline-flex items-center gap-2 group">
                  Chat Now <ArrowLeft size={14} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </aside>

          {/* Product Feed */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div>
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#14052b]/30">{filteredProducts.length} MASTERPIECES FOUND</span>
              </div>
              
              <div className="flex items-center gap-4 self-end md:self-auto">
                <div className="relative group">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-gray-100 px-6 py-3 pr-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#14052b] outline-none hover:border-[#14052b] transition-all cursor-pointer"
                  >
                    <option value="newest">Sort: Default</option>
                    <option value="price-low">Sort: Price Low-High</option>
                    <option value="price-high">Sort: Price High-Low</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>

                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden flex items-center justify-center gap-2 bg-[#14052b] text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest"
                >
                  <SlidersHorizontal size={14} /> Filters
                </button>
              </div>
            </div>

            {/* Grid */}
            <AnimatePresence mode="wait">
              {isLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
                   {[...Array(6)].map((_, i) => (
                     <div key={i} className="aspect-[4/5] bg-gray-50 animate-pulse rounded-[2.5rem]" />
                   ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                <motion.div
                  layout
                  className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-12 md:gap-x-10 md:gap-y-20"
                >
                  {filteredProducts.map((product, idx) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-40 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100"
                >
                  <p className="text-gray-400 font-black uppercase tracking-widest text-[11px] mb-2">Inventory Empty</p>
                  <p className="text-[13px] font-medium text-gray-400">Try adjusting your filters to find your perfect bag.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#14052b]/40 backdrop-blur-sm z-[100]"
              onClick={() => setMobileFilterOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white z-[110] rounded-t-[3rem] shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-sm font-black uppercase tracking-widest">Filters</span>
                <button onClick={() => setMobileFilterOpen(false)} className="w-10 h-10 bg-gray-50 flex items-center justify-center rounded-full"><X size={18} /></button>
              </div>
              
              <div className="space-y-10">
                {subcategories.length > 0 && (
                   <div className="space-y-4">
                     <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Collection</p>
                     <div className="flex flex-wrap gap-2">
                       {subcategories.map(sub => (
                         <button 
                           key={sub.slug}
                           onClick={() => setSelectedSubcategories(prev => prev.includes(sub.slug) ? prev.filter(s => s !== sub.slug) : [...prev, sub.slug])}
                           className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedSubcategories.includes(sub.slug) ? 'bg-[#14052b] text-white' : 'bg-gray-50 text-gray-400'}`}
                         >
                           {sub.subtitle || sub.slug}
                         </button>
                       ))}
                     </div>
                   </div>
                )}

                <div className="space-y-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Price Range</p>
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <p className="text-xl font-black mb-4">Rs. {priceRange.toLocaleString()}</p>
                    <input 
                      type="range" min="400" max="10000" step="100"
                      value={priceRange} onChange={(e) => setPriceRange(parseInt(e.target.value))}
                      className="w-full accent-[#14052b]"
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setMobileFilterOpen(false)} 
                className="w-full bg-[#14052b] text-white py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] mt-12"
              >
                Apply Filters
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
};
