import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ProductCard } from '../components/ProductCard';
import { api } from '../lib/api';
import type { Product } from '../types';
import { ChevronDown } from 'lucide-react';

const collectionLinks = [
  { label: 'LUGGAGES', slug: '/luggage?theme=premium' },
  { label: 'BACKPACKS', slug: '/backpacks?theme=premium' },
  { label: 'DUFFELS', slug: '/duffle?theme=premium' },
  { label: 'ACCESSORIES', slug: '/accessories?theme=premium' },
];

const PremiumNav = () => {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black h-14 flex items-center justify-between px-6 md:px-12">
      <Link to="/premium" className="flex items-center gap-2">
        <img src="/Traworld/nav bar logo.png" alt="Traworld" className="h-6 w-auto" />
      </Link>
      <div className="flex items-center gap-8">
        <Link to="/" className="text-white text-[11px] font-semibold tracking-[0.2em] uppercase hover:opacity-70 transition-opacity">
          HOME
        </Link>
        <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
          <button className="flex items-center gap-1.5 text-white text-[11px] font-semibold tracking-[0.2em] uppercase hover:opacity-70 transition-opacity">
            COLLECTION <ChevronDown size={11} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.18 }}
                className="absolute top-full right-0 mt-2 w-44 bg-[#111] border border-white/10 shadow-2xl py-2"
              >
                {collectionLinks.map(item => (
                  <Link
                    key={item.slug}
                    to={item.slug}
                    className="block px-5 py-3 text-[10px] font-semibold tracking-[0.2em] uppercase text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};

export const PremiumCollection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    api.getProducts({ isPremium: 'true' }).then(res => {
      setProducts(res.products as Product[]);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  const seriesHighlights = [
    { title: 'LUGGAGES', image: '/Traworld/luggage.png', slug: '/luggage?theme=premium' },
    { title: 'BACKPACKS', image: '/Traworld/Bcakpack.png', slug: '/backpacks?theme=premium' },
    { title: 'DUFFELS', image: '/Traworld/Duffle.png', slug: '/duffle?theme=premium' },
  ];

  return (
    <main className="bg-white text-black min-h-screen font-outfit selection:bg-black selection:text-white">
      <PremiumNav />

      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative min-h-[60vh] sm:min-h-screen flex items-end overflow-hidden bg-black pt-14">
        <img
          src="/Traworld/hero.png"
          alt="Traworld Premium Collection"
          className="w-full h-full object-cover object-center absolute inset-0"
        />
        <div className="relative z-10 w-full px-6 md:px-12 pb-8 md:pb-14">
          <motion.img
            src="/Traworld/_Layer_.png"
            alt="Luxury that Travels with you"
            className="h-auto w-full max-w-[85%] sm:max-w-[70%] md:max-w-3xl brightness-0 invert"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </div>
      </section>

      {/* 2. THREE-SERIES HIGHLIGHTS + 3. EDITORIAL */}
      <div className="bg-white">
        {/* Categories */}
        <section className="pb-0">
          <div className="max-w-6xl mx-auto px-3 sm:px-6 -mt-10 sm:-mt-14 relative z-10">
            <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-8 lg:gap-10">
              {seriesHighlights.map((series, idx) => (
                <Link key={series.title} to={series.slug}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="group relative cursor-pointer overflow-hidden aspect-[360/524]"
                  >
                    <img
                      src={series.image}
                      alt={series.title}
                      className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-[28px] sm:h-[36px] md:h-[40px] flex items-center justify-center bg-[#111] group-hover:bg-[#b80000] transition-colors duration-300">
                      <h3 className="text-white font-medium font-outfit tracking-[0.15em] md:tracking-[0.2em] uppercase leading-none" style={{ fontSize: 'clamp(9px, 2.5vw, 20px)' }}>
                        {series.title}
                      </h3>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <div className="h-10 md:h-16 bg-white" />
        {/* Sleek Editorial */}
        <section className="relative w-full overflow-hidden" style={{ minHeight: 'clamp(320px, 56vw, 700px)' }}>
          <img
            src="/Traworld/section 2.png"
            alt="Sleek Strong Seamless"
            className="w-full h-full object-cover block absolute inset-0"
          />

          {/* Top overlay text image */}
          <div className="absolute top-0 left-0 right-0 z-10 pt-6 md:pt-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <img
                src="/Traworld/_Layer_ 2.png"
                alt="Sleek Strong Seamless"
                className="mx-auto h-auto max-w-[60%] sm:max-w-[70%] md:max-w-2xl brightness-0 invert"
              />
            </motion.div>
          </div>

          {/* Bottom overlay text + button */}
          <div className="absolute bottom-0 left-0 right-0 z-10 pb-6 md:pb-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center"
            >
              <p className="text-white font-outfit uppercase tracking-[0.2em] md:tracking-[0.3em] mb-3 md:mb-6 text-center px-4" style={{ fontSize: 'clamp(10px, 3vw, 31.98px)', fontWeight: 200 }}>
                Luggage That Moves With Your Style.
              </p>

              <Link
                to="/luggage?theme=premium"
                className="flex items-center justify-center border border-white text-white font-outfit font-medium tracking-[0.3em] md:tracking-[0.4em] uppercase"
                style={{ width: 'clamp(160px, 50vw, 228px)', height: '44px', fontSize: 'clamp(11px, 3vw, 16px)' }}
              >
                SHOP NOW
              </Link>
            </motion.div>
          </div>
        </section>
      </div>

      {/* 4. BEST SELLERS GRID */}
      <section className="bg-white text-black py-24 min-h-screen">
        <div className="container mx-auto px-6 md:px-12 max-w-[1400px]">
          <div className="text-center mb-20 whitespace-normal">
            <h2 className="font-outfit font-medium uppercase tracking-[0.6em] pb-4" style={{ fontSize: '18px', color: '#111111' }}>
              BEST SELLERS
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <div key={n} className="aspect-[3/4] bg-gray-50 animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-24">
              {products.slice(0, 8).map((product, pIdx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (pIdx % 4) * 0.1 }}
                >
                  <ProductCard product={product} theme="premium" />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer>
        <img src="/Traworld/Footer.png" alt="Footer" className="w-full block" />
      </footer>

    </main>
  );
};
