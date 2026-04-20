import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Star,
  Heart,
  ChevronDown,
  Minus,
  Plus,
  ShoppingCart,
  Laptop,
  Sparkles,
  Briefcase,
  Feather,
  ShieldCheck,
  Maximize,
  TramFront,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatPrice } from '../constants/products';
import { api } from '../lib/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/ProductCard';
import { LazyImage } from '../components/LazyImage';
import { SEO } from '../components/SEO';

const THEMES = {
  junior: {
    btn: 'bg-[#755FF1] hover:bg-[#6147d3] text-white tracking-[0.15em] font-bold',
    btnOutline: 'border-2 border-[#755FF1] text-[#755FF1] hover:bg-[#755FF1] hover:text-white tracking-[0.15em] font-bold',
    price: 'text-[#755FF1]',
    badge: 'bg-[#FDB913] text-black',
    wishlistActive: 'border-[#755FF1] bg-[#755FF1]/10 text-[#755FF1]',
    wishlistHover: 'hover:border-[#755FF1]',
    accordionActive: 'text-[#755FF1]',
    shadow: 'shadow-[0_20px_40px_-10px_rgba(117,95,241,0.3)]',
  },
  premium: {
    btn: 'bg-[#b80000] hover:bg-[#960000] text-white tracking-[0.2em] font-medium',
    btnOutline: 'border-2 border-[#b80000] text-[#b80000] hover:bg-[#b80000] hover:text-white tracking-[0.2em] font-medium',
    price: 'text-black',
    badge: 'bg-[#b80000] text-white',
    wishlistActive: 'border-red-700 bg-red-50 text-red-700',
    wishlistHover: 'hover:border-red-700',
    accordionActive: 'text-[#b80000]',
    shadow: 'shadow-[0_20px_40px_-10px_rgba(184,0,0,0.3)]',
  },
  default: {
    btn: 'bg-[#14052b] hover:bg-[#2a0f50] text-white tracking-[0.3em] font-black',
    btnOutline: 'border-2 border-[#14052b] text-[#14052b] hover:bg-[#14052b] hover:text-white tracking-[0.3em] font-black',
    price: 'text-[#14052b]',
    badge: 'bg-[#755FF1] text-white',
    wishlistActive: 'border-red-500 bg-red-50 text-red-500',
    wishlistHover: 'hover:border-red-500',
    accordionActive: 'text-[#ae9efd]',
    shadow: 'shadow-[0_20px_40px_-10px_rgba(20,5,43,0.3)]',
  },
} as const;

const FALLBACK_HIGHLIGHTS = [
  { Icon: Laptop,      title: 'Laptop Sleeve',            desc: 'Secure padded pocket for up to 15.6" devices.' },
  { Icon: Sparkles,    title: 'Stylish yet Functional',   desc: 'Minimalist aesthetic with high-performance utility.' },
  { Icon: Briefcase,   title: 'Easy access Pockets',      desc: 'Quick-access front compartment for essentials.' },
  { Icon: Feather,     title: 'Premium Fabric',           desc: 'Water-resistant luxury nylon construction.' },
  { Icon: ShieldCheck, title: '12 Month Warranty',        desc: 'Peace of mind with our quality guarantee.' },
  { Icon: Maximize,    title: 'Spacious - 2 Compartment', desc: 'Optimized organization for daily travel.' },
  { Icon: TramFront,   title: 'Trolley Sleeve',           desc: 'Easily slides onto luggage handles for travel convenience.' },
  { Icon: Zap,         title: 'Quick Shipping',           desc: 'Delivered to your doorstep within 3-5 business days.' },
];
const FEATURE_ICONS = [Laptop, Sparkles, Briefcase, Feather, ShieldCheck, Maximize, TramFront, Zap];

// ─── Accordion (defined outside to avoid recreation on every render) ──────────
interface AccordionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  openAccordion: string | null;
  setOpenAccordion: (id: string | null) => void;
  accordionActiveClass: string;
}

