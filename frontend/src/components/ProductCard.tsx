import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { getProductById } from '../constants/products';
import { Star, Heart } from 'lucide-react';
import type { Product } from '../types';
import { LazyImage } from './LazyImage';

interface ProductCardProps {
  product?: Product;
  id?: string;
  theme?: string;
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
  const rating = product.rating ?? 4.2;
  const reviews = (product as any).reviews ?? 0;

  const amazonUrl = (product as any).amazon_url;

  const handleBuyOnAmazon = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (amazonUrl) window.open(amazonUrl, '_blank', 'noopener,noreferrer');
  };

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
        className="relative block rounded-[5px] overflow-hidden bg-[#F9F9F9]"
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

        {/* Discount badge — top left */}
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-black uppercase px-2 py-1 rounded-sm z-10">
            -{discount}%
          </span>
        )}

        {/* Best Seller badge — top right (takes priority over NEW) */}
        {product.highlighted ? (
          <span className="absolute top-2 right-2 bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm z-10">
            BEST SELLER
          </span>
        ) : product.isNew ? (
          <span className="absolute top-2 right-2 bg-priority-blue text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm z-10">
            NEW
          </span>
        ) : null}

        {/* Low stock warning */}
        {product.stock > 0 && product.stock <= 5 && (
          <span className="absolute bottom-2 left-2 bg-orange-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm z-10">
            Only {product.stock} left!
          </span>
        )}

        {/* Wishlist heart — bottom right */}
        <button
          onClick={handleWishlist}
          className={`absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm z-10 ${
            isWishlisted
              ? 'bg-red-500 text-white'
              : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white'
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
                className={`w-6 h-6 rounded-full border-2 transition-all ${activeVariantIndex === idx ? 'border-priority-blue scale-110' : 'border-gray-200'}`}
                style={{ backgroundColor: variant.colorCode || variant.color }}
              />
            ))}
          </div>
        )}

        {/* Name */}
        <Link to={productPath(product.slug || product.id)}>
          <h3 className={`text-[16px] font-semibold text-[#000000] leading-snug line-clamp-2 transition-colors ${props.theme === 'premium' ? 'hover:text-red-600' : 'hover:text-priority-blue'}`}>
            {product.name}
          </h3>
        </Link>

        {/* Stars + reviews — always shown */}
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={13}
                className={i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}
              />
            ))}
          </div>
          {reviews > 0 ? (
            <span className="text-[11px] text-gray-400 font-medium">{reviews} reviews</span>
          ) : (
            <span className="text-[10px] text-gray-300 font-medium">New Arrival</span>
          )}
        </div>

        {/* Price row */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-[16px] font-semibold text-priority-blue">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {discount > 0 && (
            <>
              <span className="text-[14px] text-gray-400 line-through font-medium">
                ₹{originalPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-[13px] font-semibold text-gray-700">
                {discount}% off
              </span>
            </>
          )}
        </div>

        {/* Buy on Amazon */}
        {amazonUrl ? (
          <button onClick={handleBuyOnAmazon} className={`w-full py-2.5 text-white text-[11px] font-bold uppercase tracking-[0.15em] transition-all rounded-sm mt-1 ${props.theme === 'premium' ? 'bg-[#111111] hover:bg-[#000000]' : 'bg-[#26B3FF] hover:bg-[#0fa0ee]'}`}>
            Buy on Amazon
          </button>
        ) : (
          <button disabled className="w-full py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] rounded-sm mt-1 bg-gray-100 text-gray-400 cursor-not-allowed">
            Coming Soon
          </button>
        )}
      </div>
    </div>
  );
};
