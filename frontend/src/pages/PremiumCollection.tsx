import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ProductCard } from '../components/ProductCard';
import { api } from '../lib/api';
import type { Product } from '../types';
import { ChevronDown, Search, ShoppingBag, User, Heart } from 'lucide-react';
import { SearchModal } from '../components/SearchModal';
import { BrandToggle } from '../components/BrandToggle';

const collectionLinks = [
  { label: 'LUGGAGE', slug: '/luggage?theme=premium' },
  { label: 'BACKPACK', slug: '/backpacks?theme=premium' },
  { label: 'DUFFLE', slug: '/duffle?theme=premium' },
];

const PremiumNav = ({ onSearchOpen }: { onSearchOpen: () => void }) => {
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black h-16 flex items-center justify-between px-4 sm:px-6 md:px-12 border-b border-white/10">
        {/* Desktop Left: Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-white text-[13px] font-medium font-outfit tracking-[0.18em] uppercase hover:opacity-70 transition-opacity">
            HOME
          </Link>
          <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
            <button className="flex items-center gap-1.5 text-white text-[13px] font-medium font-outfit tracking-[0.18em] uppercase hover:opacity-70 transition-opacity">
              COLLECTION <ChevronDown size={12} className={`opacity-70 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18 }}
                  className="absolute top-full left-0 mt-2 w-44 bg-[#111] border border-white/10 shadow-2xl py-2"
                >
                  {collectionLinks.map(item => (
                    <Link
                      key={item.slug}
                      to={item.slug}
                      className="block px-5 py-3 text-[13px] font-medium font-outfit tracking-[0.14em] uppercase text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Desktop Center: Traworld Logo */}
        <div className="hidden md:block absolute left-1/2 -translate-x-1/2">
          <Link to="/premium">
            <img src="/Traworld/nav bar logo.png" alt="Traworld" className="h-6 w-auto" />
          </Link>
        </div>

        {/* Mobile: BrandToggle centered, Menu Button on Right */}
        <div className="flex md:hidden items-center justify-between w-full relative">
          <div className="w-full flex items-center justify-center">
            <BrandToggle size="sm" />
          </div>
          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 text-white hover:opacity-70 transition-opacity p-2"
            onClick={() => setMobileMenuOpen(v => !v)}
            aria-label="Menu"
          >
            <div className="flex flex-col gap-[5px]">
              <span className={`block w-5 h-[1.5px] bg-white transition-transform duration-300 origin-center ${mobileMenuOpen ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
              <span className={`block w-5 h-[1.5px] bg-white transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-[1.5px] bg-white transition-transform duration-300 origin-center ${mobileMenuOpen ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
            </div>
          </button>
        </div>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center gap-3 md:gap-4 justify-end font-outfit">
          <div className="flex items-center mr-1">
            <BrandToggle size="sm" />
          </div>
          <div className="h-5 w-px bg-white/20 mx-1" />
          <div className="flex items-center gap-1">
            <button
              onClick={onSearchOpen}
              className="w-10 h-10 flex items-center justify-center rounded-full text-white transition-all duration-300 opacity-80 hover:opacity-100 hover:bg-white/10"
              aria-label="Search"
            >
              <Search size={18} strokeWidth={1.5} />
            </button>
            <Link
              to="/wishlist"
              className="w-10 h-10 flex items-center justify-center rounded-full text-white transition-all duration-300 opacity-80 hover:opacity-100 hover:bg-white/10"
              aria-label="Wishlist"
            >
              <Heart size={18} strokeWidth={1.5} />
            </Link>
            <Link
              to="/account"
              className="w-10 h-10 flex items-center justify-center rounded-full text-white transition-all duration-300 opacity-80 hover:opacity-100 hover:bg-white/10"
              aria-label="Account"
            >
              <User size={18} strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 bg-black border-t border-white/10 md:hidden"
          >
            <div className="flex flex-col py-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-6 py-4 text-white text-[11px] font-semibold tracking-[0.2em] uppercase hover:bg-white/5 transition-colors"
              >
                HOME
              </Link>
              <div className="px-6 py-3">
                <p className="text-white/40 text-[10px] font-semibold tracking-[0.2em] uppercase mb-2">COLLECTION</p>
                {collectionLinks.map(item => (
                  <Link
                    key={item.slug}
                    to={item.slug}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2.5 text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-300 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Banner → category filter mapping
const seriesHighlights = [
  { title: 'LUGGAGE', image: '/Traworld/luggage.png', category: 'luggage', viewAll: '/luggage?theme=premium' },
  { title: 'BACKPACK', image: '/Traworld/Bcakpack.png', category: 'backpacks', viewAll: '/backpacks?theme=premium' },
  { title: 'DUFFLE', image: '/Traworld/Duffle.png', category: 'duffle', viewAll: '/duffle?theme=premium' },
];

// Default fallback if setting hasn't been configured yet
const DEFAULT_EDITORIAL = { category: 'luggage', label: 'Luggage', url: '/luggage?theme=premium' };

const SHOWCASE_LUGGAGE_SKUS = ['TRW-40709525', 'TRW-40709520', 'TRW-40709536', 'TRW-40709552'];
const SHOWCASE_DUFFLE_SKUS = ['INV29561', 'INV29562', 'INV29563'];

export const PremiumCollection = () => {
  const navigate = useNavigate();
  const [luggageProducts, setLuggageProducts] = useState<Product[]>([]);
  const [duffleProducts, setDuffleProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const gridRef = useRef<HTMLElement>(null);
  const [editorialBanner, setEditorialBanner] = useState(DEFAULT_EDITORIAL);

  useEffect(() => {
    window.scrollTo(0, 0);
    sessionStorage.setItem('siteTheme', 'premium');
    Promise.all([
      api.getProducts({ isPremium: 'true', limit: '100' }).catch(() => ({ products: [] })),
      api.getSetting('premium_editorial_banner').catch(() => null),
      api.getProducts({ search: 'Cult', limit: '10' }).catch(() => ({ products: [] })),
    ]).then(([premRes, bannerRes, cultRes]) => {
      const prem = (premRes.products as Product[]) || [];
      const cults = (cultRes.products as Product[]) || [];

      // Row 1: Luggage — Exact 4-color geometric series (Black, Mint Green, Blue, Tan) from premium collection
      const allLuggage = prem.filter(p => (p.category || '').toLowerCase().includes('luggage') || (p as any).sub_category?.includes('trolley'));
      const curatedLuggage = SHOWCASE_LUGGAGE_SKUS
        .map(sku => allLuggage.find(p => p.sku === sku || p.id === sku || (p as any).sku?.endsWith(sku.replace('TRW-', ''))))
        .filter(Boolean) as Product[];

      const remainingLuggage = allLuggage.filter(p => !curatedLuggage.some(c => c.id === p.id));
      setLuggageProducts([...curatedLuggage, ...remainingLuggage].slice(0, 4));

      // Row 2: Duffle — ONLY Cult series marked under premium
      const allDufflesAndCults = [...prem, ...cults];
      const premDuffles = allDufflesAndCults.filter(p => 
        (p.name || '').toLowerCase().includes('cult') ||
        ((p.category || '').toLowerCase().includes('duffle') && p.is_premium) ||
        ((p as any).sub_category?.includes('duffle') && p.is_premium)
      );

      const curatedDuffles = SHOWCASE_DUFFLE_SKUS
        .map(sku => premDuffles.find(p => p.sku === sku || p.id === sku))
        .filter(Boolean) as Product[];
      
      const uniqueDuffles = [...curatedDuffles, ...premDuffles].filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id || t.sku === item.sku)
      );

      const finalCultDuffles = uniqueDuffles.filter(p => 
        (p.name || '').toLowerCase().includes('cult') || SHOWCASE_DUFFLE_SKUS.includes(p.sku || '')
      );

      setDuffleProducts(finalCultDuffles.length > 0 ? finalCultDuffles.slice(0, 4) : uniqueDuffles.slice(0, 4));

      if (bannerRes?.category) setEditorialBanner(bannerRes);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);


  return (
    <main className="bg-white text-black min-h-screen font-outfit selection:bg-black selection:text-white">
      <PremiumNav onSearchOpen={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} theme="premium" />

      {/* 1. CINEMATIC HERO */}
      <section className="relative min-h-[70vh] sm:min-h-screen flex items-end overflow-hidden bg-black pt-14">
        <img
          src="/Traworld/hero.png"
          alt="Traworld Premium Collection"
          className="w-full h-full object-cover object-center absolute inset-0"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />
        <div className="relative z-10 w-full px-4 md:px-12 pb-14 md:pb-20 flex justify-center">
          <motion.img
            src="/Traworld/_Layer_.png"
            alt="Luxury that Travels with you"
            className="h-auto w-full max-w-[90%] sm:max-w-[70%] md:max-w-3xl brightness-0 invert mx-auto drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </div>
      </section>

      {/* 2. THREE CATEGORY BANNERS — click to filter the product grid */}
      <div className="bg-white">
        <section className="pb-0">
          <div className="max-w-6xl mx-auto px-3 sm:px-6 sm:-mt-14 relative z-10 pt-4 sm:pt-0">
            <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-8 lg:gap-10">
              {seriesHighlights.map((series, idx) => (
                <motion.button
                  key={series.title}
                  onClick={() => navigate(series.viewAll)}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative cursor-pointer overflow-hidden aspect-[360/524] w-full focus:outline-none"
                >
                  <img
                    src={series.image}
                    alt={series.title}
                    className="w-full h-full object-cover transition-all duration-700 grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-[28px] sm:h-[36px] md:h-[40px] flex items-center justify-center bg-[#111] group-hover:bg-[#b80000] transition-colors duration-300">
                    <h3
                      className="text-white font-medium font-outfit tracking-[0.15em] md:tracking-[0.2em] uppercase leading-none"
                      style={{ fontSize: 'clamp(9px, 2.5vw, 20px)' }}
                    >
                      {series.title}
                    </h3>
                  </div>
                </motion.button>
              ))}
            </div>

          </div>
        </section>

        <div className="h-10 md:h-16 bg-white" />

        {/* Editorial banner — clicking filters to luggage */}
        <section className="relative w-full overflow-hidden" style={{ minHeight: 'clamp(320px, 56vw, 700px)' }}>
          <img
            src="/Traworld/section 2.png"
            alt="Sleek Strong Seamless"
            className="w-full h-full object-cover block absolute inset-0"
          />
          <div className="absolute bottom-0 left-0 right-0 z-10 pb-6 md:pb-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center"
            >
              <Link
                to={editorialBanner.url}
                className="flex items-center justify-center border border-white text-white font-outfit font-medium tracking-[0.3em] md:tracking-[0.4em] uppercase hover:bg-white hover:text-black transition-colors"
                style={{ width: 'clamp(160px, 50vw, 228px)', height: '44px', fontSize: 'clamp(11px, 3vw, 16px)' }}
              >
                SHOP NOW
              </Link>
            </motion.div>
          </div>
        </section>
      </div>

      {/* 3. SHOWCASE SECTIONS: TWO CLEAN ROWS WITHOUT TEXT HEADERS */}
      <section ref={gridRef} className="bg-white text-black py-12 md:py-20 scroll-mt-16">
        <div className="container mx-auto px-4 md:px-12 max-w-[1400px] space-y-12 md:space-y-16">
          
          {/* ROW 1: LUGGAGE */}
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="aspect-[3/4] bg-gray-50 animate-pulse rounded-sm" />
              ))}
            </div>
          ) : luggageProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-10 md:gap-y-16">
              {luggageProducts.map((product, pIdx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: pIdx * 0.08 }}
                >
                  <ProductCard product={product} theme="premium" />
                </motion.div>
              ))}
            </div>
          ) : null}

          {/* ROW 2: DUFFLE (Strictly Premium) */}
          {duffleProducts.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-10 md:gap-y-16">
              {duffleProducts.map((product, pIdx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: pIdx * 0.08 }}
                >
                  <ProductCard product={product} theme="premium" />
                </motion.div>
              ))}
            </div>
          )}

        </div>
      </section>

      <footer className="w-full leading-[0]">
        <img src="/Traworld/Footer.png" alt="Premium Travel" className="w-full h-auto block" />
      </footer>
    </main>
  );
};
