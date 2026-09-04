import { Link } from 'react-router-dom';
import { LazyImage } from '../LazyImage';
import type { Product } from '../../types';
import type { ColumnTier } from '../../constants/home';

// ─── New Arrival Card ────────────────────────────────────────────────────────

const NewArrivalCard = ({ product }: { product: Product }) => (
  <Link
    to={`/product/${product.slug || product.id}`}
    className="flex flex-col bg-white group border border-line rounded-sm p-2 md:p-3 overflow-hidden transition-transform duration-500 ease-out hover:-translate-y-1"
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

export const NewArrivals = ({ products, columns }: NewArrivalsProps) => {
  if (products.length === 0) return null;

  return (
    <section className="pb-16 pt-10 md:pt-20 bg-white border-t border-gray-100" aria-label="New arrivals">
      <div className="max-w-[1720px] mx-auto px-4 md:px-14">
        <div className="text-center mb-12">
          <p className="text-[10px] font-semibold text-[#26B3FF] uppercase tracking-[0.3em] mb-2">
            Just Landed
          </p>
          <h2 className="font-outfit font-semibold text-[16px] text-[#030014] tracking-[0.1em] uppercase">
            New Arrivals
          </h2>
        </div>

        {/* Mobile: 2-column grid */}
        <div className="md:hidden grid grid-cols-2 gap-x-4 gap-y-6">
          {products.slice(0, 6).map((p) => (
            <NewArrivalCard key={p.id} product={p} />
          ))}
        </div>

        {/* Desktop: responsive grid */}
        <div className={`hidden md:grid gap-6 lg:gap-8 ${columns.bestClass}`}>
          {products.slice(0, columns.best).map((p) => (
            <NewArrivalCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
};
