import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { api } from '../lib/api';
import { Product } from '../types';
import { motion } from 'motion/react';
import { ArrowRight, Star } from 'lucide-react';

const AGE_GROUPS = [
  { label: '3–6 yrs', color: '#FFD93D', bg: '#FFF9E6', slug: 'school-backpacks' },
  { label: '6–10 yrs', color: '#FF6B6B', bg: '#FFF0F0', slug: 'school-backpacks' },
  { label: '10–14 yrs', color: '#4ECDC4', bg: '#F0FAFA', slug: 'school-backpacks' },
  { label: '14+ yrs', color: '#6C63FF', bg: '#F3F0FF', slug: 'college-backpacks' },
];

export const JuniorPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    Promise.all([
      api.getProducts({ category: 'school-backpacks', limit: '8' }),
      api.getProducts({ sort: 'popular', limit: '8' }),
    ]).then(([school, popular]) => {
      setProducts(school.products as unknown as Product[]);
      setBestSellers(popular.products as unknown as Product[]);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  return (
    <main className="bg-white min-h-screen font-outfit overflow-x-hidden">

      {/* ── Hero Banner ── */}
      <section className="relative pt-16 min-h-[420px] md:min-h-[520px] flex items-center overflow-hidden bg-[#FFD93D]">
        {/* Subtle dot grid */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(#000 1px,transparent 1px)', backgroundSize: '24px 24px' }} />

        {/* Decorative blobs */}
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-[#FF6B6B]/30 blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/20 blur-3xl pointer-events-none" />

        <div className="container mx-auto px-6 md:px-16 relative z-10 flex flex-col md:flex-row items-center gap-10 py-12">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 text-left"
          >
            <span className="inline-block bg-black text-white text-[9px] font-black tracking-[0.35em] uppercase px-3 py-1.5 rounded-full mb-5">
              New 2026 Collection
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-black leading-[0.88] uppercase tracking-tighter mb-6">
              Ready For<br />Every<br /><span className="text-white drop-shadow-sm">School Day.</span>
            </h1>
            <p className="text-black/60 font-semibold text-sm mb-8 max-w-xs leading-relaxed">
              Ergonomic, vibrant bags built to survive every adventure — from classroom to playground.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/school-backpacks"
                className="bg-black text-white px-8 py-3.5 rounded-full text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2"
              >
                Shop Now <ArrowRight size={14} />
              </Link>
              <Link
                to="/junior"
                className="bg-white/60 backdrop-blur text-black px-8 py-3.5 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-white transition-colors"
              >
                Explore All
              </Link>
            </div>
          </motion.div>

          {/* Hero image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex-1 flex justify-center"
          >
            <img
              src="/Creatives/editorial-3.jpg"
              alt="Junior Collection"
              className="w-full max-w-sm md:max-w-md h-[340px] md:h-[420px] object-cover rounded-[3rem] shadow-2xl"
            />
          </motion.div>
        </div>
      </section>

      {/* ── Shop By Age ── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-6 md:px-16">
          <div className="text-center mb-12">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Find The Perfect Fit</span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-[#111] mt-2">
              Shop By Age
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {AGE_GROUPS.map((group, i) => (
              <motion.div
                key={group.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  to={`/${group.slug}`}
                  className="group flex flex-col items-center gap-4 p-6 rounded-3xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  style={{ backgroundColor: group.bg }}
                >
                  {/* Circle avatar */}
                  <div
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center text-4xl font-black text-white shadow-lg transition-transform duration-300 group-hover:scale-105"
                    style={{ backgroundColor: group.color }}
                  >
                    {['🎒', '🏫', '📚', '💼'][i]}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black uppercase tracking-wide text-[#111]">{group.label}</p>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5 uppercase tracking-widest">Shop Now</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── New Arrival Banner ── */}
      <section className="mx-4 md:mx-12 mb-16 rounded-[3rem] overflow-hidden bg-[#6C63FF] relative py-16 md:py-20 text-white">
        {/* Blob decoration */}
        <div className="absolute -top-12 -right-12 w-72 h-72 rounded-full bg-[#FFD93D]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-72 h-72 rounded-full bg-[#FF6B6B]/20 blur-3xl pointer-events-none" />

        {/* Big blob shape */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:block">
          <div
            className="w-56 h-56 bg-[#FFD93D] opacity-80"
            style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }}
          />
        </div>

        <div className="container mx-auto px-8 md:px-16 relative z-10 text-center md:text-left max-w-2xl">
          <span className="inline-block bg-white/20 text-white text-[9px] font-black tracking-[0.4em] uppercase px-3 py-1.5 rounded-full mb-5">
            New Arrival
          </span>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9] mb-6">
            Ready for Every<br />
            <span className="text-[#FFD93D]">Little Adventure.</span>
          </h2>
          <p className="text-white/70 text-sm font-medium mb-8 max-w-sm leading-relaxed">
            Lightweight, colourful and tough enough for any adventure. Designed with kids in mind.
          </p>
          <Link
            to="/school-backpacks"
            className="inline-flex items-center gap-2 bg-[#FFD93D] text-black px-8 py-3.5 rounded-full font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-transform"
          >
            Shop New Arrivals <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── School Backpacks Showcase ── */}
      <section className="py-16 md:py-24 bg-[#F8FAFC]">
        <div className="container mx-auto px-6 md:px-16">
          <div className="flex flex-col md:flex-row items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#6C63FF]">Top Picks</span>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-[#111] mt-1">
                School Backpacks
              </h2>
            </div>
            <Link
              to="/school-backpacks"
              className="text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-[#6C63FF] transition-colors flex items-center gap-1"
            >
              View All <ArrowRight size={13} />
            </Link>
          </div>

          <div className="flex gap-8">
            {/* Left feature card */}
            <div className="hidden lg:flex flex-col justify-between w-64 shrink-0 bg-[#FFD93D] rounded-[2.5rem] p-8 relative overflow-hidden">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-black/50 block mb-2">Featured</span>
                <h3 className="text-2xl font-black uppercase text-black leading-tight">School<br />Backpacks</h3>
                <p className="text-xs text-black/50 mt-3 font-medium leading-relaxed">Durable, ergonomic and designed for young learners.</p>
              </div>
              <img src="/Category/Backpack.jpg" alt="School Backpacks" className="w-full h-40 object-contain mt-4" />
            </div>

            {/* Product grid */}
            {isLoading ? (
              <div className="flex-1 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1,2,3,4].map(n => <div key={n} className="aspect-[3/4] bg-gray-100 animate-pulse rounded-3xl" />)}
              </div>
            ) : products.length > 0 ? (
              <div className="flex-1 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center py-24 rounded-3xl border border-dashed border-gray-200 bg-white">
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">New Collection Arriving Soon</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Best Sellers ── */}
      {bestSellers.length > 0 && (
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-6 md:px-16">
            <div className="flex flex-col md:flex-row items-end justify-between gap-4 mb-10">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FF6B6B]">Most Loved</span>
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-[#111] mt-1 flex items-center gap-3">
                  Shop Best Sellers
                  <Star size={28} className="text-[#FFD93D]" fill="#FFD93D" />
                </h2>
              </div>
              <Link
                to="/backpacks"
                className="text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-[#FF6B6B] transition-colors flex items-center gap-1"
              >
                View All <ArrowRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {bestSellers.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Bottom CTA ── */}
      <section className="bg-[#111] py-20 md:py-28 relative overflow-hidden mx-4 md:mx-12 rounded-[3.5rem] mb-20 md:mb-32">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[22vw] font-black text-white/[0.04] whitespace-nowrap pointer-events-none select-none uppercase">
          JUNIOR
        </div>
        <div className="container mx-auto px-8 relative z-10 text-center text-white">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9] mb-6">
            Back to School,<br /><span className="text-[#FFD93D]">Back to Style.</span>
          </h2>
          <p className="text-white/50 max-w-md mx-auto mb-10 text-sm font-medium leading-relaxed">
            Join thousands of parents who trust Priority Junior for quality, safety, and style.
          </p>
          <Link
            to="/school-backpacks"
            className="inline-flex items-center gap-2 bg-[#FFD93D] text-black px-10 py-4 rounded-full font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-transform"
          >
            Shop All Junior <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </main>
  );
};
