import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getProductById } from '../constants/products';
import { Star } from 'lucide-react';
import type { Product } from '../types';
import { LazyImage } from './LazyImage';

interface ProductCardProps {
  product?: Product;
  id?: string;
  theme?: string;
}

export const ProductCard: React.FC<ProductCardProps> = (props) => {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);
  const product = props.product || (props.id ? getProductById(props.id) : undefined);
  const productPath = (slug: string) =>
    props.theme ? `/product/${slug}?theme=${props.theme}` : `/product/${slug}`;

  if (!product) return null;

  const activeVariant = product.variants?.[activeVariantIndex];
  const displayImage = activeVariant ? activeVariant.images[0] : product.image;

  const originalPrice = (product as any).original_price ?? product.originalPrice ?? product.price;
  const discount = originalPrice > product.price
    ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  return (
    <div className="flex flex-col font-outfit w-full">
      {/* Image container — 300×307 ratio, #F9F9F9, radius 5 */}
      <Link
        to={productPath(product.slug || product.id)}
        className="relative block rounded-[5px] overflow-hidden bg-[#F9F9F9]"
        style={{ aspectRatio: '300 / 307' }}
      >
        <LazyImage
          alt={product.name}
          className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] object-contain"
          src={displayImage}
          width={400}
        />

        {/* NEW badge */}
        {product.isNew && (
          <span className="absolute top-2 right-2 bg-priority-blue text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm">
            NEW
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="pt-3 space-y-1.5">
        {/* Color swatches */}
        {product.variants && product.variants.length > 0 && (
          <div className="flex gap-2">
            {product.variants.map((variant, idx) => (
              <button
                key={idx}
                onClick={() => setActiveVariantIndex(idx)}
                className={`w-6 h-6 rounded-full border-2 transition-all ${activeVariantIndex === idx ? 'border-priority-blue scale-110' : 'border-gray-200'}`}
                style={{ backgroundColor: variant.colorCode || variant.color }}
              />
            ))}
          </div>
        )}

        {/* Name — Outfit SemiBold 16px #000000 */}
        <Link to={productPath(product.slug || product.id)}>
          <h3 className={`text-[16px] font-semibold text-[#000000] leading-snug line-clamp-2 transition-colors ${props.theme === 'premium' ? 'hover:text-red-600' : 'hover:text-priority-blue'}`}>
            {product.name}
          </h3>
        </Link>

        {/* Stars + reviews — only shown when real review data exists */}
        {(product as any).reviews > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={13}
                  className={i < Math.round(product.rating ?? 4) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}
                />
              ))}
            </div>
            <span className="text-[11px] text-gray-400 font-medium">
              {(product as any).reviews} reviews
            </span>
          </div>
        )}

        {/* Price row — Outfit SemiBold 16px #755FF1 */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-[16px] font-semibold text-priority-blue">
            ₹ {product.price.toLocaleString('en-IN')}.00
          </span>
          {discount > 0 && (
            <>
              <span className="text-[14px] text-gray-400 line-through font-medium">
                ₹ {originalPrice.toLocaleString('en-IN')}.00
              </span>
              <span className="text-[13px] font-semibold text-gray-700">
                {discount}% off
              </span>
            </>
          )}
        </div>

        {/* Move to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className={`w-full py-2.5 text-white text-[11px] font-bold uppercase tracking-[0.15em] transition-all rounded-sm mt-1 disabled:opacity-50 disabled:cursor-not-allowed ${props.theme === 'premium' ? 'bg-[#111111] hover:bg-[#000000]' : 'bg-[#26B3FF] hover:bg-[#0fa0ee]'}`}
        >
          {product.stock <= 0 ? 'OUT OF STOCK' : '+ MOVE TO CART'}
        </button>
      </div>
    </div>
  );
};
