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
    <div className={`group flex flex-col font-outfit ${props.theme === 'premium' ? 'items-center' : ''}`}>
      {/* Product Image Container */}
      <div className={`relative ${props.theme === 'premium' ? 'w-full aspect-[199/298]' : 'aspect-[379/411]'} bg-white overflow-hidden transition-all duration-500`}>
        <Link to={`/product/${product.slug || product.id}${props.theme === 'premium' ? '?theme=premium' : ''}`} className="block h-full w-full">
          <div className="h-full w-full flex justify-center items-center p-4">
            <img
              alt={product.name}
              className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-105"
              src={displayImage}
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          </div>
        </Link>

        {/* Wishlist Icon */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-300 z-20 ${isWishlisted ? 'text-red-500' : 'text-gray-300 hover:text-red-500'}`}
        >
          <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
        </button>

        {/* New Premium Overlay Icons could go here if needed, but per screenshot we follow clean look */}
      </div>

      {/* Color Swatches (As per screenshot) */}
      {props.theme === 'premium' && product.variants && product.variants.length > 0 && (
        <div className="flex justify-center gap-2 mt-4 mb-2">
          {product.variants.map((variant, idx) => (
            <button
              key={idx}
              onClick={() => setActiveVariantIndex(idx)}
              className={`w-3 h-3 rounded-full border border-gray-200 transition-all ${activeVariantIndex === idx ? 'scale-125 ring-1 ring-black' : ''}`}
              style={{ backgroundColor: variant.color }}
            />
          ))}
        </div>
      )}

      {/* Product Info */}
      <div className={`mt-2 space-y-1 text-center ${props.theme === 'premium' ? 'w-full' : ''}`}>
        <Link to={`/product/${product.slug || product.id}${props.theme === 'premium' ? '?theme=premium' : ''}`}>
          <h3 className={`${props.theme === 'premium' ? 'text-[14px] font-light text-[#111]' : 'text-[10px] md:text-[11px] font-black text-[#111] uppercase tracking-[0.1em]'} hover:text-gray-600 transition-colors`}>
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-center gap-3">
          <span className={`${props.theme === 'premium' ? 'text-[19.84px] font-semibold text-black' : 'text-[11px] md:text-[12px] font-black text-[#111]'} tracking-tight`}>
            ₹ {product.price.toLocaleString()}
          </span>
          {product.originalPrice > product.price && props.theme !== 'premium' && (
            <span className="text-[10px] md:text-[11px] font-bold text-red-500 line-through decoration-1 opacity-60 tracking-tight">
              ₹ {product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* MOVE TO CART Button for Premium Theme */}
        {props.theme === 'premium' && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleAddToCart}
              className="w-full max-w-[240px] h-[36px] bg-black hover:bg-[#b80000] text-white flex items-center justify-center transition-all duration-300"
            >
              <span className="text-[10.08px] font-semibold tracking-[0.2em] font-outfit uppercase">
                + MOVE TO CART
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