const AccordionItem = ({ id, title, children, openAccordion, setOpenAccordion, accordionActiveClass }: AccordionProps) => {
  const isOpen = openAccordion === id;
  return (
    <div className="border-b border-gray-100 last:border-0 font-outfit">
      <button
        onClick={() => setOpenAccordion(isOpen ? null : id)}
        className="w-full py-6 flex justify-between items-center"
      >
        <span className={`text-[13px] font-black uppercase tracking-[0.2em] transition-colors ${isOpen ? accordionActiveClass : 'text-[#14052b]'}`}>
          {title}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-300 ${isOpen ? `rotate-180 ${accordionActiveClass}` : 'text-gray-300'}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pb-8 text-[13px] text-gray-500 leading-relaxed font-medium">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
export const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const themeKey = (searchParams.get('theme') ?? 'default') as keyof typeof THEMES;
  const theme = THEMES[themeKey] ?? THEMES.default;
  const navigate = useNavigate();
  const { addItem, showToast } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [openAccordion, setOpenAccordion] = useState<string | null>('highlight');
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const isWishlisted = product ? isInWishlist(product.id) : false;

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setProduct(null);
    setFetchError(false);
    setQuantity(1);
    setSelectedVariantIndex(0);
    setSelectedImage(0);
    window.scrollTo(0, 0);
    api.getProduct(slug).then((raw: any) => {
      setProduct({
        ...raw,
        originalPrice: raw.original_price ?? raw.originalPrice ?? raw.price,
        reviews: raw.reviews ?? 0,
        rating: raw.rating ?? 4,
        specifications: raw.specifications ?? {},
        features: Array.isArray(raw.features) ? raw.features : [],
        category: raw.categories?.slug ?? raw.sub_category ?? '',
        images: Array.isArray(raw.images) && raw.images.length > 0
          ? raw.images
          : raw.image ? [raw.image] : [],
      });
    }).catch(() => setFetchError(true)).finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!product?.category) return;
    api.getProducts({ category: product.category }).then(res => {
      setRelatedProducts(res.products.filter((p: any) => p.id !== product.id).slice(0, 4));
    }).catch(() => {});
  }, [product?.category, product?.id]);

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-32 text-center font-outfit">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#14052b] border-t-transparent animate-spin" />
          <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">Loading Product...</p>
        </div>
      </main>
    );
  }

  if (fetchError) {
    return (
      <main className="container mx-auto px-4 py-32 text-center font-outfit">
        <h1 className="text-3xl font-black mb-4 uppercase tracking-tighter">Couldn't Load Product</h1>
        <p className="text-gray-400 mb-8 font-bold uppercase tracking-widest text-[11px]">Check your connection and try again.</p>
        <button
          onClick={() => { setFetchError(false); setLoading(true); api.getProduct(slug!).then((raw: any) => { setProduct({ ...raw, originalPrice: raw.original_price ?? raw.originalPrice ?? raw.price, reviews: raw.reviews ?? 0, rating: raw.rating ?? 4, specifications: raw.specifications ?? {}, features: Array.isArray(raw.features) ? raw.features : [], category: raw.categories?.slug ?? raw.sub_category ?? '', images: Array.isArray(raw.images) && raw.images.length > 0 ? raw.images : raw.image ? [raw.image] : [] }); setFetchError(false); }).catch(() => setFetchError(true)).finally(() => setLoading(false)); }}
          className="bg-[#14052b] text-white font-black text-xs px-10 py-5 rounded-xl hover:scale-105 transition-all tracking-widest uppercase inline-flex items-center gap-2"
        >
          <RefreshCw size={14} /> Retry
        </button>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="container mx-auto px-4 py-32 text-center font-outfit">
        <h1 className="text-3xl font-black mb-4 uppercase tracking-tighter">Product Not Found</h1>
        <p className="text-gray-400 mb-8 font-bold uppercase tracking-widest text-[11px]">We couldn't find the product you're looking for.</p>
        <Link to="/" className="bg-[#14052b] text-white font-black text-xs px-10 py-5 rounded-xl hover:scale-105 transition-all tracking-widest uppercase inline-block">
          Go Home
        </Link>
      </main>
    );
  }

  const activeVariant = product.variants?.[selectedVariantIndex];
  const rawDisplayImages = activeVariant?.images?.length > 0 ? activeVariant.images : product.images;
  const displayImages: string[] = rawDisplayImages?.length > 0 ? rawDisplayImages : product.image ? [product.image] : [];
  const inStock = product.stock > 0;
  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const featureItems: { Icon: React.FC<any>; title: string; desc: string }[] =
    product.features.length > 0
      ? product.features.slice(0, 8).map((f: string, i: number) => ({
          Icon: FEATURE_ICONS[i % FEATURE_ICONS.length],
          title: f,
          desc: '',
        }))
      : FALLBACK_HIGHLIGHTS;

  const handleAddToCart = () => {
    const p = { ...product, image: displayImages[selectedImage] || product.image };
    addItem(p, quantity);
  };

  const handleBuyNow = () => {
    const p = { ...product, image: displayImages[selectedImage] || product.image };
    addItem(p, quantity);
    navigate('/checkout');
  };

  const handleToggleWishlist = () => {
    if (product) toggleWishlist(product);
  };

  const handleSubmitReview = async () => {
    if (userRating === 0) {
      showToast('Please select a star rating first.', 'error');
      return;
    }
    setSubmittingReview(true);
    try {
      await api.createReview({ product_id: product.id, rating: userRating, body: reviewText || undefined });
      setShowReviewForm(false);
      setUserRating(0);
      setReviewText('');
      showToast('Thank you! Your review has been submitted.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit review. Please try again.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const productImage = product.images?.[0] || product.image;
  const rawDesc = product.description ?? `Buy ${product.name} at Priority Bags. Premium quality, fast shipping across India.`;
  const productDesc = rawDesc.length > 155 ? rawDesc.slice(0, 152) + '…' : rawDesc;

  const accordionProps = { openAccordion, setOpenAccordion, accordionActiveClass: theme.accordionActive };

  const hasDescription = !!product.description?.trim();
  const hasSpecs = Object.keys(product.specifications).length > 0;
  const hasFeatures = product.features.length > 0;

  return (
    <main className="bg-white min-h-screen font-outfit pt-4 md:pt-8 overflow-x-hidden relative pb-24 md:pb-0">
      <SEO
        title={product.name}
        description={productDesc}
        image={productImage}
        url={`https://prioritybags.in/product/${product.slug || product.id}`}
        type="product"
      />
      <div className="container mx-auto px-4 md:px-8 py-6 md:py-16 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16">

          {/* Left Column: Gallery */}
          <div className="lg:col-span-7">
            <div className="lg:sticky lg:top-32 space-y-4 md:space-y-8">
              <motion.div
                key={`${selectedVariantIndex}-${selectedImage}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-[660px] mx-auto aspect-square bg-white border border-gray-50 rounded-2xl md:rounded-[3rem] p-6 md:p-12 flex items-center justify-center relative shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] md:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)]"
              >
                <LazyImage
                  src={displayImages[selectedImage] || product.image}
                  alt={product.name}
                  className="w-full h-full object-contain"
                  width={800}
                  priority
                />
                <button
                  onClick={handleToggleWishlist}
                  className={`absolute top-4 right-4 md:top-10 md:right-10 p-3 md:p-4 bg-white shadow-xl rounded-full transition-all border border-gray-50 ${isWishlisted ? 'text-red-500 scale-110' : 'text-gray-300 hover:text-red-500'}`}
                >
                  <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                </button>
              </motion.div>

              {displayImages.length > 1 && (
                <div className="flex gap-3 md:gap-4 pb-4 overflow-x-auto no-scrollbar">
                  {displayImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-20 h-20 md:w-24 md:h-24 rounded-xl md:rounded-2xl border-2 transition-all p-2 md:p-3 shrink-0 bg-white ${selectedImage === idx ? 'border-priority-blue shadow-lg' : 'border-gray-50 hover:border-gray-200'}`}
                    >
                      <LazyImage src={img} alt="Thumb" className="w-full h-full object-contain" width={150} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Info */}
          <div className="lg:col-span-5 space-y-8 md:space-y-12">
            <div className="space-y-4 md:space-y-6 text-center lg:text-left">
              <h1 className="text-2xl md:text-5xl font-black text-[#14052b] leading-[1.1] tracking-tighter uppercase">{product.name}</h1>

              <div className="flex items-center justify-center lg:justify-start gap-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} />
                  ))}
                </div>
                <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-gray-400">{product.reviews} verified reviews</span>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 md:gap-4 border-t border-gray-50 pt-6 md:pt-8">
                <span className={`text-3xl md:text-5xl font-black tracking-tighter ${theme.price}`}>{formatPrice(product.price)}</span>
                {discount > 0 && (
                  <>
                    <span className="text-base md:text-xl text-gray-300 line-through font-black tracking-tighter">{formatPrice(product.originalPrice)}</span>
                    <span className={`text-[12px] md:text-[13px] font-black uppercase px-3 py-1 rounded-full ${theme.badge}`}>{discount}% off</span>
                  </>
                )}
              </div>

              {/* Low stock warning */}
              {inStock && product.stock <= 5 && (
                <p className="text-[11px] font-black uppercase tracking-widest text-orange-500">
                  Only {product.stock} left in stock!
                </p>
              )}
              {!inStock && (
                <p className="text-[11px] font-black uppercase tracking-widest text-red-500">Out of Stock</p>
              )}

              {/* Variant Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Color:</span>
                    <span className="text-[11px] font-black uppercase tracking-widest text-[#14052b]">{activeVariant?.color}</span>
                  </div>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                    {product.variants.map((variant: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => { setSelectedVariantIndex(idx); setSelectedImage(0); }}
                        className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 transition-all p-0.5 flex items-center justify-center ${selectedVariantIndex === idx ? 'border-priority-blue shadow-lg scale-110' : 'border-gray-100 hover:border-gray-300'}`}
                      >
                        <div className="w-full h-full rounded-full" style={{ backgroundColor: variant.colorCode }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4">
                {/* Quantity stepper */}
                <div className="h-14 md:h-16 w-full sm:w-auto bg-gray-50 rounded-xl md:rounded-2xl flex items-center border border-gray-100 overflow-hidden px-2">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-12 h-full flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-400"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-black text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    className="w-12 h-full flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-400 disabled:opacity-30"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Add to Cart + Wishlist */}
                <div className="flex items-center gap-3 w-full sm:flex-1">
                  <button
                    onClick={handleAddToCart}
                    disabled={!inStock}
                    className={`flex-1 h-14 md:h-16 text-[10px] md:text-[11px] uppercase rounded-xl md:rounded-2xl ${theme.btnOutline} transition-all disabled:grayscale disabled:opacity-50 flex items-center justify-center gap-2`}
                  >
                    <ShoppingCart size={16} />
                    Add to Cart
                  </button>

                  <button
                    onClick={handleToggleWishlist}
                    className={`h-14 w-14 md:h-16 md:w-16 rounded-xl md:rounded-2xl border-2 flex items-center justify-center transition-all shrink-0 ${isWishlisted ? theme.wishlistActive : `border-gray-100 text-gray-400 ${theme.wishlistHover}`}`}
                  >
                    <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>

              {/* Buy Now — full width */}
              <button
                onClick={handleBuyNow}
                disabled={!inStock}
                className={`w-full h-14 md:h-16 text-[10px] md:text-[11px] uppercase rounded-xl md:rounded-2xl ${theme.btn} ${theme.shadow} hover:scale-[1.01] transition-all disabled:grayscale disabled:opacity-50`}
              >
                Buy Now
              </button>
            </div>

            {/* Accordions */}
            <div className="pt-12">
              {hasFeatures && (
                <AccordionItem id="highlight" title="Highlight" {...accordionProps}>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-4 pt-4">
                    {featureItems.map((h, i) => (
                      <li key={i} className="flex gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-priority-blue group-hover:bg-[#ae9efd] group-hover:text-white transition-all shrink-0">
                          <h.Icon size={18} strokeWidth={1.5} />
                        </div>
                        <div className="space-y-0.5 py-0.5">
                          <h4 className="font-black text-[#14052b] uppercase text-[10px] tracking-widest leading-none">{h.title}</h4>
                          {h.desc && <p className="text-[11px] text-gray-400 leading-tight">{h.desc}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </AccordionItem>
              )}

              {hasDescription && (
                <AccordionItem id="description" title="Brand Story" {...accordionProps}>
                  <p className="text-[13px] text-gray-600 leading-relaxed">{product.description}</p>
                </AccordionItem>
              )}

              <AccordionItem id="reviews" title={`Customer Reviews (${product.reviews})`} {...accordionProps}>
                <div className="space-y-10 pt-4 mb-8">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-gray-50 pb-8">
                    <div className="text-center sm:text-left">
                      <h4 className="text-4xl font-black text-[#14052b] tracking-tighter">{product.rating?.toFixed(1) ?? '—'} / 5.0</h4>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">Join {product.reviews} verified owners</p>
                    </div>
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="w-full sm:w-auto px-10 py-4 bg-[#14052b] text-white text-[10px] font-black uppercase tracking-[0.25em] rounded-2xl shadow-xl hover:scale-105 transition-all"
                    >
                      {showReviewForm ? 'Cancel Review' : 'Write a Review'}
                    </button>
                  </div>

                  <AnimatePresence>
                    {showReviewForm && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-gray-50 p-6 sm:p-10 rounded-[2.5rem] space-y-6 border border-gray-100 shadow-2xl shadow-gray-200/50"
                      >
                        <div className="space-y-2">
                          <h4 className="text-lg font-black uppercase tracking-tighter text-[#14052b]">Share Your Journey</h4>
                          <p className="text-xs text-gray-400 font-medium">How was your experience with the {product.name}?</p>
                        </div>

                        <div className="flex gap-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={28}
                              onClick={() => setUserRating(star)}
                              className={`cursor-pointer transition-all hover:scale-125 ${star <= userRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>

                        <textarea
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          className="w-full bg-white border border-gray-100 rounded-[1.5rem] p-5 text-sm focus:outline-none focus:ring-4 focus:ring-priority-blue/5 transition-all placeholder:text-gray-300 min-h-[120px]"
                          placeholder="What adventures did you take this bag on?..."
                        />

                        <button
                          onClick={handleSubmitReview}
                          disabled={submittingReview}
                          className="w-full py-5 bg-[#14052b] text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl hover:shadow-2xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submittingReview ? 'Submitting…' : 'Submit Review'}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {product.reviews === 0 && (
                    <p className="text-[12px] text-gray-400 font-medium text-center py-6">No reviews yet. Be the first to review this product!</p>
                  )}
                </div>
              </AccordionItem>

              {hasSpecs && (
                <AccordionItem id="size" title="Technical Specs" {...accordionProps}>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(([key, val]) => (
                      <div key={key} className="p-4 bg-gray-50 rounded-xl">
                        <span className="block text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">{key}</span>
                        <span className="block text-[13px] font-bold text-[#14052b]">{val as string}</span>
                      </div>
                    ))}
                  </div>
                </AccordionItem>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 md:mt-40 pt-10 md:pt-20 border-t border-gray-100 pb-20 md:pb-0">
            <div className="flex justify-between items-end mb-8 md:mb-16">
              <h2 className={`text-xl md:text-4xl font-black uppercase tracking-tighter ${themeKey === 'premium' ? 'text-black' : themeKey === 'junior' ? 'text-[#755FF1]' : 'text-[#14052b]'}`}>
                You May Also Like
              </h2>
              <Link
                to={`/${product.category}${themeKey !== 'default' ? `?theme=${themeKey}` : ''}`}
                className={`text-[10px] md:text-[11px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all whitespace-nowrap ml-4 ${themeKey === 'premium' ? 'text-black border-black hover:text-[#b80000] hover:border-[#b80000]' : themeKey === 'junior' ? 'text-[#755FF1] border-[#755FF1]' : 'text-[#14052b] border-[#14052b] hover:text-[#ae9efd] hover:border-[#ae9efd]'}`}
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
              {relatedProducts.map(p => <ProductCard key={p.id} product={p} theme={themeKey !== 'default' ? themeKey : undefined} />)}
            </div>
          </div>
        )}
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-4 py-3 flex gap-3 shadow-2xl">
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className={`flex-1 h-12 text-[10px] uppercase rounded-xl ${theme.btnOutline} transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 font-black tracking-wider`}
        >
          <ShoppingCart size={14} /> Cart
        </button>
        <button
          onClick={handleBuyNow}
          disabled={!inStock}
          className={`flex-1 h-12 text-[10px] uppercase rounded-xl ${theme.btn} transition-all disabled:opacity-50 font-black tracking-wider`}
        >
          Buy Now
        </button>
      </div>
    </main>
  );
};
