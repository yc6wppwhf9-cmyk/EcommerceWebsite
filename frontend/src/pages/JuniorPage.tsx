import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { api } from '../lib/api';
import { Product } from '../types';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

const AGE_GROUPS = [
  { label: 'Below 3 Years',   slug: 'school-backpacks',  img: '/junior/Rectangle 28.png',            banner: '/junior/Rectangle 36.png' },
  { label: '3 to 5 Years',    slug: 'school-backpacks',  img: '/junior/Rectangle 29.png',            banner: '/junior/3to 5.png'        },
  { label: '6 to 10 Years',   slug: 'school-backpacks',  img: "/junior/Speedo_ Hero 1.png",          banner: '/junior/Rectangle 36.png' },
  { label: '11 Years & Above', slug: 'college-backpacks', img: "/junior/Drift Sky Blue_ Hero 1.png", banner: '/junior/Rectangle 36.png' },
];

export const JuniorPage = () => {
  const [schoolProducts, setSchoolProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers]         = useState<Product[]>([]);
  const [isLoading, setIsLoading]             = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    Promise.all([
      api.getProducts({ category: 'school-backpacks', limit: '8' }),
      api.getProducts({ sort: 'popular', limit: '8' }),
    ]).then(([school, popular]) => {
      setSchoolProducts(school.products as unknown as Product[]);
      setBestSellers(popular.products as unknown as Product[]);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  return (
    <main className="bg-white min-h-screen overflow-x-hidden">

      {/* ═══════════════════════════════════════════════
          HERO — Clean Editorial Image
      ═══════════════════════════════════════════════ */}
      <section className="relative w-full h-[450px] md:h-[650px] overflow-hidden">
        <img 
          src="/junior/junior_hero_new.png" 
          alt="Junior Collection Preview" 
          className="w-full h-full object-cover"
        />
      </section>

      {/* ═══════════════════════════════════════════════
          SHOP BY AGE — tall portrait cards
      ═══════════════════════════════════════════════ */}
      <section className="py-12 md:py-16 bg-white relative overflow-hidden">
        {/* Dotted grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#c7d2fe 1.2px, transparent 1.2px)',
            backgroundSize: '22px 22px',
            opacity: 0.5,
          }}
        />
        <div className="max-w-[1280px] mx-auto px-6 md:px-14 relative z-10">

          {/* Title with yellow banner highlight */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <img src="/junior/flower.png" alt="" aria-hidden className="w-7 h-7 select-none" />
            <h2 className="font-protest" style={{ fontSize: '36px', color: '#A368FB', lineHeight: '125.7%' }}>
              Shop By Age
            </h2>
            <img src="/junior/flower.png" alt="" aria-hidden className="w-7 h-7 select-none" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {AGE_GROUPS.map((group, i) => (
              <motion.div
                key={group.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  to={`/${group.slug}`}
                  className="group relative block rounded-2xl md:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  style={{ aspectRatio: '3/4' }}
                >
                  {/* Full-bleed photo */}
                  <img
                    src={group.img}
                    alt={group.label}
                    className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Banner label at bottom — alternates yellow / purple */}
                  <div className="absolute bottom-0 inset-x-0 flex items-center justify-center" style={{ height: '36px' }}>
                    <img
                      src={group.banner}
                      alt=""
                      aria-hidden
                      className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
                    />
                    <p className="relative z-10 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white font-nunito drop-shadow-sm">
                      {group.label}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          NEW ARRIVAL BANNER — purple + real blob image
      ═══════════════════════════════════════════════ */}
      <section
        className="relative mx-4 md:mx-12 rounded-[2.5rem] overflow-hidden py-16 md:py-20 mb-2"
        style={{ background: 'linear-gradient(135deg, #5B2D8E 0%, #7C3AED 100%)' }}
      >
        {/* Real yellow blob */}
        <img
          src="/junior/Layer 1.png"
          alt=""
          aria-hidden
          className="absolute right-6 top-1/2 -translate-y-1/2 w-52 md:w-72 hidden md:block pointer-events-none select-none"
          style={{ opacity: 0.92 }}
        />

        <div className="max-w-[1280px] mx-auto px-8 md:px-16 relative z-10">
          <span className="inline-block bg-white/20 text-white text-[9px] font-black tracking-[0.45em] uppercase px-4 py-1.5 rounded-full mb-5 font-nunito">
            New Arrival
          </span>
          <h2 className="text-white font-nunito font-black text-4xl md:text-5xl uppercase leading-tight mb-1">
            Ready for Every
          </h2>
          <h2
            className="font-dancing text-[3.2rem] md:text-[4.5rem] leading-tight mb-6"
            style={{ color: '#FDB913' }}
          >
            Little Adventures
          </h2>
          <p className="text-white/60 text-sm font-nunito font-semibold max-w-sm mb-8 leading-relaxed">
            Lightweight, colourful and tough enough for any adventure. Designed with kids in mind.
          </p>
          <Link
            to="/school-backpacks"
            className="inline-flex items-center gap-2 font-nunito font-black text-[11px] uppercase tracking-widest px-8 py-3.5 rounded-full hover:scale-105 transition-transform"
            style={{ backgroundColor: '#FDB913', color: '#000' }}
          >
            Shop New Arrivals <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SCHOOL BACKPACKS SHOWCASE
      ═══════════════════════════════════════════════ */}
      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-[1280px] mx-auto px-6 md:px-14">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p
                className="text-[10px] font-black uppercase tracking-[0.4em] font-nunito mb-1"
                style={{ color: '#7C3AED' }}
              >
                Top Picks
              </p>
              <h2
                className="text-2xl md:text-4xl font-black uppercase text-[#1a1a1a] font-nunito"
                style={{ letterSpacing: '-0.01em' }}
              >
                School Backpacks
              </h2>
            </div>
            <Link
              to="/school-backpacks"
              className="text-[11px] font-black uppercase tracking-widest font-nunito text-gray-400 hover:text-black transition-colors flex items-center gap-1"
            >
              View All <ArrowRight size={13} />
            </Link>
          </div>

          <div className="flex gap-6">
            {/* Feature card with real hero photo */}
            <div
              className="hidden lg:flex flex-col justify-between w-56 shrink-0 rounded-[2rem] overflow-hidden relative"
              style={{ backgroundColor: '#FDB913' }}
            >
              <div className="p-7 pb-0">
                <span className="text-[9px] font-black uppercase tracking-widest text-black/50 font-nunito block mb-2">
                  Featured
                </span>
                <h3 className="text-xl font-black uppercase text-black font-nunito leading-tight">
                  School<br />Backpacks
                </h3>
              </div>
              <img
                src="/junior/Beautiful_ Hero 1.png"
                alt="School Backpacks"
                className="w-full h-52 object-cover object-top mt-4"
              />
            </div>

            {/* Products */}
            {isLoading ? (
              <div className="flex-1 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                {[1,2,3,4].map(n => (
                  <div key={n} className="aspect-[3/4] bg-gray-100 animate-pulse rounded-3xl" />
                ))}
              </div>
            ) : schoolProducts.length > 0 ? (
              <div className="flex-1 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                {schoolProducts.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center py-20 rounded-3xl border border-dashed border-gray-200 bg-gray-50">
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest font-nunito">
                  New Collection Arriving Soon
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          BEST SELLERS
      ═══════════════════════════════════════════════ */}
      {bestSellers.length > 0 && (
        <section className="py-14 md:py-20 bg-[#F8F8F8]">
          <div className="max-w-[1280px] mx-auto px-6 md:px-14">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p
                  className="text-[10px] font-black uppercase tracking-[0.4em] font-nunito mb-1"
                  style={{ color: '#FF6B6B' }}
                >
                  Most Loved
                </p>
                <h2
                  className="text-2xl md:text-4xl font-black uppercase text-[#1a1a1a] font-nunito"
                  style={{ letterSpacing: '-0.01em' }}
                >
                  Shop Best Sellers
                </h2>
              </div>
              <Link
                to="/backpacks"
                className="text-[11px] font-black uppercase tracking-widest font-nunito text-gray-400 hover:text-black transition-colors flex items-center gap-1"
              >
                View All <ArrowRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {bestSellers.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

    </main>
  );
};
