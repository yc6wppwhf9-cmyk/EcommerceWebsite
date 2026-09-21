import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Box, Plus, Edit3, Trash2, X, Check,
  Zap, Award, Percent, Crown,
  Eye, EyeOff, Search,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { Product } from '../../types';
import { api } from '../../lib/api';
import { CloudinaryUpload } from '../CloudinaryUpload';

const MAIN_CATEGORIES = [
  { value: 'backpacks', label: 'Backpacks' },
  { value: 'travel', label: 'Travel' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'junior', label: 'Junior' },
  { value: 'premium', label: 'Premium Collection' },
];

const SUBCATEGORIES: Record<string, { value: string; label: string }[]> = {
  backpacks: [
    { value: 'college-backpacks', label: 'College Backpacks' },
    { value: 'school-backpacks', label: 'School Backpacks' },
    { value: 'laptop-backpacks', label: 'Laptop Backpacks' },
    { value: 'trekking-backpacks', label: 'Trekking Backpacks' },
  ],
  travel: [
    { value: 'luggage', label: 'Luggage' },
    { value: 'duffle', label: 'Duffle Bags' },
  ],
  accessories: [
    { value: 'pouch', label: 'Pouches' },
    { value: 'lunch-bag', label: 'Lunch Bags' },
    { value: 'daypack', label: 'Daypacks' },
    { value: 'tote-bag', label: 'Tote Bags' },
  ],
  junior: [
    { value: 'school-backpacks', label: 'School Backpacks' },
    { value: 'kids-trolley', label: 'Kids Trolley' },
    { value: 'trolley-backpacks', label: 'Trolley Backpacks' },
    { value: 'combo-set', label: 'Combo Set' },
    { value: 'pouches', label: 'Pouches' },
    { value: 'lunch-bags', label: 'Lunch Bags' },
    { value: 'kids-accessories', label: 'Kids Accessories' },
  ],
  premium: [
    { value: 'premium-backpacks', label: 'Premium Backpacks' },
    { value: 'premium-luggage', label: 'Premium Luggage' },
    { value: 'premium-accessories', label: 'Premium Accessories' },
    { value: 'premium-duffle', label: 'Premium Duffle' },
  ],
};

export const resolveProductCategory = (p: any): { mainCat: string; subCat: string } => {
  if (!p) return { mainCat: 'backpacks', subCat: 'college-backpacks' };

  const isPrem = !!(p.is_premium ?? p.isPremium);
  const rawSub = (p.sub_category || p.subcategory || '').toLowerCase().trim();
  const rawCatSlug = (p.categories?.slug || p.category || '').toLowerCase().trim();
  const explicitCat = (p.category || '').toLowerCase().trim();

  // 1. Premium Collection
  if (isPrem || explicitCat === 'premium' || rawCatSlug === 'premium' || rawSub.startsWith('premium-')) {
    let sub = rawSub;
    if (!sub || !sub.startsWith('premium-')) {
      if (sub === 'duffle' || rawCatSlug.includes('duffle')) sub = 'premium-duffle';
      else if (sub === 'luggage' || rawCatSlug.includes('luggage')) sub = 'premium-luggage';
      else if (sub === 'accessories' || rawCatSlug.includes('access')) sub = 'premium-accessories';
      else sub = 'premium-backpacks';
    }
    return { mainCat: 'premium', subCat: sub };
  }

  // 2. Explicit parent category set on product
  if (['travel', 'backpacks', 'accessories', 'junior'].includes(explicitCat)) {
    const validSubs = (SUBCATEGORIES[explicitCat] || []).map(s => s.value);
    const sub = validSubs.includes(rawSub) ? rawSub : (validSubs[0] || '');
    return { mainCat: explicitCat, subCat: sub };
  }

  // 3. Junior (by category slug or junior-specific subcategories)
  const juniorSubs = ['kids-trolley', 'trolley-backpacks', 'combo-set', 'pouches', 'lunch-bags', 'kids-accessories'];
  if (rawCatSlug === 'junior' || juniorSubs.includes(rawSub) || juniorSubs.includes(rawCatSlug)) {
    const validSubs = (SUBCATEGORIES.junior || []).map(s => s.value);
    const sub = validSubs.includes(rawSub) ? rawSub : (validSubs.includes(rawCatSlug) ? rawCatSlug : 'school-backpacks');
    return { mainCat: 'junior', subCat: sub };
  }

  // 4. Travel
  const travelSubs = ['luggage', 'duffle', 'trolley-bags'];
  if (rawCatSlug === 'travel' || travelSubs.includes(rawSub) || travelSubs.includes(rawCatSlug)) {
    const sub = rawSub === 'duffle' || rawCatSlug === 'duffle' ? 'duffle' : 'luggage';
    return { mainCat: 'travel', subCat: sub };
  }

  // 5. Accessories
  const accessSubs = ['pouch', 'lunch-bag', 'daypack', 'tote-bag'];
  if (rawCatSlug === 'accessories' || accessSubs.includes(rawSub) || accessSubs.includes(rawCatSlug)) {
    const validSubs = (SUBCATEGORIES.accessories || []).map(s => s.value);
    const sub = validSubs.includes(rawSub) ? rawSub : (validSubs.includes(rawCatSlug) ? rawCatSlug : 'pouch');
    return { mainCat: 'accessories', subCat: sub };
  }

  // 6. Backpacks (default)
  const backpackSubs = ['college-backpacks', 'school-backpacks', 'laptop-backpacks', 'trekking-backpacks'];
  const matchedSub = backpackSubs.includes(rawSub) ? rawSub : (backpackSubs.includes(rawCatSlug) ? rawCatSlug : 'college-backpacks');
  return { mainCat: 'backpacks', subCat: matchedSub };
};

