import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Star, ExternalLink, ShieldCheck } from 'lucide-react';
import { MarketplaceLink, type Marketplace } from '../MarketplaceLink';

export interface MarketplaceReview {
  id: string;
  subtitle: string;
  productName: string;
  price: string;
  image: string;
  rating: number;
  reviewCount: number;
  reviewTitle: string;
  reviewQuote: string;
  reviewer: string;
  timeAgo: string;
  marketplace: Marketplace;
  marketplaceName: string;
  marketplaceUrl: string;
}

const FEATURED_REVIEWS: MarketplaceReview[] = [
  {
    id: 'rev-1',
    subtitle: '73H',
    productName: 'SPINNER 55/20',
    price: '₹16,100.00',
    image: '/Traworld/luggage.png',
    rating: 5,
    reviewCount: 90,
    reviewTitle: 'LIGHT WEIGHT AND SLEEK DESIGN',
    reviewQuote: 'I bought this last week and very happy with the design. Light weight and value for money.',
    reviewer: 'Sam',
    timeAgo: 'Submitted 218 days ago',
    marketplace: 'amazon',
    marketplaceName: 'Amazon',
    marketplaceUrl: 'https://www.amazon.in/stores/page/4A4ABBE6-8F05-4B5B-9009-2E847AC3EDC0?ingress=0&visitId=aa56f99d-d371-4740-aecc-19c6fb832f6d&ref_=ast_bln',
  },
  {
    id: 'rev-2',
    subtitle: 'TRAWORLD LUXE',
    productName: 'CENTRIC HARDSIDED 65/24',
    price: '₹18,499.00',
    image: '/Traworld/luggage.png',
    rating: 5,
    reviewCount: 148,
    reviewTitle: 'UNMATCHED DURABILITY & SMOOTH WHEELS',
    reviewQuote: 'Best luggage investment for international travel. The 360-degree silent spinner wheels glide effortlessly through airports.',
    reviewer: 'Rohan M.',
    timeAgo: 'Submitted 45 days ago',
    marketplace: 'flipkart',
    marketplaceName: 'Flipkart',
    marketplaceUrl: 'https://www.flipkart.com/store/priority',
  },
  {
    id: 'rev-3',
    subtitle: 'PRO SERIES',
    productName: 'EXPANDABLE COMMUTER 32L',
    price: '₹3,499.00',
    image: '/Category/Backpack.jpg',
    rating: 5,
    reviewCount: 215,
    reviewTitle: 'SPACIOUS, WATERPROOF & SUPER COMFORTABLE',
    reviewQuote: 'The cushioned back support and organized compartments make daily transit and flight travel a breeze. Premium materials all around.',
    reviewer: 'Ananya S.',
    timeAgo: 'Submitted 12 days ago',
    marketplace: 'myntra',
    marketplaceName: 'Myntra',
    marketplaceUrl: 'https://www.myntra.com/priority',
  },
  {
    id: 'rev-4',
    subtitle: 'HORIZON SERIES',
    productName: 'POLYCARBONATE TROLLEY 75/28',
    price: '₹12,250.00',
    image: '/Traworld/luggage.png',
    rating: 5,
    reviewCount: 176,
    reviewTitle: 'SCRATCH RESISTANT & LUXURY AESTHETIC',
    reviewQuote: 'Survived 4 long haul flights with zero dents or scratches. TSA lock works seamlessly. Highly recommend for frequent flyers!',
    reviewer: 'Vikram Patel',
    timeAgo: 'Submitted 60 days ago',
    marketplace: 'ajio',
    marketplaceName: 'Ajio',
    marketplaceUrl: 'https://www.ajio.com/b/priority',
  },
  {
    id: 'rev-5',
    subtitle: 'WEEKENDER',
    productName: 'EXPANDABLE DUFFLE WITH SHOE SECTION',
    price: '₹2,799.00',
    image: '/Traworld/Duffle.png',
    rating: 5,
    reviewCount: 112,
    reviewTitle: 'PERFECT FOR WEEKEND GETAWAYS',
    reviewQuote: 'Looks extremely premium in person. Separate ventilated shoe section is super thoughtful and convenient.',
    reviewer: 'Karan D.',
    timeAgo: 'Submitted 84 days ago',
    marketplace: 'amazon',
    marketplaceName: 'Amazon',
    marketplaceUrl: 'https://www.amazon.in/stores/page/4A4ABBE6-8F05-4B5B-9009-2E847AC3EDC0?ingress=0&visitId=aa56f99d-d371-4740-aecc-19c6fb832f6d&ref_=ast_bln',
  },
];

