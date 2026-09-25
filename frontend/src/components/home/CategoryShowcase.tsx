import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion, type PanInfo } from 'motion/react';
import { fadeUp, stagger, revealProps } from '../../lib/motion';
import { LazyImage } from '../LazyImage';
import { CATS } from '../../constants/home';

/**
 * "Shop By Category" section.
 * - Mobile: 3D coverflow carousel with drag/swipe and looping.
 * - Desktop: 3-column grid with hover reveal arrows.
 */
export const CategoryShowcase = () => {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const draggedRef = useRef(false);

  const total = CATS.length;

  const goNext = () => setActive((i) => (i + 1) % total);
  const goPrev = () => setActive((i) => (i - 1 + total) % total);

  // Shortest signed distance from the active card, so the carousel loops.
  const offsetOf = (i: number) => {
    let d = i - active;
    if (d > total / 2) d -= total;
    if (d < -total / 2) d += total;
    return d;
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -50 || info.velocity.x < -400) goNext();
    else if (info.offset.x > 50 || info.velocity.x > 400) goPrev();
    // Let the click that ends a drag pass without navigating.
    setTimeout(() => { draggedRef.current = false; }, 0);
  };

  const spring = reduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 260, damping: 32, mass: 0.9 };

  return (
    <>
      {/* ─── Mobile: Coverflow Carousel ─────────────────────────────────── */}
      <section className="md:hidden pt-8 pb-12 overflow-hidden text-center" aria-label="Shop by category">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.3em] text-slate mb-6">
          Shop By Category
        </h2>

        <motion.div
          className="relative mx-auto w-[70vw] max-w-[300px] aspect-[3/4] touch-pan-y select-none"
          style={{ perspective: 1100 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragStart={() => { draggedRef.current = true; }}
          onDragEnd={handleDragEnd}
          aria-roledescription="carousel"
          aria-label="Categories — swipe to browse"
        >
          {CATS.map((cat, i) => {
            const d = offsetOf(i);
            const isActive = d === 0;
            return (
              <motion.div
                key={cat.label}
                className="absolute inset-0"
                initial={false}
                animate={{
                  x: `${d * 74}%`,
                  scale: isActive ? 1 : 0.82,
                  rotateY: d * -22,
                  opacity: Math.abs(d) > 1 ? 0 : 1,
                }}
                transition={spring}
                style={{ zIndex: 10 - Math.abs(d) }}
              >
                <Link
                  to={cat.to}
                  draggable={false}
                  tabIndex={isActive ? 0 : -1}
                  aria-hidden={!isActive}
                  onClick={(e) => {
                    if (draggedRef.current || !isActive) {
                      e.preventDefault();
                      if (!draggedRef.current) setActive(i);
                    }
                  }}
                  className={`relative block w-full h-full rounded-[22px] overflow-hidden transition-shadow duration-500 ${
                    isActive
                      ? 'shadow-[0_24px_48px_-20px_rgba(15,20,23,0.55)]'
                      : 'shadow-[0_10px_24px_-14px_rgba(15,20,23,0.35)]'
                  }`}
                >
                  <img
                    src={cat.img}
                    alt={cat.label}
                    draggable={false}
                    className="w-full h-full object-cover pointer-events-none"
                    loading={i === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                  {/* Dim the side cards so the centre card reads as the focus */}
                  <motion.div
                    className="absolute inset-0 bg-ink pointer-events-none"
                    initial={false}
                    animate={{ opacity: isActive ? 0 : 0.35 }}
                    transition={spring}
                  />
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

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
