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
import { Breadcrumb } from '../components/Breadcrumb';

const THEMES = {
  junior: {
    btn: 'bg-[#F69245] hover:bg-[#e07d3a] text-white tracking-[0.15em] font-bold',
    btnOutline: 'border-2 border-[#8750DA] text-[#8750DA] hover:bg-[#8750DA] hover:text-white tracking-[0.15em] font-bold',
    price: 'text-[#F69245]',
    badge: 'bg-[#F69245] text-white',
    wishlistActive: 'border-[#8750DA] bg-[#8750DA]/10 text-[#8750DA]',
    wishlistHover: 'hover:border-[#8750DA]',
    accordionActive: 'text-[#F69245]',
    shadow: 'shadow-[0_20px_40px_-10px_rgba(246,146,69,0.3)]',
  },
  premium: {
    btn: 'bg-[#111111] hover:bg-[#000000] text-white tracking-[0.2em] font-bold',
    btnOutline: 'border-2 border-[#b80000] text-[#b80000] hover:bg-[#b80000] hover:text-white tracking-[0.2em] font-bold',
    price: 'text-black',
    badge: 'bg-[#b80000] text-white',
    wishlistActive: 'border-red-700 bg-red-50 text-red-700',
    wishlistHover: 'hover:border-red-700',
    accordionActive: 'text-[#b80000]',
    shadow: 'shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)]',
  },
  default: {
    btn: 'bg-[#26B3FF] hover:bg-[#0fa0ee] text-white tracking-[0.2em] font-bold',
    btnOutline: 'border-2 border-[#14052b] text-[#14052b] hover:bg-[#14052b] hover:text-white tracking-[0.2em] font-bold',
    price: 'text-[#14052b]',
    badge: 'bg-[#26B3FF] text-white',
    wishlistActive: 'border-[#26B3FF] bg-[#26B3FF]/10 text-[#26B3FF]',
    wishlistHover: 'hover:border-[#26B3FF]',
    accordionActive: 'text-[#26B3FF]',
    shadow: 'shadow-[0_20px_40px_-10px_rgba(38,179,255,0.25)]',
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
  // Theme comes only from the URL (?theme=…). Product links on premium/junior
  // pages set it; links from home/default don't, so a product opened from home
  // no longer inherits a sticky premium/junior theme from sessionStorage.
  const themeKey = (searchParams.get('theme') || 'default') as keyof typeof THEMES;
  const theme = THEMES[themeKey] ?? THEMES.default;
  const navigate = useNavigate();
  const { showToast } = useCart();
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
  const [viewerCount, setViewerCount] = useState(0);
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
      const rawColors = Array.isArray(raw.colors) ? raw.colors : [];
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
        variants: rawColors.length > 0
          ? rawColors.filter((c: any) => (c.name ?? c.color ?? '').trim()).map((c: any) => ({
              color: c.name ?? c.color ?? '',
              colorCode: c.code ?? c.colorCode ?? '',
              images: Array.isArray(c.images) ? c.images.filter(Boolean) : [],
            }))
          : (Array.isArray(raw.variants) && raw.variants.length > 0 ? raw.variants : []),
      });
    }).catch(() => setFetchError(true)).finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!product?.category) return;
    api.getProducts({
      category: product.category,
      isPremium: product.is_premium ? 'true' : 'false',
    }).then(res => {
      setRelatedProducts(res.products.filter((p: any) => p.id !== product.id).slice(0, 4));
    }).catch(() => {});
  }, [product?.category, product?.id, product?.is_premium]);

  useEffect(() => {
    if (!product?.id) return;
    const sessionId = sessionStorage.getItem('pbsid') || (() => {
      const id = Math.random().toString(36).slice(2);
      sessionStorage.setItem('pbsid', id);
      return id;
    })();
    api.trackProductView(product.id, sessionId);
    api.getProductViewCount(product.id).then(r => setViewerCount(r.count)).catch(() => {});
    const interval = setInterval(() => {
      api.getProductViewCount(product.id).then(r => setViewerCount(r.count)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [product?.id]);

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
          onClick={() => { setFetchError(false); setLoading(true); api.getProduct(slug!).then((raw: any) => { const rc = Array.isArray(raw.colors) ? raw.colors : []; setProduct({ ...raw, originalPrice: raw.original_price ?? raw.originalPrice ?? raw.price, reviews: raw.reviews ?? 0, rating: raw.rating ?? 4, specifications: raw.specifications ?? {}, features: Array.isArray(raw.features) ? raw.features : [], category: raw.categories?.slug ?? raw.sub_category ?? '', images: Array.isArray(raw.images) && raw.images.length > 0 ? raw.images : raw.image ? [raw.image] : [], variants: rc.length > 0 ? rc.map((c: any) => ({ color: c.name ?? c.color ?? '', colorCode: c.code ?? c.colorCode ?? '', images: Array.isArray(c.images) ? c.images : [] })) : (Array.isArray(raw.variants) && raw.variants.length > 0 ? raw.variants : []) }); setFetchError(false); }).catch(() => setFetchError(true)).finally(() => setLoading(false)); }}
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
  const variantImages = (activeVariant?.images || []).filter(Boolean);
  const rawDisplayImages = variantImages.length > 0 ? variantImages : product.images;
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

  const amazonUrl = (product as any).amazon_url;

  const handleBuyOnAmazon = () => {
    if (amazonUrl) {
      api.trackAmazonClick(product.id);
      window.open(amazonUrl, '_blank', 'noopener,noreferrer');
    }
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
        product={{
          price: product.price,
          originalPrice: product.originalPrice,
          stock: product.stock,
          rating: product.rating,
          reviewCount: product.reviews,
          sku: product.sku,
          slug: product.slug || product.id,
        }}
      />
      <div className="container mx-auto px-4 md:px-8 py-6 md:py-16 relative">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">

          {/* Left Column: Gallery */}
          <div className="lg:col-span-8">
            <div className="lg:sticky lg:top-32 flex flex-col-reverse lg:flex-row gap-4 md:gap-6">
              {displayImages.length > 1 && (
                <div className="flex lg:flex-col gap-3 md:gap-4 pb-4 overflow-x-auto lg:overflow-y-auto no-scrollbar lg:max-h-[600px] shrink-0">
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

              <motion.div
                key={`${selectedVariantIndex}-${selectedImage}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full lg:flex-1 max-w-[660px] aspect-square bg-white border border-gray-50 rounded-2xl md:rounded-[3rem] p-6 md:p-12 flex items-center justify-center relative shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] md:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)]"
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
            </div>
          </div>

          {/* Right Column: Info */}
          <div className="lg:col-span-4 space-y-6">
            {/* Product Name */}
            <h1 className="font-outfit font-medium text-[28.58px] leading-snug tracking-normal text-[#190101] uppercase">{product.name}</h1>

            {/* Stars */}
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className={i < Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} />
                ))}
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">{product.reviews} verified reviews</span>
            </div>


            {/* Low stock / out of stock */}
            {inStock && product.stock <= 5 && (
              <p className="text-[11px] font-semibold uppercase tracking-widest text-orange-500">Only {product.stock} left in stock!</p>
            )}
            {!inStock && (
              <p className="text-[11px] font-semibold uppercase tracking-widest text-red-500">Out of Stock</p>
            )}
            {viewerCount > 1 && (
              <p className="text-[11px] font-semibold uppercase tracking-widest text-red-500">
                🔥 {viewerCount} people are viewing this right now
              </p>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-5">
              <span className="font-outfit font-medium text-[15px] text-[#190101]">Quantity : {quantity}</span>
              <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center font-outfit font-semibold text-[15px] text-[#190101]">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                  className="w-10 h-10 bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-30"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Color / Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3">
                <span className="font-outfit font-medium text-[15px] text-[#190101] uppercase tracking-wide">
                  COLOR : <span className="font-semibold">{activeVariant?.color}</span>
                </span>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((variant: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => { setSelectedVariantIndex(idx); setSelectedImage(0); }}
                      className={`w-10 h-10 rounded-full border-2 transition-all p-0.5 flex items-center justify-center ${selectedVariantIndex === idx ? 'border-black scale-110' : 'border-gray-200 hover:border-gray-400'}`}
                    >
                      <div className="w-full h-full rounded-full" style={{ backgroundColor: variant.colorCode }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3 pt-2">
              {/* Buy on Amazon */}
              {amazonUrl ? (
                <button onClick={handleBuyOnAmazon} className={`w-full font-outfit font-semibold text-[20.11px] py-4 rounded-md transition-colors ${theme.btn}`}>
                  BUY ON AMAZON
                </button>
              ) : (
                <button disabled className="w-full font-outfit font-semibold text-[20.11px] py-4 rounded-md bg-gray-100 text-gray-400 cursor-not-allowed">
                  COMING SOON
                </button>
              )}
            </div>

            {/* Trust badges */}
            <div className="flex items-start justify-between gap-4 border-t border-gray-100 pt-6">
              <div className="flex flex-col items-center gap-2 text-center flex-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
                <span className="font-outfit text-[11px] font-medium text-gray-600 leading-snug">PAN-India delivery<br/>in 2–12 business days</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center flex-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <span className="font-outfit text-[11px] font-medium text-gray-600 leading-snug">7-day eligible<br/>returns</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center flex-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
                <span className="font-outfit text-[11px] font-medium text-gray-600 leading-snug">12-month<br/>warranty</span>
              </div>
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-4 py-3 shadow-2xl">
        {amazonUrl ? (
          <button onClick={handleBuyOnAmazon} className={`w-full h-12 text-[11px] uppercase rounded-xl ${theme.btn} transition-all font-black tracking-wider`}>
            BUY ON AMAZON
          </button>
        ) : (
          <button disabled className="w-full h-12 text-[11px] uppercase rounded-xl bg-gray-100 text-gray-400 cursor-not-allowed font-black tracking-wider">
            COMING SOON
          </button>
        )}
      </div>
    </main>
  );
};
