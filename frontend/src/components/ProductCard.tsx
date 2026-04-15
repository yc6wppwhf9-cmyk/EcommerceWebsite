import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getProductById, formatPrice } from '../constants/products';
import { Star, Plus, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import type { Product } from '../types';

interface ProductCardProps {
  product?: Product;
  id?: string;
  name?: string;
  price?: string | number;
  rating?: number;
  reviews?: number;
  image?: string;
  badge?: string;
  isNew?: boolean;
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
    <div className="group flex flex-col font-outfit">
      {/* Product Image Container */}
      <div className="relative aspect-[4/5] bg-[#f8f8f8] dark:bg-[#111] overflow-hidden rounded-xl md:rounded-[2rem] transition-all duration-500 hover:shadow-2xl">
        <Link to={`/product/${product.id}`} className="block h-full w-full">
          <div className="h-full w-full flex justify-center items-center p-4 md:p-6">
            <img
              alt={product.name}
              className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-700 group-hover:scale-110"
              src={displayImage}
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          </div>
        </Link>

        {/* Status Badges */}
        <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 flex flex-wrap gap-2 pointer-events-none">
          {product.stock === 0 && (
            <span className="bg-black text-white text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 py-1 md:px-2.5 md:py-1.5 rounded-full shadow-lg">Sold Out</span>
          )}
          {product.statusLabel && (
            <span className="bg-priority-blue text-white text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 py-1 md:px-2.5 md:py-1.5 rounded-full shadow-lg">{product.statusLabel}</span>
          )}
          {product.discount && !product.statusLabel && (
            <span className="bg-red-500 text-white text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 py-1 md:px-2.5 md:py-1.5 rounded-full shadow-lg">{product.discount}</span>
          )}
        </div>

        {/* Wishlist Icon */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 md:top-4 md:right-4 p-1.5 md:p-2 rounded-full backdrop-blur md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 shadow-xl z-20 ${isWishlisted ? 'bg-red-500 text-white !opacity-100' : 'bg-white/80 md:bg-white/50 hover:bg-white text-gray-900'}`}
        >
          <Heart size={14} className="md:hidden" fill={isWishlisted ? "currentColor" : "none"} />
          <Heart size={16} className="hidden md:block" fill={isWishlisted ? "currentColor" : "none"} />
        </button>

        {/* Quick Add Button */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-3 right-3 md:bottom-4 md:right-4 w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-black text-[#14052b] dark:text-white rounded-full flex items-center justify-center shadow-xl transition-all duration-300 active:scale-90 z-20 hover:bg-priority-blue hover:text-white"
        >
          <Plus size={16} className="md:hidden" /><Plus size={20} className="hidden md:block" />
        </button>
      </div>

      {/* Product Info */}
      <div className="mt-3 md:mt-5 px-1 pb-2 space-y-1.5 md:space-y-2">
        {/* Color Swatches */}
        {product.variants && product.variants.length > 0 && (
          <div className="flex gap-1.5 md:gap-2">
            {product.variants.map((variant, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveVariantIndex(idx);
                }}
                className={`w-3.5 h-3.5 md:w-4.5 md:h-4.5 rounded-full border-2 transition-all duration-300 scale-90 hover:scale-110 ${activeVariantIndex === idx ? 'ring-1 ring-priority-blue ring-offset-1 border-white' : 'border-transparent'}`}
                style={{ backgroundColor: variant.colorCode }}
                title={variant.color}
              />
            ))}
          </div>
        )}

        <div className="flex justify-between items-start gap-2">
          <Link to={`/product/${product.id}`}>
            <h3 className="text-[11px] md:text-[13px] font-semibold text-[#14052b] dark:text-[#f8f8f8] leading-tight group-hover:text-priority-blue transition-colors line-clamp-2 uppercase tracking-tighter">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="flex items-center gap-1.5 pb-0.5 md:pb-1">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={8} className={i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 dark:text-gray-800'} />
            ))}
          </div>
          <span className="text-[8px] md:text-[9px] font-bold text-gray-300 uppercase tracking-tighter">({product.reviews})</span>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <span className="text-[13px] md:text-[15px] font-black text-priority-blue tracking-tighter">
            {formatPrice(product.price)}
          </span>
          <span className="text-[10px] md:text-[11px] font-bold text-gray-300 line-through decoration-1 opacity-60 tracking-tighter">
            {formatPrice(product.originalPrice)}
          </span>
        </div>
      </div>
    </div>
  );
};
