import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { getCategoryBySlug, CATEGORIES } from '../constants/products';
import { api } from '../lib/api';
import { Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, X, SlidersHorizontal, LayoutGrid, AlignJustify } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { SEO } from '../components/SEO';

const PAGE_LIMIT = 20;
const NO_PRICE_FILTER = 999999;

export const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const [searchParams] = useSearchParams();
  const themeParam = searchParams.get('theme') ?? undefined;

  const slug = category || 'backpacks';
  const currentCategory = getCategoryBySlug(slug);
  const parentCategory = currentCategory?.parentCategory
    ? getCategoryBySlug(currentCategory.parentCategory)
    : null;

  const isGenderFilter = ['men', 'women', 'kids'].includes(slug);
  const isPremiumFilter = slug === 'premium';

  // Products & pagination
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Filters
  const [priceRange, setPriceRange] = useState<number>(NO_PRICE_FILTER);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [openFilters, setOpenFilters] = useState<string[]>(['subcategories', 'price', 'gender', 'sizes', 'features', 'colors']);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileGridCols, setMobileGridCols] = useState<1 | 2>(2);

  // Subcategories for this slug
  const subcategories = useMemo(() => CATEGORIES.filter(c => c.parentCategory === slug), [slug]);

  // Reset all filters when category changes
  useEffect(() => {
    setSelectedSubcategories([]);
    setSelectedSizes([]);
    setSelectedFeatures([]);
    setSelectedGenders([]);
    setSelectedColors([]);
    setPriceRange(NO_PRICE_FILTER);
    setSortBy('newest');
    setPage(1);
  }, [slug]);

  // Fetch products (replace=true for first load, false for load more)
  const fetchProducts = useCallback(
    async (pageNum: number, replace: boolean) => {
      if (replace) setIsLoading(true);
      else setIsLoadingMore(true);

      const params: Record<string, string> = {
        page: String(pageNum),
        limit: String(PAGE_LIMIT),
      };
      if (themeParam === 'premium') {
        // Premium theme: always fetch by isPremium=true, map slug to sub_category if applicable
        params.isPremium = 'true';
        const premiumSubCatMap: Record<string, string> = {
          luggage: 'premium-luggage',
          backpacks: 'premium-backpacks',
          accessories: 'premium-accessories',
        };
        if (premiumSubCatMap[slug]) params.sub_category = premiumSubCatMap[slug];
      } else if (isGenderFilter) {
        params.gender = slug;
        params.isPremium = 'false';
      } else if (isPremiumFilter) {
        params.isPremium = 'true';
      } else {
        params.category = slug;
        params.isPremium = 'false';
      }

      try {
        const res = await api.getProducts(params);
        const products = res.products as unknown as Product[];
        setHasMore(products.length === PAGE_LIMIT);
        if (replace) {
          setAllProducts(products);
          window.scrollTo(0, 0);
        } else {
          setAllProducts(prev => [...prev, ...products]);
        }
      } catch {
        // noop
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [slug, isGenderFilter, isPremiumFilter, themeParam]
  );

  useEffect(() => {
    fetchProducts(1, true);
  }, [fetchProducts]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchProducts(next, false);
  };

  // Derived filter options from loaded products
  const maxPrice = useMemo(() => {
    if (allProducts.length === 0) return 10000;
    return Math.ceil(Math.max(...allProducts.map(p => p.price)) / 500) * 500;
  }, [allProducts]);

  const availableFeatures = useMemo(() => {
    const set = new Set<string>();
    allProducts.forEach(p => (p.features || []).forEach(f => set.add(f)));
    return Array.from(set).sort();
  }, [allProducts]);

  const availableColors = useMemo(() => {
    const map = new Map<string, string>();
    allProducts.forEach(p =>
      (p.variants || []).forEach(v => {
        if (v.color && v.colorCode) map.set(v.color, v.colorCode);
      })
    );
    return Array.from(map.entries()).map(([color, code]) => ({ color, code }));
  }, [allProducts]);

  // Count of active filters
  const activeFilterCount = [
    selectedSubcategories.length,
    selectedSizes.length,
    selectedFeatures.length,
    selectedGenders.length,
    selectedColors.length,
    priceRange < maxPrice ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const clearAllFilters = () => {
    setSelectedSubcategories([]);
    setSelectedSizes([]);
    setSelectedFeatures([]);
    setSelectedGenders([]);
    setSelectedColors([]);
    setPriceRange(NO_PRICE_FILTER);
  };

  // Filtered + sorted products (client-side after fetch)
  const filteredProducts = useMemo(() => {
    let result = allProducts.filter(p => {
      const matchesPrice = priceRange >= NO_PRICE_FILTER || p.price <= priceRange;
      const matchesSub =
        selectedSubcategories.length === 0 ||
        selectedSubcategories.includes((p as any).sub_category ?? p.subcategory ?? '');
      const matchesSize =
        selectedSizes.length === 0 ||
        selectedSizes.some(s => s.toLowerCase() === (p.size ?? '').toLowerCase());
      const matchesFeatures =
        selectedFeatures.length === 0 ||
        selectedFeatures.some(f => (p.features ?? []).includes(f));
      const matchesGender =
        selectedGenders.length === 0 ||
        selectedGenders.map(g => g.toLowerCase()).includes((p.gender ?? '').toLowerCase());
      const matchesColor =
        selectedColors.length === 0 ||
        (p.variants ?? []).some(v => selectedColors.includes(v.color));
      return matchesPrice && matchesSub && matchesSize && matchesFeatures && matchesGender && matchesColor;
    });

    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    return result;
  }, [allProducts, priceRange, sortBy, selectedSubcategories, selectedSizes, selectedFeatures, selectedGenders, selectedColors]);

  const toggleFilterSection = (id: string) =>
    setOpenFilters(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );

  // Reusable checkbox row
  const CheckRow = ({
    label,
    checked,
    onChange,
  }: {
    label: string;
    checked: boolean;
    onChange: () => void;
  }) => (
    <label className="flex items-center gap-3 cursor-pointer group">
      <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
      <div
        className={`w-3 h-3 border transition-colors shrink-0 ${
          checked ? 'bg-black border-black' : 'border-gray-200 group-hover:border-black'
        }`}
      />
      <span
        className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
          checked ? 'text-black' : 'text-gray-400 group-hover:text-black'
        }`}
      >
        {label}
      </span>
    </label>
  );

  // Collapsible filter section
  const FilterSection = ({
    id,
    title,
    children,
  }: {
    id: string;
    title: string;
    children: React.ReactNode;
  }) => {
    const isOpen = openFilters.includes(id);
    return (
      <div className="border-b border-gray-100 py-3">
        <button
          onClick={() => toggleFilterSection(id)}
          className="w-full flex justify-between items-center text-[10px] sm:text-[11px] font-black uppercase tracking-[0.1em] text-gray-900"
        >
          {title}
          <ChevronDown
            size={14}
            className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 pb-2">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // All filter UI — shared between desktop sidebar and mobile funnel
  const filterContent = (
    <div className="space-y-0">
      {subcategories.length > 0 && (
        <FilterSection id="subcategories" title="Product Type">
          <div className="space-y-3">
            {subcategories.map(sub => (
              <CheckRow
                key={sub.id}
                label={sub.title}
                checked={selectedSubcategories.includes(sub.slug)}
                onChange={() =>
                  setSelectedSubcategories(prev =>
                    prev.includes(sub.slug)
                      ? prev.filter(s => s !== sub.slug)
                      : [...prev, sub.slug]
                  )
                }
              />
            ))}
          </div>
        </FilterSection>
      )}

      <FilterSection id="price" title="Price Range">
        <div className="space-y-3">
          <div className="flex justify-between text-[10px] font-black text-gray-700 uppercase tracking-widest">
            <span>₹0</span>
            <span>
              {priceRange >= maxPrice
                ? `Up to ₹${maxPrice.toLocaleString('en-IN')}`
                : `Up to ₹${priceRange.toLocaleString('en-IN')}`}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={maxPrice}
            step={100}
            value={Math.min(priceRange, maxPrice)}
            onChange={e => setPriceRange(Number(e.target.value))}
            className="w-full accent-black h-[2px] cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-gray-300 font-bold uppercase tracking-widest">
            <span>Min</span>
            <span>Max ₹{maxPrice.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </FilterSection>

      <FilterSection id="gender" title="Style / Gender">
        <div className="space-y-3">
          {['Unisex', 'Men', 'Women', 'Kids'].map(g => (
            <CheckRow
              key={g}
              label={g}
              checked={selectedGenders.includes(g)}
              onChange={() =>
                setSelectedGenders(prev =>
                  prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]
                )
              }
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection id="sizes" title="Sizes">
        <div className="space-y-3">
          {[
            { label: 'Small / Cabin', val: 'Small' },
            { label: 'Medium / Check-in', val: 'Medium' },
            { label: 'Large / XL', val: 'Large' },
          ].map(size => (
            <CheckRow
              key={size.val}
              label={size.label}
              checked={selectedSizes.includes(size.val)}
              onChange={() =>
                setSelectedSizes(prev =>
                  prev.includes(size.val)
                    ? prev.filter(s => s !== size.val)
                    : [...prev, size.val]
                )
              }
            />
          ))}
        </div>
      </FilterSection>

      {availableFeatures.length > 0 && (
        <FilterSection id="features" title="Features">
          <div className="space-y-3">
            {availableFeatures.map(feature => (
              <CheckRow
                key={feature}
                label={feature}
                checked={selectedFeatures.includes(feature)}
                onChange={() =>
                  setSelectedFeatures(prev =>
                    prev.includes(feature)
                      ? prev.filter(f => f !== feature)
                      : [...prev, feature]
                  )
                }
              />
            ))}
          </div>
        </FilterSection>
      )}

      {availableColors.length > 0 && (
        <FilterSection id="colors" title="Colors">
          <div className="flex flex-wrap gap-3 pt-1">
            {availableColors.map(({ color, code }) => (
              <button
                key={color}
                title={color}
                onClick={() =>
                  setSelectedColors(prev =>
                    prev.includes(color)
                      ? prev.filter(c => c !== color)
                      : [...prev, color]
                  )
                }
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  selectedColors.includes(color)
                    ? 'border-black scale-110 shadow-md'
                    : 'border-gray-200 hover:border-gray-500'
                }`}
                style={{ backgroundColor: code }}
              />
            ))}
          </div>
        </FilterSection>
      )}
    </div>
  );

  // Page title — fix "ALL LUGGAGES" grammar
  const pageTitle = (() => {
    if (slug === 'luggage') return 'ALL LUGGAGE';
    return currentCategory?.subtitle || slug.replace(/-/g, ' ').toUpperCase();
  })();

  return (
    <>
      <main className="bg-white min-h-screen font-outfit pt-10 md:pt-16 selection:bg-black selection:text-white">
        <SEO
          title={currentCategory?.title || pageTitle}
          description={`Shop ${pageTitle} at Priority Bags. Browse our premium collection with fast delivery across India.`}
          url={`https://prioritybags.in/${slug}`}
        />

        {/* Title + Breadcrumb */}
        <div className="container mx-auto px-4 mb-8 md:mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-black text-center uppercase tracking-[0.2em] text-[#111]"
          >
            {pageTitle}
          </motion.h1>
        </div>

        <div className="container mx-auto px-4 md:px-12 pb-24">
          {/* Top bar: mobile filter button + sort */}
          <div className="flex items-center justify-between mb-8 md:mb-12 gap-3">
            <div className="lg:hidden flex items-center gap-2">
              <button
                className="flex items-center gap-2 px-3 py-2 border border-gray-200 text-[10px] font-black uppercase tracking-widest hover:border-gray-900 transition-colors"
                onClick={() => setMobileFilterOpen(true)}
              >
                <SlidersHorizontal size={13} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1 bg-black text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <div className="flex border border-gray-200">
                <button
                  onClick={() => setMobileGridCols(1)}
                  className={`p-2 transition-colors ${mobileGridCols === 1 ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
                  title="Single column"
                >
                  <AlignJustify size={14} />
                </button>
                <button
                  onClick={() => setMobileGridCols(2)}
                  className={`p-2 transition-colors ${mobileGridCols === 2 ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
                  title="Two columns"
                >
                  <LayoutGrid size={14} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white border border-gray-100 px-4 py-2 hover:border-gray-900 transition-colors ml-auto">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-700 hidden sm:block">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
              </span>
              <span className="text-gray-200 hidden sm:block select-none">|</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* ── Mobile Bottom-Sheet Funnel ── */}
          <AnimatePresence>
            {mobileFilterOpen && (
              <motion.div
                key="mobile-filter-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 lg:hidden"
              >
                {/* Backdrop */}
                <div
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                  onClick={() => setMobileFilterOpen(false)}
                />

                {/* Sheet slides up from bottom */}
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 32, stiffness: 320 }}
                  className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[88vh] flex flex-col"
                >
                  {/* Drag handle */}
                  <div className="flex justify-center pt-3 pb-1 shrink-0">
                    <div className="w-10 h-1 bg-gray-200 rounded-full" />
                  </div>

                  {/* Header */}
                  <div className="flex justify-between items-center px-5 py-3 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-[12px] font-black uppercase tracking-[0.2em]">
                        Filters
                      </h2>
                      {activeFilterCount > 0 && (
                        <span className="bg-black text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                          {activeFilterCount} Active
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setMobileFilterOpen(false)}
                      className="p-1.5 hover:text-red-500 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Scrollable filter body */}
                  <div className="flex-1 overflow-y-auto px-5 py-2">
                    {filterContent}
                  </div>

                  {/* Footer: Clear All + Apply */}
                  <div className="px-5 py-4 border-t border-gray-100 shrink-0 flex gap-3">
                    <button
                      onClick={clearAllFilters}
                      disabled={activeFilterCount === 0}
                      className="flex-1 py-3.5 border border-gray-200 text-[11px] font-black uppercase tracking-widest hover:border-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => setMobileFilterOpen(false)}
                      className="flex-[2] bg-black text-white py-3.5 text-[11px] font-black uppercase tracking-widest hover:bg-gray-900 transition-colors"
                    >
                      Show {filteredProducts.length} Result{filteredProducts.length !== 1 ? 's' : ''}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* ── Desktop Sidebar ── */}
            <aside className="hidden lg:block lg:w-64 shrink-0">
              <div className="sticky top-32">
                <div className="flex justify-between items-center mb-6 border-b border-gray-900 pb-2">
                  <h2 className="text-[12px] font-black uppercase tracking-[0.2em]">Filters</h2>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                    >
                      Clear All ({activeFilterCount})
                    </button>
                  )}
                </div>
                {filterContent}
              </div>
            </aside>

            {/* ── Product Grid ── */}
            <div className="flex-1">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <div
                    key="skeleton"
                    className={`grid ${mobileGridCols === 1 ? 'grid-cols-1' : 'grid-cols-2'} lg:grid-cols-3 gap-x-4 sm:gap-x-8 gap-y-10 md:gap-y-16`}
                  >
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="aspect-[4/5] bg-gray-50 animate-pulse rounded" />
                    ))}
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <motion.div
                    key="grid"
                    layout
                    className={`grid ${mobileGridCols === 1 ? 'grid-cols-1' : 'grid-cols-2'} sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-8 lg:gap-x-10 gap-y-10 md:gap-y-20 lg:gap-y-28`}
                  >
                    {filteredProducts.map((product, idx) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: Math.min(idx, 9) * 0.05 }}
                        className="text-center"
                      >
                        <ProductCard product={product} theme={themeParam} />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <div key="empty" className="py-40 text-center border-t border-gray-100">
                    <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">
                      No results found.
                    </p>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={clearAllFilters}
                        className="mt-4 text-[10px] font-black uppercase tracking-widest text-black underline underline-offset-4"
                      >
                        Clear All Filters
                      </button>
                    )}
                  </div>
                )}
              </AnimatePresence>

              {/* Load More */}
              {!isLoading && hasMore && filteredProducts.length > 0 && (
                <div className="flex justify-center mt-16">
                  <button
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    className="px-10 py-4 border border-gray-900 text-[11px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isLoadingMore ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {themeParam === 'premium' && (
        <footer className="w-full leading-[0]">
          <img
            src="/Traworld/Footer.png"
            alt="Premium Travel"
            className="w-full h-auto block"
          />
        </footer>
      )}
    </>
  );
};
