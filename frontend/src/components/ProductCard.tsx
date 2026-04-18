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

  if (!product) return null;
  const isWishlisted = isInWishlist(product.id);

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

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="flex flex-col font-outfit bg-white">
      {/* Image */}
      <Link
        to={`/product/${product.slug || product.id}`}
        className="relative block bg-[#F5F5F5] overflow-hidden"
        style={{ aspectRatio: '1 / 1' }}
      >
        <div className="w-full h-full flex items-center justify-center p-4">
          <LazyImage
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
            src={displayImage}
            width={400}
          />
        </div>

        {/* NEW badge */}
        {product.isNew && (
          <span className="absolute top-3 right-3 bg-[#8750DA] text-white text-[9px] font-black uppercase tracking-widest px-2 py-1">
            NEW
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="pt-3 pb-1 space-y-2">
        {/* Color swatches */}
        {product.variants && product.variants.length > 0 && (
          <div className="flex gap-2">
            {product.variants.map((variant, idx) => (
              <button
                key={idx}
                onClick={() => setActiveVariantIndex(idx)}
                className={`w-4 h-4 rounded-full border-2 transition-all ${activeVariantIndex === idx ? 'border-[#8750DA] scale-110' : 'border-gray-200'}`}
                style={{ backgroundColor: variant.colorCode || variant.color }}
              />
            ))}
          </div>
        )}

        {/* Name */}
        <Link to={`/product/${product.slug || product.id}`}>
          <h3 className="text-[14px] font-bold text-[#111] leading-snug line-clamp-2 hover:text-[#8750DA] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Stars + reviews */}
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={13}
                className={i < Math.round(product.rating ?? 4) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'}
              />
            ))}
          </div>
          <span className="text-[11px] text-gray-400 font-medium">
            {(product as any).reviews ?? 0} reviews
          </span>
        </div>

        {/* Price row */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-[15px] font-bold text-[#8750DA]">
            ₹ {product.price.toLocaleString('en-IN')}.00
          </span>
          {discount > 0 && (
            <>
              <span className="text-[13px] text-gray-400 line-through">
                ₹ {originalPrice.toLocaleString('en-IN')}.00
              </span>
              <span className="text-[12px] font-bold text-gray-700">
                {discount}% off
              </span>
            </>
          )}
        </div>

        {/* Move to Cart button */}
        <button
          onClick={handleAddToCart}
          className="w-full py-2.5 bg-[#7B5EA7] hover:bg-[#6a4f93] text-white text-[11px] font-bold uppercase tracking-[0.15em] transition-colors"
        >
          + MOVE TO CART
        </button>
      </div>
    </div>
  );
};
