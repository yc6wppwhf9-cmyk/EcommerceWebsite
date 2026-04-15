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
      <div className="relative aspect-[1/1] bg-white overflow-hidden transition-all duration-500 hover:shadow-lg">
        <Link to={`/product/${product.id}`} className="block h-full w-full">
          <div className="h-full w-full flex justify-center items-center p-4">
            <img
              alt={product.name}
              className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
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
      </div>

      {/* Product Info - Centered as per screenshot */}
      <div className="mt-6 space-y-2 text-center">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-[10px] md:text-[11px] font-black text-[#111] uppercase tracking-[0.1em] hover:text-gray-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-center gap-3">
          <span className="text-[11px] md:text-[12px] font-black text-[#111] tracking-tight">
            ₹ {product.price.toLocaleString()}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-[10px] md:text-[11px] font-bold text-red-500 line-through decoration-1 opacity-60 tracking-tight">
              ₹ {product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
