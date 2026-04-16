import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { api } from '../lib/api';
import { Product } from '../types';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

const AGE_GROUPS = [
  { label: '3–5 Yrs',  color: '#FF6B6B', emoji: '👧', slug: 'school-backpacks' },
  { label: '6–9 Yrs',  color: '#4ECDC4', emoji: '👦', slug: 'school-backpacks' },
  { label: '10–12 Yrs', color: '#A78BFA', emoji: '🧒', slug: 'school-backpacks' },
  { label: '13+ Yrs',  color: '#F59E0B', emoji: '🧑', slug: 'college-backpacks' },
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
          HERO BANNER  — amber/yellow background
      ═══════════════════════════════════════════════ */}
      <section className="relative pt-16 overflow-hidden" style={{ backgroundColor: '#FDB913' }}>
        {/* Subtle polka dots */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#000 1.5px,transparent 1.5px)', backgroundSize: '22px 22px' }}
        />

        <div className="max-w-[1280px] mx-auto px-6 md:px-14 flex flex-col md:flex-row items-end gap-0">
          {/* ── Left text ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55 }}
            className="flex-1 pb-10 md:pb-16 pt-10 md:pt-16 z-10"
          >
            <h1
              className="text-[3.8rem] md:text-[5.5rem] leading-[1] font-black uppercase text-black mb-4 font-nunito"
              style={{ letterSpacing: '-0.02em' }}
            >
              Ready For Every<br />School Day.
            </h1>
            <p
              className="text-black/60 text-sm md:text-base font-semibold font-nunito mb-8 max-w-xs leading-relaxed"
            >
              Explore 2026 Collection
            </p>
            <Link
              to="/school-backpacks"
              className="inline-flex items-center gap-2 bg-black text-white font-nunito font-black text-[11px] uppercase tracking-widest px-8 py-3.5 rounded-full hover:scale-105 transition-transform"
            >
              Shop Now <ArrowRight size={14} />
            </Link>
          </motion.div>

          {/* ── Right image ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex-1 flex justify-center md:justify-end items-end"
          >
            <img
              src="/Creatives/editorial-4.jpg"
              alt="Kids with backpacks"
              className="w-full max-w-[420px] h-[320px] md:h-[400px] object-cover object-top rounded-t-[2rem]"
              style={{ borderRadius: '2rem 2rem 0 0' }}
            />
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SHOP BY AGE
      ═══════════════════════════════════════════════ */}
      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-[1280px] mx-auto px-6 md:px-14">
          <div className="text-center mb-10">
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 font-nunito mb-1">Find Your Perfect Bag</p>
            <h2 className="text-3xl md:text-4xl font-black uppercase text-[#1a1a1a] font-nunito" style={{ letterSpacing: '-0.01em' }}>
              Shop By Age
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
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
                  className="group flex flex-col items-center gap-4 p-5 rounded-3xl bg-gray-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Circle — will show photo when available */}
                  <div
                    className="w-20 h-20 md:w-28 md:h-28 rounded-full flex items-center justify-center text-4xl md:text-5xl shadow-md group-hover:scale-105 transition-transform duration-300 overflow-hidden"
                    style={{ backgroundColor: group.color + '33', border: `3px solid ${group.color}` }}
                  >
                    {/* Swap src for real photo: /Junior/age-3-5.jpg etc */}
                    <span className="text-3xl md:text-4xl select-none">{group.emoji}</span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-[#1a1a1a] font-nunito uppercase tracking-wide">{group.label}</p>
                    <p
                      className="text-[10px] font-bold mt-0.5 uppercase tracking-widest font-nunito"
                      style={{ color: group.color }}
                    >
                      Shop Now →
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          NEW ARRIVAL BANNER  — deep purple
      ═══════════════════════════════════════════════ */}
      <section
        className="relative mx-4 md:mx-12 rounded-[2.5rem] overflow-hidden py-16 md:py-20 mb-2"
        style={{ background: 'linear-gradient(135deg, #5B2D8E 0%, #7C3AED 100%)' }}
      >
        {/* Blob decoration */}
        <div
          className="absolute right-10 top-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 hidden md:block"
          style={{
            backgroundColor: '#FDB913',
            borderRadius: '62% 38% 46% 54% / 60% 44% 56% 40%',
            opacity: 0.9,
          }}
        />
        <div
          className="absolute right-32 top-8 w-16 h-16 rounded-full hidden md:block"
          style={{ backgroundColor: '#FF6B6B', opacity: 0.6 }}
        />

        <div className="max-w-[1280px] mx-auto px-8 md:px-16 relative z-10">
          <span
            className="inline-block bg-white/20 text-white text-[9px] font-black tracking-[0.45em] uppercase px-4 py-1.5 rounded-full mb-5 font-nunito"
          >
            New Arrival
          </span>
          <h2 className="text-white font-nunito font-black text-4xl md:text-5xl uppercase leading-tight mb-2">
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
          {/* Header */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] font-nunito mb-1" style={{ color: '#7C3AED' }}>
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
            {/* Feature card */}
            <div
              className="hidden lg:flex flex-col justify-between w-56 shrink-0 rounded-[2rem] p-7 relative overflow-hidden"
              style={{ backgroundColor: '#FDB913' }}
            >
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-black/50 font-nunito block mb-2">
                  Featured
                </span>
                <h3 className="text-xl font-black uppercase text-black font-nunito leading-tight">
                  School<br />Backpacks
                </h3>
                <p className="text-xs text-black/50 mt-2 font-nunito leading-relaxed">
                  Durable, ergonomic — designed for young learners.
                </p>
              </div>
              <img
                src="/Category/Backpack.jpg"
                alt="Backpack"
                className="w-full h-36 object-contain mt-4"
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
                <p className="text-[10px] font-black uppercase tracking-[0.4em] font-nunito mb-1" style={{ color: '#FF6B6B' }}>
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
