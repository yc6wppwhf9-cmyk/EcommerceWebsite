import { useState, useRef, useEffect } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, ArrowRight, Truck, CreditCard, ShieldCheck, PackageCheck } from 'lucide-react';
import { CATEGORIES } from '../constants/products';
import { api } from '../lib/api';
import type { Product } from '../types';
import { AnimatePresence, motion } from 'motion/react';
import { LazyImage } from '../components/LazyImage';
import { SEO } from '../components/SEO';

const BACKPACK_TABS = [
  { id: 'college-backpacks',  label: 'College Backpack',  image: '/Category/ref.png',                         to: '/college-backpacks',  apiParams: { category: 'college-backpacks' } },
  { id: 'laptop-backpacks',   label: 'Laptop Backpack',   image: '/junior/Drift Sky Blue_ Hero 1.png',        to: '/laptop-backpacks',   apiParams: { category: 'laptop-backpacks' } },
  { id: 'trekking-backpacks', label: 'Trekking Backpack', image: '/Category/Travelling Bag.jpg',              to: '/trekking-backpacks', apiParams: { category: 'trekking-backpacks' } },
];

const HERO_SLIDES = [
  { src: '/Creatives/hero-main.jpg', cta: 'Shop Campus Picks', to: '/college-backpacks' },
  { src: '/Creatives/editorial-2.jpg', cta: 'Shop Junior Collection', to: '/junior' },
  { src: '/Creatives/editorial-4.jpg', cta: 'Shop Luggage', to: '/luggage' },
  { src: '/Creatives/editorial-5.jpg', cta: 'Shop Laptop Bags', to: '/laptop-backpacks' },
];

const CATS = [
  { to: '/backpacks', label: 'Backpacks', img: '/Category/Backpack.jpg' },
  { to: '/luggage', label: 'Luggage', img: '/Category/Travelling Bag.jpg' },
  { to: '/accessories', label: 'Accessories', img: '/Category/Accessories.jpg' },
];

const IMG = {
  banner: '/Category/Artboard 1 1.png',
  refPoster: '/Category/ref.png',
};

const heroVariants = {
  enter: { opacity: 0, scale: 1.03 },
  center: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.97 },
};

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((p) => (p + 1) % HERO_SLIDES.length);
  const prev = () => setCurrent((p) => (p - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  return (
    <section className="relative w-full bg-black overflow-hidden aspect-[16/9] md:aspect-[2.2/1] lg:aspect-[16/9]">
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={current}
          variants={heroVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.75, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <img
            alt="Priority Collection"
            className="w-full h-full object-cover"
            src={HERO_SLIDES[current].src}
            loading="eager"
          />
          <div className="absolute inset-x-0 bottom-0 h-28 md:h-32 bg-gradient-to-t from-black/5 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <button onClick={prev} className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-30 w-14 h-14 border border-white/30 rounded-full items-center justify-center hover:bg-white hover:text-gray-900 backdrop-blur-sm transition-all duration-300 text-white group shadow-xl">
        <ChevronLeft size={26} className="group-hover:-translate-x-0.5 transition-transform" />
      </button>
      <button onClick={next} className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-30 w-14 h-14 border border-white/30 rounded-full items-center justify-center hover:bg-white hover:text-gray-900 backdrop-blur-sm transition-all duration-300 text-white group shadow-xl">
        <ChevronRight size={26} className="group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Dots — mobile & desktop */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        {HERO_SLIDES.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-white' : 'w-1.5 bg-white/40'}`} />
        ))}
      </div>
    </section>
  );
};

const BestSellerCard = ({ product }: { product: Product }) => {
  const originalPrice = (product as any).original_price ?? product.originalPrice ?? product.price;
  const discount = originalPrice > product.price
    ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
    : 0;

  return (
    <div className="flex flex-col bg-white">
      {/* Large image, minimal padding so bag fills the card */}
      <Link
        to={`/product/${product.slug || product.id}`}
        className="block overflow-hidden"
        style={{ aspectRatio: '379 / 411' }}
      >