export type ColorVariant = { color: string; colorCode: string; images: string[] };

export const BLANK_FORM = (): Partial<Product> => ({
  name: '', price: 0, originalPrice: 0, category: 'backpacks', subcategory: 'college-backpacks',
  gender: 'unisex', ageRange: '', stock: 50, description: '', isPremium: false, images: [],
  features: [], sku: 'PB-' + Math.floor(1000 + Math.random() * 9000),
  size: '', juniorStyle: '', amazon_url: '', flipkart_url: '', myntra_url: '', ajio_url: '',
  isNew: false, highlighted: false,
});

const inputCls = 'w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:border-priority-blue outline-none transition-all placeholder:text-gray-400';
const PRODUCTS_PER_PAGE = 18;

const Pagination = ({ page, total, onPage }: { page: number; total: number; onPage: (p: number) => void }) => {
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3 pt-4">
      <button
        disabled={page === 1}
        onClick={() => onPage(page - 1)}
        className="p-2 rounded-xl bg-white border border-gray-200 disabled:opacity-30 hover:border-priority-blue transition-all"
      >
        <ChevronLeft size={14} />
      </button>
      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
        Page {page} of {total}
      </span>
      <button
        disabled={page === total}
        onClick={() => onPage(page + 1)}
        className="p-2 rounded-xl bg-white border border-gray-200 disabled:opacity-30 hover:border-priority-blue transition-all"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
};

