import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LazyImage } from '../LazyImage';
import type { Product } from '../../types';
import type { ColumnTier } from '../../constants/home';

// ─── New Arrival Card ────────────────────────────────────────────────────────

const NewArrivalCard = ({ product }: { product: Product }) => (
  <Link
    to={`/product/${product.slug || product.id}`}
    className="flex flex-col bg-white group border border-line rounded-sm p-2 md:p-3 overflow-hidden transition-transform duration-500 ease-out hover:-translate-y-1 h-full"
  >
    <div className="relative overflow-hidden bg-white" style={{ aspectRatio: '1 / 1' }}>
      <span className="absolute left-1.5 top-1.5 z-10 bg-[#26B3FF] text-white text-[9px] md:text-[10px] font-bold uppercase tracking-[0.14em] px-2 py-0.5 rounded-sm">
        New
      </span>
      <LazyImage
        src={product.image}
        alt={product.name}
        className="w-full h-full object-contain p-5 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        width={400}
      />
    </div>
    <div className="pt-3 space-y-1">
      <h3 className="font-outfit font-normal text-[13px] md:text-[15px] text-graphite leading-snug line-clamp-1">
        {product.name}
      </h3>
    </div>
  </Link>
);

// ─── New Arrivals Section ────────────────────────────────────────────────────

interface NewArrivalsProps {
  products: Product[];
  columns: ColumnTier;
}

export const NewArrivals: React.FC<NewArrivalsProps> = ({ products, columns }) => {
  const [currentPage, setCurrentPage] = useState(0);

  const desktopPageSize = columns.best;
  const totalPages = Math.max(1, Math.ceil(products.length / desktopPageSize));

  const handleNext = useCallback(() => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  }, [totalPages]);

  const handlePrev = useCallback(() => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  }, [totalPages]);

  const handleSelect = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Handle window resizing
  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages - 1));
  }, [totalPages]);

  if (products.length === 0) return null;

  const currentProducts = products.slice(
    currentPage * desktopPageSize,
    currentPage * desktopPageSize + desktopPageSize
  );

  return (
    <section className="pb-16 pt-10 md:pt-20 bg-white border-t border-gray-100" aria-label="New arrivals">
      <div className="max-w-[1720px] mx-auto px-4 md:px-14 relative">
        <div className="text-center mb-12">
          <p className="text-[10px] font-semibold text-[#26B3FF] uppercase tracking-[0.3em] mb-2">
            Just Landed
          </p>
          <h2 className="font-outfit font-semibold text-[16px] text-[#030014] tracking-[0.1em] uppercase">
            New Arrivals
          </h2>
        </div>

        {/* Desktop Navigation Arrows */}
        {totalPages > 1 && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Previous new arrivals"
              className="hidden md:flex absolute left-4 top-[60%] -translate-y-1/2 z-30 w-11 h-11 bg-white hover:bg-ink hover:text-white items-center justify-center transition-all duration-300 rounded-full border border-line shadow-md cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next new arrivals"
              className="hidden md:flex absolute right-4 top-[60%] -translate-y-1/2 z-30 w-11 h-11 bg-white hover:bg-ink hover:text-white items-center justify-center transition-all duration-300 rounded-full border border-line shadow-md cursor-pointer"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Mobile: 2-column grid */}
        <div className="md:hidden grid grid-cols-2 gap-x-4 gap-y-6">
          {products.slice(0, 6).map((p) => (
            <NewArrivalCard key={p.id} product={p} />
          ))}
        </div>

        {/* Desktop: Animated auto-cycling responsive grid */}
        <div className="hidden md:block">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className={`grid gap-6 lg:gap-8 ${columns.bestClass}`}
            >
              {currentProducts.map((p) => (
                <NewArrivalCard key={p.id} product={p} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots Pagination Indicator */}
        {totalPages > 1 && (
          <div className="hidden md:flex items-center justify-center gap-2 mt-10">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                aria-label={`Go to page ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentPage ? 'w-8 bg-[#26B3FF]' : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