export const BestReviewedShowcase: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const total = FEATURED_REVIEWS.length;
  const current = FEATURED_REVIEWS[currentIndex];

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  return (
    <section className="py-16 md:py-24 bg-[#FAFAFA] dark:bg-[#0c1013] overflow-hidden transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <p className="text-[11px] md:text-xs font-bold font-outfit uppercase tracking-[0.24em] text-marine dark:text-cyan-400 mb-2.5">
            Top Rated On Marketplaces
          </p>
          <h2 className="text-2xl md:text-4xl font-extrabold font-outfit uppercase tracking-[0.14em] text-ink dark:text-white">
            Best Reviewed Travel Gear
          </h2>
        </div>

        {/* Carousel Outer Wrapper */}
        <div className="relative max-w-[1060px] mx-auto flex items-center justify-center pl-2 sm:pl-6 md:pl-8 pr-12 sm:pr-16 md:pr-20">

          {/* Left Arrow */}
          <button
            onClick={handlePrev}
            aria-label="Previous Review"
            className="absolute -left-2 sm:-left-4 md:-left-6 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#8E8E93]/80 hover:bg-[#8E8E93] text-white flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronLeft size={22} strokeWidth={2.5} />
          </button>

          {/* Stacked Deck Container */}
          <div className="relative w-full">

            {/* Background Stacked Card Layer 3 (Farthest Back) */}
            <div
              onClick={handleNext}
              className="absolute inset-y-0 right-0 w-full rounded-2xl md:rounded-[28px] bg-white dark:bg-[#1c2126] border border-black/10 dark:border-white/10 shadow-[0_6px_20px_rgba(0,0,0,0.06)] cursor-pointer transition-all duration-300"
              style={{
                transform: 'translateX(36px) scaleY(0.92)',
                transformOrigin: 'left center',
                zIndex: 1,
              }}
            />

            {/* Background Stacked Card Layer 2 (Middle Behind) */}
            <div
              onClick={handleNext}
              className="absolute inset-y-0 right-0 w-full rounded-2xl md:rounded-[28px] bg-white dark:bg-[#181c20] border border-black/10 dark:border-white/10 shadow-[0_8px_25px_rgba(0,0,0,0.07)] cursor-pointer transition-all duration-300"
              style={{
                transform: 'translateX(24px) scaleY(0.96)',
                transformOrigin: 'left center',
                zIndex: 2,
              }}
            />

            {/* Background Stacked Card Layer 1 (Closest Behind Front) */}
            <div
              onClick={handleNext}
              className="absolute inset-y-0 right-0 w-full rounded-2xl md:rounded-[28px] bg-white dark:bg-[#14181B] border border-black/10 dark:border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.08)] cursor-pointer transition-all duration-300"
              style={{
                transform: 'translateX(12px) scaleY(0.99)',
                transformOrigin: 'left center',
                zIndex: 3,
              }}
            />

            {/* Main Active Card (Front) */}
            <div className="relative z-10 w-full bg-white dark:bg-[#14181B] rounded-2xl md:rounded-[28px] shadow-[0_14px_45px_rgba(0,0,0,0.09)] dark:shadow-[0_14px_45px_rgba(0,0,0,0.5)] border border-black/5 dark:border-white/10 overflow-hidden min-h-[380px] md:min-h-[420px] flex items-center">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={current.id}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -direction * 40 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 p-6 sm:p-10 md:p-14 items-center"
                >
                  {/* Left Column: Product Showcase */}
                  <div className="md:col-span-5 flex flex-col items-center text-center">
                    <div className="relative w-44 h-48 md:w-56 md:h-60 flex items-center justify-center mb-4">
                      <img
                        src={current.image}
                        alt={current.productName}
                        className="max-h-full max-w-full object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.15)] transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                    <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">
                      {current.subtitle}
                    </p>
                    <h3 className="text-sm md:text-base font-extrabold text-ink dark:text-white uppercase tracking-wider mb-1.5">
                      {current.productName}
                    </h3>
                    <p className="text-sm md:text-base font-black text-ink dark:text-white">
                      {current.price}
                    </p>
                  </div>

                  {/* Right Column: Review Details & CTA */}
                  <div className="md:col-span-7 flex flex-col items-start justify-center md:pl-4">
                    {/* Review Title */}
                    <h4 className="text-lg sm:text-xl md:text-2xl font-black text-ink dark:text-white uppercase tracking-[0.08em] mb-3 leading-tight">
                      {current.reviewTitle}
                    </h4>

                    {/* Review Quote */}
                    <p className="text-sm md:text-[15px] leading-relaxed text-gray-600 dark:text-gray-300 font-normal mb-6">
                      "{current.reviewQuote}"
                    </p>

                    {/* Star Rating & Review Count */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-0.5 text-[#003884] dark:text-[#26B3FF]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={18} fill="currentColor" stroke="none" />
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        ({current.reviewCount} Reviews)
                      </span>
                    </div>

                    {/* Reviewer & Marketplace Attribution */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-7">
                      <span>{current.timeAgo} by <strong className="text-ink dark:text-white font-semibold">{current.reviewer}</strong></span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-marine dark:text-cyan-400">
                        <ShieldCheck size={14} /> Verified on {current.marketplaceName}
                      </span>
                    </div>

                    {/* VIEW PRODUCT CTA */}
                    <MarketplaceLink
                      marketplace={current.marketplace}
                      url={current.marketplaceUrl}
                      className="inline-flex items-center justify-center bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-gray-100 font-extrabold uppercase text-xs tracking-[0.2em] px-8 md:px-10 py-3.5 md:py-4 transition-all duration-300 shadow-md hover:shadow-lg group"
                    >
                      <span className="flex items-center gap-2">
                        VIEW PRODUCT
                        <ExternalLink size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                      </span>
                    </MarketplaceLink>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            aria-label="Next Review"
            className="absolute -right-1 sm:-right-2 md:-right-4 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black text-white hover:bg-neutral-800 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronRight size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* Dots Pagination Indicator */}
        <div className="flex items-center justify-center gap-2 mt-8 md:mt-10">
          {FEATURED_REVIEWS.map((rev, idx) => (
            <button
              key={rev.id}
              onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
              }}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex
                  ? 'w-8 bg-black dark:bg-white'
                  : 'w-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