interface AdminProductsProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  fetchData: () => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  fetchLoading: boolean;
  isAddingProduct: boolean;
  setIsAddingProduct: (v: boolean) => void;
  editingProduct: Product | null;
  setEditingProduct: (p: Product | null) => void;
  formData: Partial<Product>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Product>>>;
  variants: ColorVariant[];
  setVariants: React.Dispatch<React.SetStateAction<ColorVariant[]>>;
  discountPercent: number;
  setDiscountPercent: React.Dispatch<React.SetStateAction<number>>;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  products,
  setProducts,
  fetchData,
  showToast,
  fetchLoading,
  isAddingProduct,
  setIsAddingProduct,
  editingProduct,
  setEditingProduct,
  formData,
  setFormData,
  variants,
  setVariants,
  discountPercent,
  setDiscountPercent,
}) => {
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [editingStock, setEditingStock] = useState<{ id: string; value: number } | null>(null);
  const [productsPage, setProductsPage] = useState(1);

  const filteredProducts = products.filter(p => {
    const matchSearch = !productSearch || (p.name || '').toLowerCase().includes(productSearch.toLowerCase());
    const { mainCat } = resolveProductCategory(p);
    const matchCat = productCategoryFilter === 'all' || mainCat === productCategoryFilter;
    return matchSearch && matchCat;
  });

  const totalProductPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice((productsPage - 1) * PRODUCTS_PER_PAGE, productsPage * PRODUCTS_PER_PAGE);

  const handleQuickStockUpdate = async (id: string, stock: number) => {
    try {
      await api.updateProduct(id, { stock });
      setProducts(prev => prev.map(p => p.id === id ? { ...p, stock } : p));
      setEditingStock(null);
      showToast('Stock updated!');
    } catch {
      showToast('Failed to update stock', 'error');
    }
  };

  const handleToggleVisibility = async (p: Product) => {
    const newVal = !((p as any).is_active ?? true);
    try {
      await api.updateProduct(p.id, { is_active: newVal });
      setProducts(prev => prev.map(prod => prod.id === p.id ? { ...prod, is_active: newVal } as any : prod));
      showToast(newVal ? 'Product is now visible' : 'Product hidden from store');
    } catch {
      showToast('Failed to update visibility', 'error');
    }
  };

  const addVariant = () => setVariants((v: ColorVariant[]) => [...v, { color: '', colorCode: '#000000', images: [''] }]);
  const updateVariant = (i: number, key: string, val: any) =>
    setVariants((v: ColorVariant[]) => v.map((item: ColorVariant, idx: number) => idx === i ? { ...item, [key]: val } : item));
  const removeVariant = (i: number) => setVariants((v: ColorVariant[]) => v.filter((_: ColorVariant, idx: number) => idx !== i));

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.name || !formData.originalPrice || !formData.price || !formData.category) {
        showToast('Please fill all mandatory fields marked with *', 'error');
        return;
      }

      const filteredImages = (formData.images || []).filter(Boolean);
      const mainImage = filteredImages[0] || formData.image || '';
      const isPrem = formData.category === 'premium';
      const selectedSub = formData.subcategory || formData.sub_category || (SUBCATEGORIES[formData.category || 'backpacks']?.[0]?.value || '');

      const cleanPayload: any = {
        name: formData.name,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice),
        category: formData.category,
        sub_category: selectedSub,
        description: formData.description || '',
        stock: Number(formData.stock),
        gender: formData.gender || (formData.category === 'junior' ? 'kids' : 'unisex'),
        ageRange: formData.gender === 'kids' ? (formData.ageRange || '') : '',
        size: formData.size || '',
        junior_style: formData.category === 'junior' ? (formData.juniorStyle || formData.junior_style || null) : null,
        isNew: !!formData.isNew,
        highlighted: !!formData.highlighted,
        isPremium: isPrem,
        is_premium: isPrem,
        features: Array.isArray(formData.features) ? formData.features : [],
        image: mainImage,
        images: filteredImages,
        colors: variants.filter(v => v.color.trim()).map(v => ({ name: v.color, code: v.colorCode, images: (v.images || []).filter(Boolean) })),
        amazon_url: (formData as any).amazon_url || null,
        flipkart_url: (formData as any).flipkart_url || null,
        myntra_url: (formData as any).myntra_url || null,
        ajio_url: (formData as any).ajio_url || null,
      };

      if (!editingProduct) {
        cleanPayload.slug = (formData.name || '').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substring(2, 7);
        cleanPayload.sku = formData.sku || 'PB-' + Math.floor(1000 + Math.random() * 9000);
      }

      if (editingProduct) {
        const updated = await api.updateProduct(editingProduct.id, cleanPayload);
        const mergedProduct: Product = {
          ...editingProduct,
          ...cleanPayload,
          ...updated,
          category: formData.category,
          subcategory: selectedSub,
          sub_category: selectedSub,
          is_premium: isPrem,
          isPremium: isPrem,
        };
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? mergedProduct : p));
        showToast('Product Updated!');
      } else {
        const newProduct = await api.createProduct(cleanPayload);
        const mergedNewProduct: Product = {
          ...cleanPayload,
          ...newProduct,
          category: formData.category,
          subcategory: selectedSub,
          sub_category: selectedSub,
          is_premium: isPrem,
          isPremium: isPrem,
        };
        setProducts(prev => [...prev, mergedNewProduct]);
        showToast('New Product Registered!');
      }
      setIsAddingProduct(false);
      setEditingProduct(null);
      setFormData(BLANK_FORM());
      setVariants([]);
      fetchData();
    } catch (err: any) {
      console.error('Save Error:', err);
      showToast(err.message || 'Check required fields', 'error');
    }
  };

  return (
    <motion.div key="inv" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-sm font-black text-gray-900 uppercase">Manage Inventory</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">{filteredProducts.length} of {products.length} Items</p>
        </div>
        {!isAddingProduct && (
          <button
            onClick={() => { setIsAddingProduct(true); setEditingProduct(null); }}
            className="px-6 py-3 bg-priority-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-priority-blue/20"
          >
            + New Product
          </button>
        )}
      </div>

      {isAddingProduct ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-8 shadow-2xl max-w-3xl mx-auto overflow-hidden">
          <div className="flex justify-between items-center mb-10 border-b border-gray-100 pb-5">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">{editingProduct ? 'Edit Product File' : 'Register New Item'}</h3>
            <button onClick={() => { setIsAddingProduct(false); setEditingProduct(null); setVariants([]); setDiscountPercent(0); }} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSaveProduct} className="space-y-10">
            {/* --- BASIC INFO --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-600 uppercase ml-1">Full Product Name <span className="text-red-500">*</span></label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. VIP MUSTARD LUXE" className={inputCls} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-600 uppercase ml-1">Gender / Style</label>
                <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value as any, ageRange: e.target.value === 'kids' ? formData.ageRange : '' })} className={inputCls}>
                  <option value="unisex">All</option>
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="kids">Kids</option>
                </select>
              </div>

              {formData.gender === 'kids' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-priority-blue uppercase ml-1">Age Range (for Kids)</label>
                  <select value={formData.ageRange} onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })} className={inputCls}>
                    <option value="">-- Pick Age Group --</option>
                    <option value="0-2">Infants (below 3 Yrs)</option>
                    <option value="3-5">Toddlers (3-5 Yrs)</option>
                    <option value="6-10">Elementary (6-10 Yrs)</option>
                    <option value="11-14">Junior / Teen (11-14 Yrs)</option>
                  </select>
                </div>
              )}
            </div>

            {/* --- CATEGORIES --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-600 uppercase ml-1">Category (Main Section) <span className="text-red-500">*</span></label>
                <select
                  value={formData.category || 'backpacks'}
                  onChange={(e) => {
                    const newCat = e.target.value;
                    const defaultSub = SUBCATEGORIES[newCat]?.[0]?.value || '';
                    setFormData(prev => ({
                      ...prev,
                      category: newCat,
                      subcategory: defaultSub,
                      sub_category: defaultSub,
                      isPremium: newCat === 'premium',
                      gender: newCat === 'junior' ? 'kids' : (prev.gender === 'kids' ? 'unisex' : (prev.gender || 'unisex')),
                    }));
                  }}
                  className={inputCls}
                >
                  {MAIN_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-600 uppercase ml-1">Sub-Category (Type)</label>
                <select
                  value={formData.subcategory || formData.sub_category || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value, sub_category: e.target.value }))}
                  className={inputCls}
                >
                  {(SUBCATEGORIES[formData.category || 'backpacks'] || []).map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>

            {/* --- JUNIOR STYLE --- */}
            {formData.category === 'junior' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-600 uppercase ml-1">Junior Style Tag <span className="text-gray-400 font-normal normal-case">(optional — Dreamy or Power)</span></label>
                  <select value={formData.juniorStyle || ''} onChange={(e) => setFormData({ ...formData, juniorStyle: e.target.value })} className={inputCls}>
                    <option value="">-- None --</option>
                    <option value="dreamy">Dreamy</option>
                    <option value="power">Power</option>
                  </select>
                </div>
              </div>
            )}

            {/* --- ATTRIBUTES (Size & Features) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-priority-blue/5 rounded-2xl border border-priority-blue/10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-priority-blue uppercase ml-1">Product Size (Filtering)</label>
                <select value={formData.size} onChange={(e) => setFormData({ ...formData, size: e.target.value })} className={inputCls}>
                  <option value="">-- None --</option>
                  <option value="Small">Small / Cabin</option>
                  <option value="Medium">Medium / Check-in</option>
                  <option value="Large">Large / XL</option>
                  <option value="One Size">One Size (Accessories)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-priority-blue uppercase ml-1">Key Features (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Waterproof, TSA Lock, Expandable"
                  value={Array.isArray(formData.features) ? formData.features.join(', ') : ''}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value.split(',').map(s => s.trim()) })}
                  className={inputCls}
                />
                <p className="text-[9px] text-gray-400 font-bold uppercase ml-1 mt-1">Separate features with commas</p>
              </div>
            </div>

            {/* --- PRICING & DISCOUNTS --- */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2"><Percent size={14} /> Pricing Strategy</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-600 uppercase">Original MRP (₹) <span className="text-red-500">*</span></label>
                  <input required type="number" placeholder="0" value={formData.originalPrice || ''} onChange={(e) => setFormData({ ...formData, originalPrice: parseInt(e.target.value) || 0 })} className={inputCls} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-priority-blue uppercase">Discount %</label>
                  <input type="number" min="0" max="99" placeholder="0" value={discountPercent || ''} onChange={(e) => setDiscountPercent(parseInt(e.target.value) || 0)} className={`${inputCls} border-priority-blue/30 text-priority-blue`} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-900 uppercase">Sale Price <span className="text-red-500">*</span></label>
                  <input required type="number" placeholder="0" value={formData.price || ''} onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })} className={`${inputCls} bg-gray-100`} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-600 uppercase">Initial Stock <span className="text-red-500">*</span></label>
                  <input required type="number" placeholder="0" value={formData.stock || ''} onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })} className={inputCls} />
                </div>
              </div>
            </div>

            {/* --- TAGS & STATUS --- */}
            <div className="flex flex-wrap gap-8 py-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={formData.isNew} onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })} className="hidden" />
                <div className={`w-10 h-6 rounded-full transition-all relative ${formData.isNew ? 'bg-priority-blue' : 'bg-gray-200'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.isNew ? 'left-5' : 'left-1'}`} />
                </div>
                <span className="flex items-center gap-1 text-[10px] font-black uppercase text-gray-700"><Zap size={12} /> Mark as New Arrival</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={formData.highlighted} onChange={(e) => setFormData({ ...formData, highlighted: e.target.checked })} className="hidden" />
                <div className={`w-10 h-6 rounded-full transition-all relative ${formData.highlighted ? 'bg-orange-500' : 'bg-gray-200'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.highlighted ? 'left-5' : 'left-1'}`} />
                </div>
                <span className="flex items-center gap-1 text-[10px] font-black uppercase text-orange-600"><Award size={12} /> Mark as Best Seller</span>
              </label>
              {formData.category === 'premium' && (
                <label className="flex items-center gap-3 cursor-not-allowed opacity-70">
                  <div className="w-10 h-6 rounded-full relative bg-amber-500">
                    <div className="absolute top-1 left-5 w-4 h-4 rounded-full bg-white" />
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase text-amber-600"><Crown size={12} /> Premium Collection (Auto)</span>
                </label>
              )}
            </div>

            {/* --- PHOTOS & COLOUR OPTIONS --- */}
            <div className="pt-8 border-t border-gray-100 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Photos & Colour Options <span className="text-red-500">*</span></label>
                  <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">
                    First photo is the main cover image. Add colour variants below if the bag comes in multiple colours.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <CloudinaryUpload
                    label=""
                    value=""
                    multiple={true}
                    onChange={() => { }}
                    onBulkChange={(urls) => setFormData(prev => ({ ...prev, images: [...(prev.images || []).filter(Boolean), ...urls] }))}
                  />
                  <button type="button" onClick={addVariant} className="flex items-center gap-2 text-[10px] font-black text-priority-blue uppercase border-2 border-priority-blue/10 px-4 py-2 rounded-xl bg-priority-blue/5 hover:bg-priority-blue hover:text-white transition-all whitespace-nowrap">
                    + Add Colour
                  </button>
                </div>
              </div>

              {/* Main product photos */}
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Main Product Photos</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(formData.images || ['']).map((img, idx) => (
                    <div key={idx} className="relative group/g bg-stone-50 rounded-2xl border border-stone-100 p-4 transition-all hover:shadow-lg">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => {
                              const newImgs = [...(prev.images || [])];
                              newImgs.splice(idx, 1);
                              return { ...prev, images: newImgs };
                            });
                          }}
                          className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-red-100 text-red-500 rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover/g:opacity-100 transition-all z-10 hover:bg-red-500 hover:text-white"
                        >
                          <X size={16} />
                        </button>
                      )}
                      <CloudinaryUpload
                        label={idx === 0 ? "Main Cover Image" : `Gallery Photo #${idx + 1}`}
                        value={img}
                        onChange={(url) => {
                          setFormData(prev => {
                            const newImgs = [...(prev.images || [])];
                            while (newImgs.length <= idx) newImgs.push('');
                            newImgs[idx] = url;
                            return { ...prev, images: newImgs };
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Colour variant panels */}
              {variants.length > 0 && (
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Colour Variants</p>
                  <div className="space-y-6">
                    {variants.map((v, i) => (
                      <div key={i} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 relative group/v shadow-inner">
                        <button type="button" onClick={() => removeVariant(i)} className="absolute top-4 right-4 w-8 h-8 bg-white text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover/v:opacity-100 transition-all shadow-sm">
                          <X size={16} />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-500 uppercase">Colour Name</label>
                            <input type="text" value={v.color} onChange={(e) => updateVariant(i, 'color', e.target.value)} placeholder="e.g. Electric Blue" className={inputCls} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-500 uppercase">Hex Code (e.g. #0044FF)</label>
                            <div className="flex gap-2">
                              <input type="text" value={v.colorCode} onChange={(e) => updateVariant(i, 'colorCode', e.target.value)} placeholder="#000000" className={`${inputCls} font-mono`} />
                              <input type="color" value={v.colorCode} onChange={(e) => updateVariant(i, 'colorCode', e.target.value)} className="w-14 h-11 p-1 bg-white border border-gray-200 rounded-xl cursor-pointer" />
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <CloudinaryUpload
                            label=""
                            value=""
                            multiple={true}
                            onChange={() => { }}
                            onBulkChange={(urls) => {
                              const newImgs = [...(v.images || []), ...urls];
                              updateVariant(i, 'images', newImgs);
                            }}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {(v.images || ['']).map((vImg, vIdx) => (
                            <div key={vIdx} className="relative group/vi bg-white p-2 rounded-xl border border-gray-100">
                              <button
                                type="button"
                                onClick={() => {
                                  const newImgs = [...(v.images || [])];
                                  newImgs.splice(vIdx, 1);
                                  updateVariant(i, 'images', newImgs);
                                }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md z-10"
                              >
                                <X size={12} />
                              </button>
                              <CloudinaryUpload
                                label=""
                                value={vImg}
                                onChange={(url) => {
                                  const newImgs = [...(v.images || [])];
                                  newImgs[vIdx] = url;
                                  updateVariant(i, 'images', newImgs);
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-600 uppercase ml-1">Marketing Description / Details</label>
              <textarea rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe features, materials, and highlights..." className={`${inputCls} resize-none`} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-gray-600 uppercase ml-1">Amazon Product URL</label>
              <input type="url" value={(formData as any).amazon_url || ''} onChange={(e) => setFormData({ ...formData, amazon_url: e.target.value } as any)} placeholder="https://www.amazon.in/dp/..." className={inputCls} />
              <p className="text-[9px] text-gray-400 ml-1">Any marketplace URL set here shows as a "Buy on ..." button on the product page.</p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-gray-600 uppercase ml-1">Flipkart Product URL</label>
              <input type="url" value={(formData as any).flipkart_url || ''} onChange={(e) => setFormData({ ...formData, flipkart_url: e.target.value } as any)} placeholder="https://www.flipkart.com/..." className={inputCls} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-gray-600 uppercase ml-1">Myntra Product URL</label>
              <input type="url" value={(formData as any).myntra_url || ''} onChange={(e) => setFormData({ ...formData, myntra_url: e.target.value } as any)} placeholder="https://www.myntra.com/..." className={inputCls} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-gray-600 uppercase ml-1">Ajio Product URL</label>
              <input type="url" value={(formData as any).ajio_url || ''} onChange={(e) => setFormData({ ...formData, ajio_url: e.target.value } as any)} placeholder="https://www.ajio.com/..." className={inputCls} />
            </div>

            <div className="pt-8 flex gap-4 border-t border-gray-100">
              <button type="submit" className="flex-1 py-5 bg-priority-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-priority-blue/30 active:scale-95 transition-all">
                Publish Product File
              </button>
              <button type="button" onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }} className="px-12 py-5 bg-gray-50 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]">
                Discard
              </button>
            </div>
          </form>
        </div>
      ) : fetchLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="bg-white p-5 rounded-2xl border border-gray-100 flex gap-4">
              <div className="w-20 h-20 bg-gray-100 animate-pulse rounded-xl shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-2 bg-gray-100 animate-pulse rounded w-1/3" />
                <div className="h-3 bg-gray-100 animate-pulse rounded w-2/3" />
                <div className="h-2 bg-gray-100 animate-pulse rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
          <Box size={32} className="mx-auto text-gray-200 mb-3" />
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">No products in inventory</p>
          <button onClick={() => setIsAddingProduct(true)} className="mt-4 px-5 py-2 bg-priority-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
            Add First Product
          </button>
        </div>
      ) : (
        <>
          {/* Search + category filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={productSearch}
                onChange={e => { setProductSearch(e.target.value); setProductsPage(1); }}
                className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-[11px] font-bold text-gray-900 outline-none focus:border-priority-blue placeholder:text-gray-400"
              />
            </div>
            <select
              value={productCategoryFilter}
              onChange={e => { setProductCategoryFilter(e.target.value); setProductsPage(1); }}
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-[11px] font-black text-gray-700 outline-none focus:border-priority-blue"
            >
              <option value="all">All Categories</option>
              {MAIN_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
              <Search size={32} className="mx-auto text-gray-200 mb-3" />
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">No products match your search</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {paginatedProducts.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl border border-gray-100 hover:border-priority-blue hover:shadow-xl transition-all group relative overflow-hidden flex flex-col">
                    {/* Image */}
                    <div className="relative bg-gray-50 flex items-center justify-center" style={{ height: '180px' }}>
                      <img src={p.images?.[0] || (p as any).image || ''} className="w-full h-full object-contain p-4" />
                      {(p.stock ?? 0) <= 5 && (
                        <span className={`absolute top-2 left-2 text-[8px] font-black px-2 py-1 rounded-full ${p.stock === 0 ? 'bg-red-500 text-white' : 'bg-orange-400 text-white'}`}>
                          {p.stock === 0 ? 'OUT OF STOCK' : `Low: ${p.stock}`}
                        </span>
                      )}
                      {(p as any).is_active === false && (
                        <span className="absolute top-2 right-2 text-[8px] font-black px-2 py-1 rounded-full bg-gray-400 text-white">Hidden</span>
                      )}
                      {p.isNew && (
                        <span className="absolute bottom-2 left-2 text-[8px] font-black px-2 py-1 rounded-full bg-priority-blue text-white">New</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4 flex flex-col flex-1 justify-between">
                      <div>
                        <p className="text-[9px] font-black text-priority-blue uppercase tracking-widest truncate mb-1">
                          {resolveProductCategory(p).mainCat.toUpperCase()} • {(p.sub_category || (p as any).subcategory || resolveProductCategory(p).subCat || p.gender || 'Standard').toUpperCase()}
                        </p>
                        <h4 className="text-sm font-black text-gray-900 leading-tight mb-1 truncate">{p.name || 'Unnamed Product'}</h4>
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-sm font-black text-gray-900">₹ {(p.price || 0).toLocaleString()}</span>
                          <span className="line-through text-[11px] text-gray-400 font-normal">
                            ₹ {(p.originalPrice || (p as any).original_price || p.price || 0).toLocaleString()}
                          </span>
                        </div>
                        {editingStock?.id === p.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              value={editingStock.value}
                              onChange={e => setEditingStock({ id: p.id, value: parseInt(e.target.value) || 0 })}
                              className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-[11px] font-black text-gray-900 outline-none focus:border-priority-blue"
                              autoFocus
                            />
                            <button onClick={() => handleQuickStockUpdate(p.id, editingStock.value)} className="p-1.5 bg-priority-blue text-white rounded-lg">
                              <Check size={11} />
                            </button>
                            <button onClick={() => setEditingStock(null)} className="p-1.5 bg-gray-100 text-gray-500 rounded-lg">
                              <X size={11} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingStock({ id: p.id, value: p.stock ?? 0 })}
                            className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-priority-blue transition-colors text-left"
                          >
                            Stock: {p.stock ?? 0}
                          </button>
                        )}
                      </div>

                      <div className="flex gap-4 mt-3 pt-3 border-t border-gray-50">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            const { mainCat, subCat } = resolveProductCategory(p);
                            const rawImgs = Array.isArray((p as any).images) && (p as any).images.length > 0
                              ? (p as any).images.filter(Boolean)
                              : (p as any).image ? [(p as any).image] : [];
                            setFormData({
                              ...p,
                              name: p.name || '',
                              price: p.price ?? 0,
                              originalPrice: p.originalPrice || (p as any).original_price || p.price || 0,
                              category: mainCat,
                              subcategory: subCat,
                              sub_category: subCat,
                              stock: p.stock ?? 50,
                              isPremium: mainCat === 'premium',
                              highlighted: (p as any).is_highlighted ?? p.highlighted ?? false,
                              isNew: (p as any).is_new ?? p.isNew ?? false,
                              gender: p.gender || (mainCat === 'junior' ? 'kids' : 'unisex'),
                              size: p.size || '',
                              ageRange: (p as any).age_range || p.ageRange || '',
                              juniorStyle: (p as any).junior_style || (p as any).juniorStyle || '',
                              description: p.description || '',
                              features: Array.isArray(p.features) ? p.features : [],
                              amazon_url: (p as any).amazon_url || '',
                              flipkart_url: (p as any).flipkart_url || '',
                              myntra_url: (p as any).myntra_url || '',
                              ajio_url: (p as any).ajio_url || '',
                              images: rawImgs,
                            });
                            setVariants(((p as any).colors || p.variants || []).map((v: any) => ({
                              color: v.name || v.color || '',
                              colorCode: v.code || v.colorCode || '#000',
                              images: (v.images || []).filter(Boolean),
                            })));
                            const orig = p.originalPrice || (p as any).original_price || p.price || 0;
                            const sale = p.price || 0;
                            if (orig > sale && orig > 0) {
                              setDiscountPercent(Math.round(((orig - sale) / orig) * 100));
                            } else {
                              setDiscountPercent(0);
                            }
                            setIsAddingProduct(true);
                          }}
                          className="text-[10px] font-black text-priority-blue uppercase tracking-widest hover:underline decoration-2 flex items-center gap-1"
                        >
                          <Edit3 size={11} /> Edit
                        </button>
                        <button
                          onClick={() => handleToggleVisibility(p)}
                          className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors ${(p as any).is_active === false ? 'text-gray-300 hover:text-orange-500' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                          {(p as any).is_active === false ? <EyeOff size={11} /> : <Eye size={11} />}
                          {(p as any).is_active === false ? 'Show' : 'Live'}
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm(`Delete "${p.name || 'this product'}"?`)) {
                              try {
                                const res = await api.deleteProduct(p.id);
                                setProducts(prev => prev.filter(prod => prod.id !== p.id));
                                showToast(res.message || 'Product deleted');
                                fetchData();
                              } catch (err: any) {
                                showToast(err.message || 'Failed to delete product', 'error');
                              }
                            }
                          }}
                          className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline decoration-2 flex items-center gap-1 ml-auto"
                        >
                          <Trash2 size={11} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Pagination page={productsPage} total={totalProductPages} onPage={setProductsPage} />
            </>
          )}
        </>
      )}
    </motion.div>
  );
};
