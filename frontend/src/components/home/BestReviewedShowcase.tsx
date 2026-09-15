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
    subtitle: 'GIRLS SCHOOL BACKPACK',
    productName: 'PRIORITY 16" PRINTED SCHOOL 24L',
    price: '',
    image: '/reviews/rev_1.jpg',
    rating: 5,
    reviewCount: 142,
    reviewTitle: 'VIBRANT PRINT & EXCEPTIONAL DURABILITY',
    reviewQuote: 'Bought this for my daughter for daily school. The colors and prints are vibrant, the stitching is strong, and the zippers are super smooth!',
    reviewer: 'Sneha Sharma',
    timeAgo: 'Submitted 14 days ago',
    marketplace: 'flipkart',
    marketplaceName: 'Flipkart',
    marketplaceUrl: 'https://www.flipkart.com/priority-16-inch-girls-printed-school-24-l-backpack/p/itm8596fc5d2ffc9?pid=BKPHHWNYHYBGJ8DH',
  },
  {
    id: 'rev-2',
    subtitle: 'COLLEGE LAPTOP BACKPACK',
    productName: 'PRIORITY 18.5" COLORBLOCK LAPTOP 36L',
    price: '',
    image: '/reviews/rev_2.jpg',
    rating: 5,
    reviewCount: 236,
    reviewTitle: 'SPACIOUS WITH PADDED LAPTOP SLEEVE',
    reviewQuote: 'Perfect college backpack. Holds a 15.6 inch laptop comfortably with plenty of room for heavy books, charger, and a water bottle.',
    reviewer: 'Rahul Verma',
    timeAgo: 'Submitted 8 days ago',
    marketplace: 'flipkart',
    marketplaceName: 'Flipkart',
    marketplaceUrl: 'https://www.flipkart.com/priority-18-5-inch-colorblock-durable-college-pouch-laptop-sleeve-36-l-backpack/p/itme2caat887298c?pid=BKPHHU6VGV8Y3CFY',
  },
  {
    id: 'rev-3',
    subtitle: 'TRENDY CASUAL BACKPACK',
    productName: 'PRIORITY UNISEX COLOURBLOCKED BACKPACK',
    price: '',
    image: '/reviews/rev_3.jpg',
    rating: 5,
    reviewCount: 189,
    reviewTitle: 'TRENDY AESTHETIC & SOLID BUILD QUALITY',
    reviewQuote: 'The colourblocked design looks premium and modern. Heavy-duty fabric and comfortable shoulder straps make it great for daily commute.',
    reviewer: 'Aman Gupta',
    timeAgo: 'Submitted 21 days ago',
    marketplace: 'myntra',
    marketplaceName: 'Myntra',
    marketplaceUrl: 'https://www.myntra.com/backpacks/priority/priority-unisex-colourblocked-backpack/40246530/buy',
  },
  {
    id: 'rev-4',
    subtitle: 'ERGONOMIC TECH BACKPACK',
    productName: 'PRIORITY UNISEX LAPTOP BACKPACK (16")',
    price: '',
    image: '/reviews/rev_4.jpg',
    rating: 5,
    reviewCount: 310,
    reviewTitle: 'EXCELLENT FOR WORK & DAILY COMMUTE',
    reviewQuote: 'The padded back panel distributes weight evenly. The dedicated laptop compartment is well-cushioned and protected against light rains.',
    reviewer: 'Priya Nair',
    timeAgo: 'Submitted 5 days ago',
    marketplace: 'myntra',
    marketplaceName: 'Myntra',
    marketplaceUrl: 'https://www.myntra.com/backpacks/priority/priority-unisex-laptop-backpack---up-to-16-inch/36523261/buy',
  },
  {
    id: 'rev-5',
    subtitle: '360° ROTATION LUGGAGE SET',
    productName: 'PRIORITY HARD-SIDED TROLLEY SET OF 2',
    price: '',
    image: '/reviews/rev_5.jpg',
    rating: 5,
    reviewCount: 428,
    reviewTitle: 'SMOOTH SPINNER WHEELS & SOLID SHELL',
    reviewQuote: 'Travelled on multiple flights with this luggage set and it held up beautifully with zero dents. The 360-degree wheels roll effortlessly.',
    reviewer: 'Aditya Mehra',
    timeAgo: 'Submitted 18 days ago',
    marketplace: 'myntra',
    marketplaceName: 'Myntra',
    marketplaceUrl: 'https://www.myntra.com/trolley-bag/priority/priority-unisex-set-of-2-360-degree-rotation-hard-sided-trolley-bags/36356831/buy',
  },
  {
    id: 'rev-6',
    subtitle: 'HARD SHELL COMBO SET 29L',
    productName: 'PRIORITY SCHOOL COMBO + TIFFIN POUCH (PINK)',
    price: '',
    image: '/reviews/rev_6.jpg',
    rating: 5,
    reviewCount: 165,
    reviewTitle: 'COMPLETE ALL-IN-ONE SCHOOL SET',
    reviewQuote: 'My kid loves the hard-shell design and matching tiffin pouch. Keeps notebooks and lunch boxes completely protected from crushing.',
    reviewer: 'Neha Joshi',
    timeAgo: 'Submitted 11 days ago',
    marketplace: 'ajio',
    marketplaceName: 'Ajio',
    marketplaceUrl: 'https://www.ajio.com/priority-boys-hard-shell-school-backpack-combo-with-tiffin-pouch--29-l/p/469810674_lightpink',
  },
  {
    id: 'rev-7',
    subtitle: 'HARD SHELL COMBO SET 29L',
    productName: 'PRIORITY SCHOOL COMBO + TIFFIN POUCH (YELLOW)',
    price: '',
    image: '/reviews/rev_7.jpg',
    rating: 5,
    reviewCount: 198,
    reviewTitle: 'SUPER ATTRACTIVE & STURDY FOR KIDS',
    reviewQuote: 'Tough front shell protects against rough school handling. Includes matching pouch and insulated lunch bag. Fantastic value!',
    reviewer: 'Rajesh K.',
    timeAgo: 'Submitted 28 days ago',
    marketplace: 'ajio',
    marketplaceName: 'Ajio',
    marketplaceUrl: 'https://www.ajio.com/priority-boys-hard-shell-school-backpack-combo-with-tiffin-pouch--29-l/p/469810674_yellow',
  },
  {
    id: 'rev-8',
    subtitle: 'COMFORT TRAVEL DUFFLE',
    productName: 'PRIORITY CULT 001 TRAVELLING DUFFLE BAG',
    price: '',
    image: '/reviews/rev_8.jpg',
    rating: 5,
    reviewCount: 345,
    reviewTitle: 'LIGHTWEIGHT, DURABLE & TRAVEL-READY',
    reviewQuote: 'Extremely comfortable shoulder straps and lightweight yet very tough tear-resistant fabric. One of the best duffles from Priority on Amazon!',
    reviewer: 'Deepak Rao',
    timeAgo: 'Submitted 3 days ago',
    marketplace: 'amazon',
    marketplaceName: 'Amazon',
    marketplaceUrl: 'https://www.amazon.in/Priority-Lightweight-Comfortable-Travelling-Suitable/dp/B0FMRHQ7BY',
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
                    <h3 className="text-sm md:text-base font-extrabold text-ink dark:text-white uppercase tracking-wider">
                      {current.productName}
                    </h3>
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
                      <div className="flex items-center gap-0.5 text-[#E53E3E] dark:text-[#F56565]">
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
