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
  const [openFilters, setOpenFilters] = useState<string[]>(['categories', 'price', 'colors', 'sizes', 'features']);
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
      window.scrollTo(0, 0);
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
      <div className="border-b border-gray-100 py-3">
        <button 
          onClick={() => toggleFilter(id)}
          className="w-full flex justify-between items-center text-[10px] sm:text-[11px] font-black uppercase tracking-[0.1em] text-gray-900"
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
    <main className="bg-white min-h-screen font-outfit pt-10 md:pt-16 selection:bg-black selection:text-white">
      {/* Centered Minimal Title */}
      <div className="container mx-auto px-6 mb-12 md:mb-20">
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-black text-center uppercase tracking-[0.2em] text-[#111]"
        >
          {slug === 'luggage' ? 'ALL LUGGAGES' : (currentCategory?.subtitle || slug.replace('-', ' '))}
        </motion.h1>
      </div>

      <div className="container mx-auto px-6 md:px-12 pb-24">
        {/* Sort Bar (Top Right) */}
        <div className="flex justify-end mb-8 md:mb-12">
            <div className="flex items-center gap-4 bg-white border border-gray-100 px-4 py-2 hover:border-gray-900 transition-colors">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 md:gap-16">

          {/* Minimalist Sidebar Filters */}
          <aside className="lg:w-64 shrink-0">
            <div className="sticky top-32">
              <h2 className="text-[12px] font-black uppercase tracking-[0.2em] mb-6 border-b border-gray-900 pb-2">Filters</h2>
              
              {subcategories.length > 0 && (
                <FilterSection id="subcategories" title="Product Type">
                  <div className="space-y-3">
                    {subcategories.map(sub => (
                      <label key={sub.id} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={selectedSubcategories.includes(sub.slug)}
                          onChange={() => setSelectedSubcategories(prev => 
                            prev.includes(sub.slug) ? prev.filter(s => s !== sub.slug) : [...prev, sub.slug]
                          )}
                        />
                        <div className={`w-3 h-3 border transition-colors ${selectedSubcategories.includes(sub.slug) ? 'bg-black border-black' : 'border-gray-200 group-hover:border-black'}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${selectedSubcategories.includes(sub.slug) ? 'text-black' : 'text-gray-400 group-hover:text-black'}`}>
                          {sub.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </FilterSection>
              )}

              <FilterSection id="gender" title="Style / Gender">
                <div className="space-y-3">
                  {['Unisex', 'Men', 'Women', 'Kids'].map(g => (
                    <label key={g} className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-3 h-3 border border-gray-200 rounded-sm group-hover:border-black transition-colors" />
                      <span className="text-[10px] font-bold text-gray-400 group-hover:text-black uppercase tracking-widest transition-colors">{g}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              <FilterSection id="features" title="Features">
                <div className="space-y-3">
                  {['Waterproof', 'Expandable', 'TSA Lock', 'Anti-Theft'].map(feature => (
                    <label key={feature} className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-3 h-3 border border-gray-200 rounded-sm group-hover:border-black transition-colors" />
                      <span className="text-[10px] font-bold text-gray-400 group-hover:text-black uppercase tracking-widest transition-colors">{feature}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              <FilterSection id="sizes" title="Sizes">
                <div className="space-y-3">
                  {['Small / Cabin', 'Medium / Check-in', 'Large'].map(size => (
                    <label key={size} className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-3 h-3 border border-gray-200 rounded-sm group-hover:border-black transition-colors" />
                      <span className="text-[10px] font-bold text-gray-400 group-hover:text-black uppercase tracking-widest transition-colors">{size}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>
            </div>
          </aside>

          {/* Product Feed */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                   {[...Array(6)].map((_, i) => (
                     <div key={i} className="aspect-[4/5] bg-gray-50 animate-pulse" />
                   ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                <motion.div
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-20 md:gap-y-32"
                >
                  {filteredProducts.map((product, idx) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="text-center"
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="py-40 text-center border-t border-gray-100">
                  <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">No results found.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
};
