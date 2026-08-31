import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { fadeUp, stagger, revealProps } from '../../lib/motion';
import { LazyImage } from '../LazyImage';
import { CATS } from '../../constants/home';

/**
 * "Shop By Category" section.
 * - Mobile: 3D depth-stacked card carousel with touch swipe.
 * - Desktop: 3-column grid with hover reveal arrows.
 */
export const CategoryShowcase = () => {
  const reduceMotion = useReducedMotion();
  const [catFlipIndex, setCatFlipIndex] = useState(0);
  const catTouchRef = useRef<number | null>(null);

  const total = CATS.length;

  const goNext = () => setCatFlipIndex((i) => (i + 1) % total);
  const goPrev = () => setCatFlipIndex((i) => (i - 1 + total) % total);

  const handleTouchStart = (e: React.TouchEvent) => {
    catTouchRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (catTouchRef.current === null) return;
    const diff = catTouchRef.current - e.changedTouches[0].clientX;
    if (diff > 40) goNext();
    else if (diff < -40) goPrev();
    catTouchRef.current = null;
  };

  return (
    <>
      {/* ─── Mobile: Card Stack ─────────────────────────────────────────── */}
      <section className="md:hidden py-6 px-4 text-center" aria-label="Shop by category">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.3em] text-slate mb-4">
          Shop By Category
        </h2>
        <div className="px-2">
          <div
            className="relative select-none max-w-[270px] xs:max-w-[290px] mx-auto"
            style={{ perspective: '1200px' }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            aria-label="Category card stack — swipe to browse"
          >
            {/* Stacked cards behind (depth effect) */}
            {[2, 1].map((offset) => {
              const idx = catFlipIndex + offset;
              if (idx >= total) return null;
              return (
                <div
                  key={`stack-${offset}`}
                  className="absolute inset-y-0 rounded-2xl overflow-hidden pointer-events-none"
                  style={{
                    left: `${offset * 10}px`,
                    right: `-${offset * 10}px`,
                    transform: `scale(${1 - offset * 0.04}) translateX(${offset * 8}px)`,
                    filter: `brightness(${0.55 - offset * 0.1})`,
                    zIndex: 10 - offset,
                    transformOrigin: 'right center',
                  }}
                >
                  <div className="relative w-full" style={{ paddingBottom: '125%' }}>
                    <img
                      src={CATS[idx]?.img || ''}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover object-top"
                    />
                  </div>
                </div>
              );
            })}

            {/* Active card */}
            <div style={{ position: 'relative', zIndex: 20, overflow: 'hidden', borderRadius: '1rem' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={catFlipIndex}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="w-full rounded-sm overflow-hidden border border-line shadow-md"
                >
                  <Link
                    to={CATS[catFlipIndex].to}
                    className="block w-full relative"
                    style={{ paddingBottom: '125%' }}
                  >
                    <img
                      src={CATS[catFlipIndex].img}
                      alt={CATS[catFlipIndex].label}
                      className="absolute inset-0 w-full h-full object-cover object-top"
                    />
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation controls */}
            <div className="flex justify-between items-center mt-6 px-1">
              <button onClick={goPrev} aria-label="Previous category" className="p-2 text-gray-400 transition-opacity">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-2" role="tablist" aria-label="Category indicators">
                {CATS.map((_, i) => (
                  <div
                    key={i}
                    role="tab"
                    aria-selected={i === catFlipIndex}
                    aria-label={CATS[i].label}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === catFlipIndex ? 'w-6 bg-ink' : 'w-1.5 bg-line'
                    }`}
                  />
                ))}
              </div>
              <button onClick={goNext} aria-label="Next category" className="p-2 text-gray-400 transition-opacity">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Desktop: 3-column Grid ─────────────────────────────────────── */}
      <section
        className="hidden md:block max-w-[1720px] mx-auto px-8 lg:px-12 pt-12 pb-10 lg:pt-16 lg:pb-14"
        aria-label="Shop by category"
      >
        <motion.div
          className="grid grid-cols-3 gap-6 lg:gap-10"
          variants={stagger(0.09)}
          {...revealProps(reduceMotion)}
        >
          {CATS.map((cat) => (
            <motion.div key={cat.label} variants={fadeUp}>
              <Link
                to={cat.to}
                className="group relative block rounded-sm overflow-hidden transition-transform duration-700 ease-out hover:-translate-y-1.5 border border-line bg-white"
              >
                <LazyImage
                  src={cat.img}
                  alt={cat.label}
                  className="w-full h-auto block transition-transform duration-[1.6s] ease-out group-hover:scale-[1.03]"
                  width={600}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-700" />
                <div className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-white flex items-center justify-center border border-line translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <ArrowRight size={22} className="text-ink" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </>
  );
};
