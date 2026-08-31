import { Link } from 'react-router-dom';
import { LazyImage } from '../LazyImage';
import type { Product } from '../../types';
import type { ColumnTier } from '../../constants/home';

// ─── Best Seller Card ────────────────────────────────────────────────────────

const BestSellerCard = ({ product }: { product: Product }) => {
  const originalPrice = product.original_price ?? product.originalPrice ?? product.price;
  const discount =
    originalPrice > product.price
      ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
      : 0;

  return (
    <Link
      to={`/product/${product.slug || product.id}`}
      className="flex flex-col bg-white group border border-line rounded-sm p-2 md:p-3 overflow-hidden transition-transform duration-500 ease-out hover:-translate-y-1"
    >
      <div className="overflow-hidden bg-white" style={{ aspectRatio: '1 / 1' }}>
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
};

// ─── Best Sellers Section ────────────────────────────────────────────────────

interface BestSellersProps {
  products: Product[];
  columns: ColumnTier;
}

export const BestSellers = ({ products, columns }: BestSellersProps) => {
  if (products.length === 0) return null;

  return (
    <section className="pb-16 pt-10 md:pt-20 bg-white border-t border-gray-100" aria-label="Best sellers">
      <div className="max-w-[1720px] mx-auto px-4 md:px-14">
        <div className="text-center mb-12">
          <h2 className="font-outfit font-semibold text-[16px] text-[#030014] tracking-[0.1em] uppercase">
            Shop Best Sellers
          </h2>
        </div>

        {/* Mobile: 2-column grid */}
        <div className="md:hidden grid grid-cols-2 gap-x-4 gap-y-6">
          {products.slice(0, 6).map((p) => (
            <BestSellerCard key={p.id} product={p} />
          ))}
        </div>

        {/* Desktop: responsive grid */}
        <div className={`hidden md:grid gap-6 lg:gap-8 ${columns.bestClass}`}>
          {products.slice(0, columns.best).map((p) => (
            <BestSellerCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
};
