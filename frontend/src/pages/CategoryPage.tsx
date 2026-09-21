import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { getCategoryBySlug, CATEGORIES } from '../constants/products';
import { api } from '../lib/api';
import { Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, X, SlidersHorizontal, LayoutGrid, AlignJustify, Check } from 'lucide-react';
import { SEO } from '../components/SEO';
import { resolveProductColors, resolveProductAgeRange, isJuniorProduct, AGE_RANGE_OPTIONS } from '../utils/productFilters';

const PAGE_LIMIT = 20;
const NO_PRICE_FILTER = 999999;

const CATEGORY_BANNERS: Record<string, { image: string; alt: string }> = {
  'trekking-backpacks': {
    image: '/Category/Trekking_Backpacks_Banner.png',
    alt: 'Trekking Backpacks — Explore Beyond The Limits',
  },
  'trekking': {
    image: '/Category/Trekking_Backpacks_Banner.png',
    alt: 'Trekking Backpacks — Explore Beyond The Limits',
  },
  'college-backpacks': {
    image: '/Category/Campus_Backpacks_Banner.png',
    alt: 'College & Campus Backpacks — Carry The Style Your Way',
  },
  'college': {
    image: '/Category/Campus_Backpacks_Banner.png',
    alt: 'College & Campus Backpacks — Carry The Style Your Way',
  },
  'campus': {
    image: '/Category/Campus_Backpacks_Banner.png',
    alt: 'College & Campus Backpacks — Carry The Style Your Way',
  },
  'laptop-backpacks': {
    image: '/Category/Laptop_Backpacks_Banner.png',
    alt: 'Executive Laptop Backpacks — Built For Every Journey',
  },
  'laptop': {
    image: '/Category/Laptop_Backpacks_Banner.png',
    alt: 'Executive Laptop Backpacks — Built For Every Journey',
  },
  'duffle': {
    image: '/Category/Duffle_Bags_Banner.jpg',
    alt: 'Duffle Bags — Versatile & Stylish For Every Journey',
  },
  'duffle-bags': {
    image: '/Category/Duffle_Bags_Banner.jpg',
    alt: 'Duffle Bags — Versatile & Stylish For Every Journey',
  },
  'luggage': {
    image: '/Category/Luggage_Trolley_Banner.jpg',
    alt: 'Premium Luggage & Trolley Bags — Travel In Style',
  },
  'travel': {
    image: '/Category/Luggage_Trolley_Banner.jpg',
    alt: 'Premium Luggage & Trolley Bags — Travel In Style',
  },
  'trolley': {
    image: '/Category/Luggage_Trolley_Banner.jpg',
    alt: 'Premium Luggage & Trolley Bags — Travel In Style',
  },
};

