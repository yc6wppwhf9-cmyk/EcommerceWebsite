import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { api } from '../lib/api';
import { Product } from '../types';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

const AGE_GROUPS = [
  { label: 'Below 3 Years', slug: 'school-backpacks', img: '/junior/Rectangle 28.png', banner: '/junior/Rectangle 36.png' },
  { label: '3 to 5 Years', slug: 'school-backpacks', img: '/junior/Rectangle 29.png', banner: '/junior/3to 5.png' },
  { label: '6 to 10 Years', slug: 'school-backpacks', img: "/junior/Speedo_ Hero 1.png", banner: '/junior/Rectangle 36.png' },
  { label: '11 Years & Above', slug: 'college-backpacks', img: "/junior/Drift Sky Blue_ Hero 1.png", banner: '/junior/Rectangle 36.png' },
];

export const JuniorPage = () => {
  const [schoolProducts, setSchoolProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
          src="/junior/junior hero.png"
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
            <img src="/junior/flower.png" alt="" aria-hidden className="w-4 h-4 select-none" />
            <h2 className="font-protest" style={{ fontSize: '36px', color: '#A368FB', lineHeight: '125.7%' }}>
              Shop By Age
            </h2>
            <img src="/junior/flower.png" alt="" aria-hidden className="w-4 h-4 select-none" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-8 lg:gap-10">
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
                  className="group relative block rounded-2xl md:rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 !overflow-visible"
                  style={{ aspectRatio: '3/4' }}
                >
                  <div className="absolute inset-0 rounded-2xl md:rounded-3xl overflow-hidden">
                    <img
                      src={group.img}
                      alt={group.label}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div 
                    className="absolute bottom-[-10px] inset-x-2 md:inset-x-4 flex items-center justify-center rounded-xl overflow-hidden shadow-lg z-20" 
                    style={{ height: '42px' }}
                  >
                    <img
                      src={group.banner}
                      alt=""
                      aria-hidden
                      className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
                    />
                    <p className="relative z-10 text-[13px] md:text-[14px] font-outfit font-bold uppercase tracking-tight text-white drop-shadow-md">
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
          NEW ARRIVAL BANNER — Portruding Blob Design
          Dimensions: 1402x458 | Corner: 5px | BG: #8750DA
      ═══════════════════════════════════════════════ */}
      <section className="relative mt-24 mb-14 overflow-visible px-4 md:px-0 flex justify-center">
        {/* The Grid Background Top */}
        <div className="absolute top-[-40px] inset-x-0 h-40 pointer-events-none opacity-20"
          style={{
            backgroundImage: "linear-gradient(#c7d2fe 1px, transparent 1px), linear-gradient(90deg, #c7d2fe 1px, transparent 1px)",
            backgroundSize: "20px 20px"
          }} 
        />

        <div
          className="relative w-full max-w-[1402px] h-auto min-h-[458px] rounded-[5px] py-20 flex flex-col items-center justify-center text-center overflow-visible shadow-sm"
          style={{ backgroundColor: '#8750DA' }}
        >
          {/* Floating Yellow Blob Content */}
          <div className="relative w-full flex flex-col items-center justify-center px-6 mt-[-100px] md:mt-[-150px] mb-8 overflow-visible">
            
            <div className="relative w-[340px] md:w-[540px] overflow-visible">
              <img
                src="/junior/Layer 1.png"
                alt=""
                aria-hidden
                className="w-full h-auto pointer-events-none select-none drop-shadow-2xl"
              />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-8 md:pt-16">
                <span 
                  className="font-outfit uppercase tracking-[0.2em] mb-2"
                  style={{ fontSize: '28.36px', fontWeight: 400, color: '#966512' }} /* Outfit Regular 28.36px | #966512 */
                >
                  New Arrival
                </span>
                
                {/* Main Title: Protest Riot | 50.82px | #3E92E6 */}
                <h2 
                  className="font-protest tracking-tight max-w-[433px] mx-auto"
                  style={{ fontSize: '50.82px', color: '#3E92E6', lineHeight: '104.7%' }}
                >
                  Made for Little Adventures
                </h2>
              </div>
            </div>
          </div>

          {/* Doodles background (Group 36) - Specifically on sides */}
          <div
            className="absolute left-8 md:left-28 top-1/2 -translate-y-1/2 w-[220px] md:w-[380px] aspect-square opacity-30 pointer-events-none"
            style={{
              backgroundImage: "url('/junior/Group 36.png')",
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'left center',
            }}
          />
          <div
            className="absolute right-8 md:right-28 top-1/2 -translate-y-1/2 w-[220px] md:w-[380px] aspect-square opacity-30 pointer-events-none"
            style={{
              backgroundImage: "url('/junior/Group 36.png')",
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right center',
            }}
          />

          {/* Bottom Styled Links: Outfit SemiBold 16px | White */}
          <div className="flex gap-10 md:gap-32 mt-8 md:mt-12 relative z-10">
            <Link 
              to="/school-backpacks" 
              className="text-white font-outfit font-semibold uppercase tracking-[0.1em] border-b-2 border-white/60 pb-1.5 hover:border-white transition-colors"
              style={{ fontSize: '16px' }}
            >
              Dreamy Styles
            </Link>
            <Link 
              to="/school-backpacks" 
              className="text-white font-outfit font-semibold uppercase tracking-[0.1em] border-b-2 border-white/60 pb-1.5 hover:border-white transition-colors"
              style={{ fontSize: '16px' }}
            >
              Power Styles
            </Link>
          </div>
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
                style={{ color: '#8750DA' }}
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
                {[1, 2, 3, 4].map(n => (
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
