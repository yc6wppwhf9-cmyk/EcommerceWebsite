import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { api } from '../lib/api';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { ArrowLeft } from 'lucide-react';

const BURST_COLORS = ['#F69245', '#A368FB', '#FFBB5A', '#FF6B6B', '#FFD700', '#4ECDC4', '#FF69B4', '#fff'];

type Particle = { id: number; angle: number; dist: number; size: number; color: string; delay: number; ox: number; oy: number };

const makeParticles = (count: number, ox: number, oy: number): Particle[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (i / count) * 360 + Math.random() * 10,
    dist: 60 + Math.random() * 180,
    size: 5 + Math.random() * 12,
    color: BURST_COLORS[Math.floor(Math.random() * BURST_COLORS.length)],
    delay: Math.random() * 0.25,
    ox, oy,
  }));

const BURST_POINTS = [
  { ox: '20%', oy: '40%', count: 35, delay: 0 },
  { ox: '50%', oy: '30%', count: 50, delay: 200 },
  { ox: '80%', oy: '45%', count: 35, delay: 400 },
  { ox: '35%', oy: '60%', count: 25, delay: 600 },
  { ox: '65%', oy: '55%', count: 25, delay: 750 },
];

const FirecrackerBurst = () => {
  const [visible, setVisible] = useState(true);
  const [wave, setWave] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    BURST_POINTS.forEach((_, i) => {
      timers.push(setTimeout(() => setWave(i + 1), BURST_POINTS[i].delay));
    });
    timers.push(setTimeout(() => setVisible(false), 1800));
    return () => timers.forEach(clearTimeout);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {BURST_POINTS.slice(0, wave).map((bp, bi) => {
        const particles = makeParticles(bp.count, 0, 0);
        return particles.map(p => (
          <motion.div
            key={`b${bi}-p${p.id}`}
            className="absolute rounded-full"
            style={{ width: p.size, height: p.size, backgroundColor: p.color, left: bp.ox, top: bp.oy, boxShadow: `0 0 ${p.size}px ${p.color}` }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: Math.cos((p.angle * Math.PI) / 180) * p.dist, y: Math.sin((p.angle * Math.PI) / 180) * p.dist, opacity: 0, scale: 0 }}
            transition={{ duration: 0.7 + Math.random() * 0.5, delay: p.delay, ease: [0.2, 0.8, 0.4, 1] }}
          />
        ));
      })}
    </div>
  );
};

const CONFIG = {
  dreamy: {
    label: 'Dreamy Styles',
    subtitle: 'Soft colours, fun prints & magical designs for little dreamers',
    color: '#A368FB',
    accent: '#FFBB5A',
    badge: 'bg-[#A368FB]',
  },
  power: {
    label: 'Power Styles',
    subtitle: 'Bold, sporty & built tough for little adventurers on the go',
    color: '#3E92E6',
    accent: '#FF6B6B',
    badge: 'bg-[#3E92E6]',
  },
};

