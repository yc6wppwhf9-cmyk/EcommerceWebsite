import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatPrice } from '../constants/products';
import { api } from '../lib/api';
import type { Product } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'default' | 'premium';
}

export const SearchModal = ({ isOpen, onClose, theme = 'default' }: SearchModalProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length >= 2) {
      api.getProducts({ search: query }).then(res => {
        // The API returns the joined `categories` object, not a flat `category`
        // string — casting the raw row straight to Product left category
        // undefined and threw on `.replace()` while rendering results.
        const products = (res.products as any[]).map(raw => ({
          ...raw,
          category: raw.categories?.slug ?? raw.sub_category ?? '',
        })) as Product[];
        setResults(products.slice(0, 8));
      }).catch(() => {});
    } else {
      setResults([]);
    }
  }, [query]);

  const isPremium = theme === 'premium';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[80] ${isPremium ? 'bg-black/85 backdrop-blur-md' : 'bg-black/50 backdrop-blur-sm'}`}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-0 left-0 right-0 z-[90] pb-6 overflow-hidden ${isPremium ? 'bg-[#0a0a0a] border-b border-white/10' : 'bg-white shadow-2xl pb-4'}`}
          >
            {isPremium ? (
              /* ── PREMIUM DARK SEARCH ── */
              <div className="max-w-2xl mx-auto px-6 pt-8 pb-2">
                <div className="flex items-center gap-4 border-b border-white/20 pb-4 focus-within:border-white/60 transition-colors duration-300">
                  <Search className="w-4 h-4 text-white/40 shrink-0" strokeWidth={1.5} />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search collection…"
                    className="flex-1 bg-transparent text-white text-[15px] font-outfit font-light tracking-[0.05em] outline-none placeholder:text-white/25"
                  />
                  <button
                    onClick={onClose}
                    className="p-1 text-white/30 hover:text-white transition-colors shrink-0"
                    aria-label="Close search"
                  >
                    <X className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>

                {results.length > 0 && (
                  <div className="mt-6 max-h-[60vh] overflow-y-auto">
                    <p className="text-[10px] font-semibold text-white/25 uppercase tracking-[0.3em] mb-4">{results.length} results</p>
                    <div className="flex flex-col divide-y divide-white/5">
                      {results.map((product) => (
                        <Link
                          key={product.id}
                          to={`/product/${product.id}`}
                          onClick={onClose}
                          className="flex items-center gap-4 py-3 hover:bg-white/5 -mx-2 px-2 transition-colors"
                        >
                          <div className="w-12 h-12 bg-white/5 shrink-0 overflow-hidden flex items-center justify-center">
                            <img src={product.image} alt={product.name} className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-white/90 tracking-[0.05em] line-clamp-1">{product.name}</p>
                            <p className="text-[11px] text-white/30 uppercase tracking-[0.15em] mt-0.5">{product.category.replace(/-/g, ' ')}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {query.length >= 2 && results.length === 0 && (
                  <div className="mt-8 text-center">
                    <p className="text-white/25 text-[13px] tracking-[0.1em]">No results for "{query}"</p>
                  </div>
                )}
              </div>
            ) : (
              /* ── DEFAULT LIGHT SEARCH ── */
              <div className="max-w-3xl mx-auto px-4 pt-10">
                <div className="flex items-center gap-4 border-2 border-priority-blue/30 rounded-2xl px-5 py-2.5 bg-white focus-within:border-priority-blue shadow-sm transition-all">
                  <Search className="w-5 h-5 text-priority-blue animate-pulse shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for backpacks, luggage, accessories..."
                    className="flex-1 text-sm outline-none placeholder:text-gray-300 font-outfit font-medium"
                  />
                  <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-gray-50 rounded-full transition-colors shrink-0"
                    aria-label="Close search"
                  >
                    <X className="w-5 h-5 text-gray-400 hover:text-gray-900" />
                  </button>
                </div>

                {results.length > 0 && (
                  <div className="mt-6 border-t border-gray-100 pt-4 max-h-[60vh] overflow-y-auto">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{results.length} results</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {results.map((product) => (
                        <Link
                          key={product.id}
                          to={`/product/${product.id}`}
                          onClick={onClose}
                          className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                            <img src={product.image} alt={product.name} className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 line-clamp-1">{product.name}</p>
                            <p className="text-xs text-gray-400 capitalize mt-0.5">{product.category.replace(/-/g, ' ')}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {query.length >= 2 && results.length === 0 && (
                  <div className="mt-6 border-t border-gray-100 pt-8 text-center">
                    <p className="text-gray-400">No products found for "{query}"</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
