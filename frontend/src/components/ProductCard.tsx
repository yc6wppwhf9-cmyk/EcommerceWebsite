import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { getProductById } from '../constants/products';
import { Star, Heart } from 'lucide-react';
import type { Product } from '../types';
import { LazyImage } from './LazyImage';
import { AmazonLink } from './AmazonLink';

interface ProductCardProps {
  product?: Product;
  id?: string;
  theme?: string;
  /**
   * Quiet palette is now the default for the main catalogue. Junior and Premium
   * pass their own `theme` and keep their louder treatment, so this resolves to
   * false for them. Styling only — it never affects the product link.
   */
  variant?: 'quiet' | 'loud';
}

export const ProductCard: React.FC<ProductCardProps> = (props) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const product = props.product || (props.id ? getProductById(props.id) : undefined);
  const productPath = (slug: string) =>
    props.theme ? `/product/${slug}?theme=${props.theme}` : `/product/${slug}`;

  if (!product) return null;

  const activeVariant = product.variants?.[activeVariantIndex];
  const primaryImage = activeVariant ? activeVariant.images[0] : product.image;
  const secondaryImage = activeVariant ? activeVariant.images[1] : product.images?.[1];
  
  // Only show secondary image on hover for non-touch devices
  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  const displayImage = !isTouchDevice && isHovered && secondaryImage ? secondaryImage : primaryImage;

  const originalPrice = (product as any).original_price ?? product.originalPrice ?? product.price;
  const discount = originalPrice > product.price
    ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
    : 0;

  const isWishlisted = isInWishlist(product.id);
  // Quiet unless a themed surface (junior / premium) opts out.
  const quiet = props.variant === 'loud'
    ? false
    : props.variant === 'quiet' || (props.theme !== 'junior' && props.theme !== 'premium');
  const rating = product.rating ?? 0;
  const reviews = (product as any).reviews ?? 0;
  const hasRating = rating > 0;

  const amazonUrl = (product as any).amazon_url;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="flex flex-col font-outfit w-full">
      {/* Image container — 300×307 ratio */}
      <Link
        to={productPath(product.slug || product.id)}
        className={`relative block overflow-hidden ${quiet ? 'rounded-sm bg-white border border-line' : 'rounded-[5px] bg-[#F9F9F9]'}`}
        style={{ aspectRatio: '300 / 307' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <LazyImage
          alt={product.name}
          className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] object-contain transition-opacity duration-300"
          src={displayImage}
          width={400}
        />

        {/* Best Seller badge — top right (takes priority over NEW) */}
        {product.highlighted ? (
          <span className={`absolute top-2 right-2 text-[9px] uppercase px-2 py-0.5 rounded-sm z-10 ${quiet ? 'bg-white/90 text-brass border border-brass/40 font-medium tracking-[0.18em]' : 'bg-amber-500 text-white font-black tracking-widest'}`}>
            BEST SELLER
          </span>
        ) : product.isNew ? (
          <span className={`absolute top-2 right-2 text-[9px] uppercase px-2 py-0.5 rounded-sm z-10 ${quiet ? 'bg-white/90 text-marine border border-marine/30 font-medium tracking-[0.18em]' : 'bg-priority-blue text-white font-black tracking-widest'}`}>
            NEW
          </span>
        ) : null}

        {/* Low stock warning */}
        {!quiet && product.stock > 0 && product.stock <= 5 && (
          <span className="absolute bottom-2 left-2 bg-orange-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm z-10">
            Only {product.stock} left!
          </span>
        )}

        {/* Wishlist heart — bottom right */}
        <button
          onClick={handleWishlist}
          className={`absolute bottom-2 right-2 rounded-full flex items-center justify-center transition-all z-10 ${quiet ? 'w-11 h-11 border border-line' : 'w-8 h-8 shadow-sm'} ${
            isWishlisted
              ? (quiet ? 'bg-marine text-white' : 'bg-red-500 text-white')
              : (quiet ? 'bg-white text-slate hover:text-marine' : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white')
          }`}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
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
                className={`w-6 h-6 rounded-full border-2 transition-all ${activeVariantIndex === idx ? (quiet ? 'border-ink' : 'border-priority-blue scale-110') : (quiet ? 'border-line' : 'border-gray-200')}`}
                style={{ backgroundColor: variant.colorCode || variant.color }}
              />
            ))}
          </div>
        )}

        {/* Name — fixed 2-line height so the buy button aligns across cards */}
        <Link to={productPath(product.slug || product.id)}>
          <h3 className={`text-[16px] leading-snug line-clamp-2 min-h-[2.75rem] transition-colors ${quiet ? 'font-normal text-graphite hover:text-marine' : 'font-semibold text-[#000000]'} ${props.theme === 'premium' ? 'hover:text-red-600' : quiet ? '' : 'hover:text-priority-blue'}`}>
            {product.name}
          </h3>
        </Link>

        {/* Stars + reviews — only when we have a real Amazon rating */}
        <div className="flex items-center gap-2 min-h-[18px]">
          {hasRating ? (
            <>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    className={i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}
                  />
                ))}
              </div>
              <span className={quiet ? 'text-[11px] text-slate font-normal' : 'text-[11px] text-gray-400 font-medium'}>
                {rating.toFixed(1)}{reviews > 0 ? ` (${reviews})` : ''}
              </span>
            </>
          ) : (
            <span className={quiet ? 'text-[10px] text-slate font-normal uppercase tracking-[0.18em]' : 'text-[10px] text-gray-300 font-medium uppercase tracking-widest'}>New Arrival</span>
          )}
        </div>

        {/* Buy on Amazon */}
        {amazonUrl ? (
          <AmazonLink url={amazonUrl} productId={product.id} className={`block text-center w-full py-2.5 text-white text-[11px] uppercase transition-all rounded-sm mt-1 ${quiet ? 'font-medium tracking-[0.2em] bg-marine hover:bg-marine-deep' : 'font-bold tracking-[0.15em]'} ${props.theme === 'premium' ? 'bg-[#111111] hover:bg-[#000000]' : quiet ? '' : 'bg-[#26B3FF] hover:bg-[#0fa0ee]'}`}>
            Buy on Amazon
          </AmazonLink>
        ) : (
          <button disabled className={`w-full py-2.5 text-[11px] uppercase rounded-sm mt-1 cursor-not-allowed ${quiet ? 'font-medium tracking-[0.2em] bg-line text-slate' : 'font-bold tracking-[0.15em] bg-gray-100 text-gray-400'}`}>
            Coming Soon
          </button>
        )}
      </div>
    </div>
  );
};