const JuniorProductCard = ({ product, accent }: { product: Product; accent: string }) => {
  const { addItem } = useCart();
  const originalPrice = (product as any).original_price ?? (product as any).originalPrice ?? product.price;
  const discount = originalPrice > product.price
    ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
    : 0;

  return (
    <div className="flex flex-col font-outfit bg-white">
      <Link
        to={`/product/${product.slug || product.id}?theme=junior`}
        className="relative block rounded-2xl border-2 overflow-hidden bg-white"
        style={{ aspectRatio: '300 / 307', borderColor: accent }}
      >
        <div className="w-full h-full flex items-center justify-center p-4">
          <img src={product.image} alt={product.name} className="w-full h-full object-contain transition-transform duration-500 hover:scale-105" loading="lazy" />
        </div>
        {product.isNew && (
          <span className="absolute top-2.5 right-2.5 bg-[#FFB347] text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm">NEW</span>
        )}
      </Link>
      <div className="pt-3 space-y-1.5">
        <Link to={`/product/${product.slug || product.id}`}>
          <h3 className="text-[16px] font-bold text-black leading-snug line-clamp-2 hover:text-[#755FF1] transition-colors">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-1.5">
          {[...Array(5)].map((_, i) => <img key={i} src="/junior/Star 1.png" alt="★" className="h-3.5 w-3.5" />)}
          <span className="text-[11px] text-gray-400 font-medium">{(product as any).reviews ?? 10} reviews</span>
        </div>
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-[16px] font-semibold text-[#755FF1]">₹ {product.price.toLocaleString('en-IN')}.00</span>
          {discount > 0 && (
            <>
              <span className="text-[14px] text-gray-400 line-through">₹ {originalPrice.toLocaleString('en-IN')}.00</span>
              <span className="text-[13px] font-semibold text-black">{discount}% off</span>
            </>
          )}
        </div>
        {(product as any).amazon_url ? (
          <button
            onClick={e => { e.preventDefault(); window.open((product as any).amazon_url, '_blank', 'noopener,noreferrer'); }}
            className="w-full py-2.5 text-white text-[11px] font-bold uppercase tracking-[0.15em] transition-colors rounded-md mt-1"
            style={{ backgroundColor: accent }}
          >
            Buy on Amazon
          </button>
        ) : (
          <button
            disabled
            className="w-full py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] rounded-md mt-1 bg-gray-100 text-gray-400 cursor-not-allowed"
          >
            Coming Soon
          </button>
        )}
      </div>
    </div>
  );
};

export const JuniorStylePage = () => {
  const { style } = useParams<{ style: string }>();
  const cfg = CONFIG[style as keyof typeof CONFIG] || CONFIG.dreamy;
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    sessionStorage.setItem('siteTheme', 'junior');
    api.getProducts({ junior_style: style } as any).then(res => {
      setProducts(res.products as unknown as Product[]);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, [style]);

  return (
    <main className="bg-white min-h-screen font-outfit">
      <FirecrackerBurst />
      {/* Hero banner */}
      <section className="relative w-full flex flex-col items-center justify-center text-center py-16 md:py-24 overflow-hidden" style={{ backgroundColor: cfg.color, minHeight: 'clamp(280px, 40vw, 420px)' }}>
        <img src="/junior/grid view.png" alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none" />

        {/* Doodle — style character image on right */}
        <motion.img
          src={`/junior/${style === 'dreamy' ? 'Dreamy' : 'Power'}.png`}
          alt=""
          aria-hidden
          className="absolute right-0 bottom-0 h-[80%] md:h-[100%] object-contain pointer-events-none select-none"
          style={{ maxWidth: '38%' }}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        />

        {/* Doodle — scattered flowers */}
        <img src="/junior/flower.png" alt="" aria-hidden className="absolute top-5 left-6 w-8 md:w-12 opacity-70 rotate-12 pointer-events-none select-none" />
        <img src="/junior/flower.png" alt="" aria-hidden className="absolute bottom-6 left-12 w-5 md:w-8 opacity-50 -rotate-[25deg] pointer-events-none select-none" />
        <img src="/junior/flower.png" alt="" aria-hidden className="absolute top-1/3 left-[22%] w-4 md:w-6 opacity-40 rotate-45 pointer-events-none select-none" />

        {/* Doodle — scattered stars */}
        <img src="/junior/Star 1.png" alt="" aria-hidden className="absolute top-8 right-[42%] w-5 md:w-7 opacity-60 pointer-events-none select-none" />
        <img src="/junior/Star 1.png" alt="" aria-hidden className="absolute bottom-10 right-[38%] w-4 md:w-6 opacity-50 pointer-events-none select-none" />
        <img src="/junior/Star 1.png" alt="" aria-hidden className="absolute top-1/2 left-[8%] w-4 md:w-5 opacity-40 pointer-events-none select-none" />

        <div className="relative z-10 px-6">
          <Link to="/junior" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-[12px] font-semibold uppercase tracking-widest mb-6 transition-colors">
            <ArrowLeft size={14} /> Back to Junior
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-protest text-white mb-3"
            style={{ fontSize: 'clamp(32px, 8vw, 64px)' }}
          >
            {cfg.label}
          </motion.h1>
          <p className="text-white/80 font-outfit max-w-md mx-auto" style={{ fontSize: 'clamp(13px, 3vw, 16px)' }}>
            {cfg.subtitle}
          </p>
        </div>
      </section>

      {/* Products grid */}
      <section className="py-12 md:py-20 max-w-[1280px] mx-auto px-6 md:px-14">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {[1,2,3,4,5,6,7,8].map(n => <div key={n} className="aspect-[300/307] bg-gray-100 animate-pulse rounded-2xl" />)}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {products.map((product, i) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 4) * 0.07 }}>
                <JuniorProductCard product={product} accent={cfg.color} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <p className="text-gray-300 font-black uppercase tracking-widest text-[12px] mb-3">No products yet</p>
            <p className="text-gray-400 text-sm">Tag products as <strong>{style}</strong> in the admin panel to show them here.</p>
            <Link to="/junior" className="mt-6 px-6 py-2.5 text-white text-[12px] font-bold uppercase tracking-widest rounded-full" style={{ backgroundColor: cfg.color }}>
              Back to Junior
            </Link>
          </div>
        )}
      </section>
    </main>
  );
};