export const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const themeParam = searchParams.get('theme') ?? undefined;
  const ageParam = searchParams.get('age') ?? undefined;

  const slug = category || 'backpacks';
  const currentCategory = getCategoryBySlug(slug);
  const parentCategory = currentCategory?.parentCategory
    ? getCategoryBySlug(currentCategory.parentCategory)
    : null;

  const isGenderFilter = ['men', 'women', 'kids'].includes(slug);
  const isPremiumFilter = slug === 'premium';

  // If theme is premium, TRAWORLD only supports luggage, backpacks, and duffle.
  // Any other category (pouch, daypack, lunch-bag, tote-bag, accessories, etc.) auto-redirects to /premium.
  useEffect(() => {
    if (themeParam === 'premium') {
      const allowedPremiumSlugs = ['luggage', 'backpacks', 'duffle', 'premium-luggage', 'premium-backpacks', 'premium-duffle', 'premium'];
      if (!allowedPremiumSlugs.includes(slug)) {
        navigate('/premium', { replace: true });
      }
    }
  }, [themeParam, slug, navigate]);

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
  const [selectedAgeRanges, setSelectedAgeRanges] = useState<string[]>(ageParam ? [ageParam] : []);
  const [openFilters, setOpenFilters] = useState<string[]>(['subcategories', 'age', 'price', 'gender', 'sizes', 'features', 'colors']);
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
    setSelectedAgeRanges(ageParam ? [ageParam] : []);
    setPriceRange(NO_PRICE_FILTER);
    setSortBy('newest');
    setPage(1);
  }, [slug, ageParam]);

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
        params.isPremium = 'true';
        if (slug === 'luggage' || slug === 'premium-luggage') {
          params.category = 'luggage';
        } else if (slug === 'backpacks' || slug === 'premium-backpacks') {
          params.category = 'backpacks';
        } else if (slug === 'accessories' || slug === 'premium-accessories') {
          params.category = 'accessories';
        } else if (slug === 'duffle' || slug === 'premium-duffle') {
          params.category = 'duffle';
        } else {
          params.category = slug;
        }
      } else if (themeParam === 'junior') {
        // Junior sub-pages: fetch by category=junior + sub_category
        params.category = 'junior';
        params.isPremium = 'false';
        if (slug === 'school-backpacks') {
          params.sub_category = 'school-backpacks';
        } else if (slug === 'kids-trolley') {
          params.sub_category = 'kids-trolley';
        } else if (slug === 'trolley-backpacks') {
          params.sub_category = 'trolley-backpacks';
        } else if (slug === 'combo-set') {
          params.sub_category = 'combo-set';
        } else {
          const juniorCat = getCategoryBySlug(slug);
          if (juniorCat?.parentCategory === 'junior' && slug !== 'junior') {
            params.sub_category = slug;
          }
        }
      } else if (isGenderFilter) {
        params.gender = slug;
        params.isPremium = 'false';
      } else if (isPremiumFilter) {
        params.isPremium = 'true';
      } else if (slug === 'kids-trolley') {
        params.category = 'junior';
        params.sub_category = 'kids-trolley';
        params.isPremium = 'false';
      } else if (slug === 'trolley-backpacks') {
        params.category = 'junior';
        params.sub_category = 'trolley-backpacks';
        params.isPremium = 'false';
      } else {
        params.category = slug;
        params.isPremium = 'false';
      }

      try {
        const res = await api.getProducts(params);
        let products = res.products as unknown as Product[];
        if (themeParam === 'premium') {
          if (slug === 'duffle' || slug === 'premium-duffle') {
            try {
              const cultRes = await api.getProducts({ search: 'Cult', limit: '20' });
              const cults = (cultRes.products as unknown as Product[]) || [];
              const merged = [...products, ...cults].filter(
                (p, idx, arr) => idx === arr.findIndex(x => x.id === p.id || x.sku === p.sku)
              );
              products = merged;
            } catch {
              // ignore
            }
          }
          // Strictly exclude Solo series from premium views
          products = products.filter(p =>
            !p.name?.toLowerCase().includes('solo') &&
            !['INV30691', 'INV30692'].includes(p.sku || '')
          );
        }
        if (themeParam === 'junior' || slug === 'junior' || slug === 'kids-trolley' || slug === 'trolley-backpacks' || slug === 'combo-set' || slug === 'school-backpacks') {
          products = products.filter(isJuniorProduct);
        }
        setHasMore(products.length >= PAGE_LIMIT);
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
    [slug, isGenderFilter, isPremiumFilter, themeParam, ageParam] // eslint-disable-line react-hooks/exhaustive-deps
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
    const map = new Map<string, { name: string; code: string; border?: boolean }>();
    allProducts.forEach(p => {
      const colors = resolveProductColors(p);
      colors.forEach(c => {
        if (!map.has(c.name.toLowerCase())) {
          map.set(c.name.toLowerCase(), c);
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [allProducts]);

  // Genders actually present in the catalog (excludes the default "unisex")
  const availableGenders = useMemo(() => {
    const set = new Set<string>();
    allProducts.forEach(p => {
      const g = (p.gender ?? '').toString().trim().toLowerCase();
      if (g && g !== 'unisex') set.add(g.charAt(0).toUpperCase() + g.slice(1));
    });
    return Array.from(set).sort();
  }, [allProducts]);

  // Sizes actually present in the catalog
  const availableSizes = useMemo(() => {
    const set = new Set<string>();
    allProducts.forEach(p => {
      const sz = (p.size ?? '').toString().trim();
      if (sz) set.add(sz);
    });
    return Array.from(set).sort();
  }, [allProducts]);

  // Check if current category is relevant for Age Range filter (Junior / School / Kids)
  const isJuniorOrSchoolCategory = useMemo(() => {
    return (
      slug === 'junior' ||
      slug === 'school-backpacks' ||
      slug === 'combo-set' ||
      slug === 'trolley-backpacks' ||
      slug === 'kids-trolley' ||
      slug === 'kids' ||
      themeParam === 'junior' ||
      allProducts.some(p => p.gender === 'kids' || (p as any).sub_category === 'school-backpacks' || (p as any).sub_category === 'combo-set' || (p as any).sub_category === 'kids-trolley')
    );
  }, [slug, themeParam, allProducts]);

  // Count of active filters
  const activeFilterCount = [
    selectedSubcategories.length,
    selectedAgeRanges.length,
    selectedSizes.length,
    selectedFeatures.length,
    selectedGenders.length,
    selectedColors.length,
    priceRange < maxPrice ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const clearAllFilters = () => {
    setSelectedSubcategories([]);
    setSelectedAgeRanges([]);
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
      
      // Color matching using smart color resolution
      const productColors = resolveProductColors(p).map(c => c.name.toLowerCase());
      const matchesColor =
        selectedColors.length === 0 ||
        selectedColors.some(sc => productColors.includes(sc.toLowerCase()));

      // Age range matching using smart age resolution
      const productAge = resolveProductAgeRange(p);
      const matchesAge =
        selectedAgeRanges.length === 0 ||
        selectedAgeRanges.some(ar => ar.toLowerCase() === productAge.toLowerCase() || ((p as any).age_range && (p as any).age_range.toLowerCase().includes(ar.toLowerCase())));

      return matchesPrice && matchesSub && matchesSize && matchesFeatures && matchesGender && matchesColor && matchesAge;
    });

    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    return result;
  }, [allProducts, priceRange, sortBy, selectedSubcategories, selectedAgeRanges, selectedSizes, selectedFeatures, selectedGenders, selectedColors]);

  const toggleFilterSection = (id: string) =>
    setOpenFilters(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );

  // Reusable checkbox row
  const CheckRow = ({
    label,
    detail,
    checked,
    onChange,
  }: {
    label: string;
    detail?: string;
    checked: boolean;
    onChange: () => void;
  }) => (
    <label className="flex items-start gap-3 cursor-pointer group">
      <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
      <div
        className={`w-3.5 h-3.5 border transition-colors shrink-0 mt-0.5 rounded-xs ${
          checked ? 'bg-black border-black' : 'border-gray-200 group-hover:border-black'
        }`}
      />
      <div className="flex flex-col">
        <span
          className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
            checked ? 'text-black' : 'text-gray-500 group-hover:text-black'
          }`}
        >
          {label}
        </span>
        {detail && (
          <span className="text-[9px] text-gray-400 font-normal leading-tight mt-0.5">
            {detail}
          </span>
        )}
      </div>
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
      <div className="border-b border-line py-3">
        <button
          onClick={() => toggleFilterSection(id)}
          className="w-full flex justify-between items-center text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.16em] text-ink"
        >
          {title}
          <ChevronDown
            size={14}
            className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
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

      {/* Age Range Filter for Junior/Kids/School Categories */}
      {isJuniorOrSchoolCategory && (
        <FilterSection id="age" title="Age Range">
          <div className="space-y-3 pt-1">
            {AGE_RANGE_OPTIONS.map(opt => (
              <CheckRow
                key={opt.id}
                label={opt.label}
                detail={opt.detail}
                checked={selectedAgeRanges.includes(opt.label)}
                onChange={() =>
                  setSelectedAgeRanges(prev =>
                    prev.includes(opt.label)
                      ? prev.filter(a => a !== opt.label)
                      : [...prev, opt.label]
                  )
                }
              />
            ))}
          </div>
        </FilterSection>
      )}


      {availableGenders.length > 0 && (
        <FilterSection id="gender" title="Style / Gender">
          <div className="space-y-3">
            {availableGenders.map(g => (
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
      )}

      {availableSizes.length > 0 && (
        <FilterSection id="sizes" title="Sizes">
          <div className="space-y-3">
            {availableSizes.map(size => (
              <CheckRow
                key={size}
                label={size}
                checked={selectedSizes.includes(size)}
                onChange={() =>
                  setSelectedSizes(prev =>
                    prev.includes(size)
                      ? prev.filter(s => s !== size)
                      : [...prev, size]
                  )
                }
              />
            ))}
          </div>
        </FilterSection>
      )}

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
          <div className="flex flex-wrap gap-2.5 pt-1">
            {availableColors.map(({ name, code, border }) => {
              const isSelected = selectedColors.map(c => c.toLowerCase()).includes(name.toLowerCase());
              const isLight = ['white', 'cream', 'light pink', 'yellow', 'beige'].includes(name.toLowerCase());
              return (
                <button
                  key={name}
                  title={name}
                  type="button"
                  aria-label={name}
                  onClick={() =>
                    setSelectedColors(prev =>
                      prev.map(c => c.toLowerCase()).includes(name.toLowerCase())
                        ? prev.filter(c => c.toLowerCase() !== name.toLowerCase())
                        : [...prev, name]
                    )
                  }
                  className={`group relative w-7 h-7 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center ${
                    isSelected
                      ? 'ring-2 ring-offset-2 ring-black dark:ring-white scale-110 shadow-md'
                      : 'hover:scale-110 shadow-2xs hover:shadow-sm'
                  } ${border ? 'border border-gray-300 dark:border-gray-600' : ''}`}
                  style={{ background: code }}
                >
                  {isSelected && (
                    <Check
                      size={12}
                      className={isLight ? 'text-black' : 'text-white'}
                      strokeWidth={3}
                    />
                  )}
                  {/* Tooltip */}
                  <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] font-bold py-0.5 px-2 rounded whitespace-nowrap z-30 shadow">
                    {name}
                  </span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}
    </div>
  );

  // Page title — fix "ALL LUGGAGES" grammar & premium category names
  const pageTitle = (() => {
    if (slug === 'luggage') return themeParam === 'premium' ? 'PREMIUM LUGGAGE' : 'ALL LUGGAGE';
    if (themeParam === 'premium') {
      if (slug === 'backpacks') return 'PREMIUM BACKPACKS';
      if (slug === 'duffle') return 'PREMIUM DUFFLE';
      if (slug === 'accessories') return 'PREMIUM ACCESSORIES';
    }
    return currentCategory?.subtitle || slug.replace(/-/g, ' ').toUpperCase();
  })();

  return (
    <>
      <main className={`bg-bone min-h-screen font-outfit selection:bg-ink selection:text-white ${CATEGORY_BANNERS[slug] ? 'pt-0' : 'pt-3 md:pt-6'}`}>
        <SEO
          title={currentCategory?.title || pageTitle}
          description={`Shop ${pageTitle} at Priority Bags. Browse our premium collection with fast delivery across India.`}
          url={`https://prioritybags.in/${slug}`}
        />

        {/* Title or Category Banner */}
        {CATEGORY_BANNERS[slug] ? (
          <div className="w-full mb-6 md:mb-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative w-full overflow-hidden"
            >
              <h1 className="sr-only">{pageTitle}</h1>
              <img
                src={CATEGORY_BANNERS[slug].image}
                alt={CATEGORY_BANNERS[slug].alt}
                className="w-full h-auto block select-none"
                loading="eager"
                decoding="async"
              />
            </motion.div>
          </div>
        ) : (
          <div className="w-full px-6 md:px-12 mb-4 md:mb-6">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-3xl font-normal text-center uppercase tracking-[0.28em] text-ink"
            >
              {pageTitle}
            </motion.h1>
          </div>
        )}

        <div className="w-full px-4 md:px-8 pb-24">
          {/* Top bar: mobile filter button + sort */}
          <div className="flex items-center justify-between mb-4 md:mb-6 gap-3">
            <div className="lg:hidden flex items-center gap-2">
              <button
                className="flex items-center gap-2 px-4 py-2.5 border border-line bg-white text-[10px] font-medium uppercase tracking-[0.18em] hover:border-ink transition-colors duration-300"
                onClick={() => setMobileFilterOpen(true)}
              >
                <SlidersHorizontal size={13} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1 bg-marine text-white text-[9px] font-medium w-4 h-4 rounded-full flex items-center justify-center">
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

            <div className="flex items-center gap-3 bg-white border border-line px-4 py-2.5 hover:border-ink transition-colors duration-300 ml-auto">
              <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-graphite hidden sm:block">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
              </span>
              <span className="text-gray-200 hidden sm:block select-none">|</span>
              <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate">
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-transparent text-[10px] font-medium uppercase tracking-[0.18em] outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
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
                  className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[88vh] flex flex-col"
                >
                  {/* Drag handle */}
                  <div className="flex justify-center pt-3 pb-1 shrink-0">
                    <div className="w-10 h-1 bg-gray-200 rounded-full" />
                  </div>

                  {/* Header */}
                  <div className="flex justify-between items-center px-5 py-3 border-b border-line shrink-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-[12px] font-medium uppercase tracking-[0.24em]">
                        Filters
                      </h2>
                      {activeFilterCount > 0 && (
                        <span className="bg-marine text-white text-[9px] font-medium px-2 py-0.5 rounded-full">
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
                  <div className="px-5 py-4 border-t border-line shrink-0 flex gap-3">
                    <button
                      onClick={clearAllFilters}
                      disabled={activeFilterCount === 0}
                      className="flex-1 py-3.5 border border-line text-[11px] font-medium uppercase tracking-[0.18em] hover:border-ink transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => setMobileFilterOpen(false)}
                      className="flex-[2] bg-ink text-white py-3.5 text-[11px] font-medium uppercase tracking-[0.18em] hover:bg-marine transition-colors duration-300"
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
            <aside className="hidden lg:block lg:w-56 shrink-0">
              <div className="sticky top-32">
                <div className="flex justify-between items-center mb-6 border-b border-gray-900 pb-2">
                  <h2 className="text-[12px] font-medium uppercase tracking-[0.24em]">Filters</h2>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-[9px] font-medium uppercase tracking-[0.18em] text-slate hover:text-marine transition-colors"
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
                    className={`grid ${mobileGridCols === 1 ? 'grid-cols-1' : 'grid-cols-2'} lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8 md:gap-y-10`}
                  >
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="aspect-[4/5] bg-white border border-line animate-pulse rounded-sm" />
                    ))}
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <motion.div
                    key="grid"
                    layout
                    className={`grid ${mobileGridCols === 1 ? 'grid-cols-1' : 'grid-cols-2'} sm:grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-6 lg:gap-x-8 gap-y-8 md:gap-y-10 lg:gap-y-12`}
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
                  <div key="empty" className="py-40 text-center border-t border-line">
                    <p className="text-slate font-medium uppercase tracking-[0.18em] text-[10px]">
                      No results found.
                    </p>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={clearAllFilters}
                        className="mt-4 text-[10px] font-medium uppercase tracking-[0.18em] text-marine underline underline-offset-4"
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
                    className="px-12 py-4 border border-ink text-[11px] font-medium uppercase tracking-[0.2em] hover:bg-ink hover:text-white transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
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
