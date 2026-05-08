import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/ProductCard';
import { Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Wishlist = () => {
  const { wishlist } = useWishlist();

  return (
    <main className="min-h-screen bg-white dark:bg-black font-outfit pt-10 md:pt-32 pb-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center mx-auto text-red-500 shadow-xl shadow-red-500/10">
            <Heart size={32} fill="currentColor" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">My Wishlist</h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Your curated collection of priority favorites</p>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-[4rem] border-2 border-dashed border-gray-100 dark:border-white/5">
            <ShoppingBag size={48} className="mx-auto text-gray-200 mb-6" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-8">Your wishlist is empty</p>
            <Link to="/" className="inline-block bg-priority-blue text-white font-black text-xs px-12 py-5 rounded-2xl uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all">
              Discover Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
            {wishlist.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};
