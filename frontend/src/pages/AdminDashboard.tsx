import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LogOut, Settings, Users,
  Truck, LayoutDashboard, Box,
  Plus, Edit3, Trash2, X, Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { api } from '../lib/api';
import { BulkUpload } from '../components/BulkUpload';
import { CloudinaryUpload } from '../components/CloudinaryUpload';
import { FileSpreadsheet } from 'lucide-react';

// ─── Category maps ────────────────────────────────────────────
const MAIN_CATEGORIES = [
  { value: 'backpacks',    label: 'Backpacks' },
  { value: 'luggage',      label: 'Luggage' },
  { value: 'accessories',  label: 'Accessories' },
  { value: 'junior',       label: 'Priority Junior' },
  { value: 'premium',      label: 'Premium Collection' },
];

const SUBCATEGORIES: Record<string, { value: string; label: string }[]> = {
  backpacks: [
    { value: 'college-backpacks',   label: 'College Backpacks' },
    { value: 'school-backpacks',    label: 'School Backpacks' },
    { value: 'laptop-backpacks',    label: 'Laptop Backpacks' },
    { value: 'trekking-backpacks',  label: 'Trekking Backpacks' },
  ],
  luggage: [
    { value: 'cabin-luggage',       label: 'Cabin Luggage (≤ 20")' },
    { value: 'check-in-luggage',    label: 'Check-in Luggage (24"+)' },
    { value: 'trolley-bags',        label: 'Trolley Bags' },
    { value: 'travel-sets',         label: 'Travel Sets' },
  ],
  accessories: [
    { value: 'duffle-bags',         label: 'Duffle Bags' },
    { value: 'wallets',             label: 'Wallets & Pouches' },
    { value: 'travel-accessories',  label: 'Travel Accessories' },
  ],
  junior: [
    { value: 'school-backpacks',    label: 'School Backpacks' },
    { value: 'kids-accessories',    label: 'Kids Accessories' },
  ],
  premium: [
    { value: 'premium-backpacks',   label: 'Premium Backpacks' },
    { value: 'premium-luggage',     label: 'Premium Luggage' },
    { value: 'premium-accessories', label: 'Premium Accessories' },
  ],
};

type ColorVariant = { color: string; colorCode: string; image: string };

const BLANK_FORM = (): Partial<Product> => ({
  name: '', price: 0, originalPrice: 0, category: 'backpacks', subcategory: '',
  gender: 'unisex', stock: 50, description: '', isPremium: false, images: [],
  features: [], sku: 'PB-' + Math.floor(1000 + Math.random() * 9000),
});

const inputCls = 'w-full bg-[var(--color-bg-main)] border border-[var(--color-border-main)] rounded-xl px-4 py-3.5 text-sm font-medium text-[var(--color-text-main)] focus:border-priority-blue outline-none transition-all';

export const AdminDashboard = () => {
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>(BLANK_FORM());
  const [variants, setVariants] = useState<ColorVariant[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate('/login');
    if (user && user.role !== 'admin') navigate('/account');
  }, [isAuthenticated, isLoading, navigate, user]);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.getProducts().then(res => {
      const mapped: Product[] = res.products.map((p: any) => ({
        id: String(p.id),
        name: p.name,
        slug: p.slug || p.name?.toLowerCase().replace(/\s+/g, '-'),
        price: Number(p.price),
        originalPrice: Number(p.original_price || p.price),
        discount: '',
        rating: Number(p.rating) || 0,
        reviews: Number(p.review_count) || 0,
        image: p.image || p.image_url || '',
        images: Array.isArray(p.images) ? p.images : [p.image || p.image_url || ''],
        category: p.category_id || p.category || '',
        description: p.description || '',
        features: Array.isArray(p.features) ? p.features : [],
        specifications: p.specifications || {},
        stock: Number(p.stock) || 0,
        sku: p.sku || '',
        isNew: Boolean(p.is_new),
        highlighted: Boolean(p.is_highlighted),
        isPremium: Boolean(p.is_premium),
        createdAt: p.created_at || new Date().toISOString(),
      }));
      setProducts(mapped);
    }).catch(() => {});
  }, [isAuthenticated]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'inventory', label: 'Products', icon: Box },
    { id: 'bulk', label: 'Bulk Actions', icon: FileSpreadsheet },
    { id: 'orders', label: 'Orders', icon: Truck },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'analytics', label: 'Settings', icon: Settings },
  ];

  const metrics = [
    { label: 'Total Products', value: String(products.length), trend: '', info: 'In catalogue' },
    { label: 'Active Orders', value: '—', trend: '', info: 'Coming soon' },
    { label: 'Total Customers', value: '—', trend: '', info: 'Coming soon' },
    { label: 'Revenue', value: '—', trend: '', info: 'Coming soon' },
  ];

  const addVariant = () => setVariants((v: ColorVariant[]) => [...v, { color: '', colorCode: '#000000', image: '' }]);
  const updateVariant = (i: number, key: keyof ColorVariant, val: string) =>
    setVariants((v: ColorVariant[]) => v.map((item: ColorVariant, idx: number) => idx === i ? { ...item, [key]: val } : item));
  const removeVariant = (i: number) => setVariants((v: ColorVariant[]) => v.filter((_: ColorVariant, idx: number) => idx !== i));

  const resetForm = () => {
    setFormData(BLANK_FORM());
    setVariants([]);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      category: formData.subcategory || formData.category,
      sub_category: formData.subcategory || '',
      price: formData.price,
      original_price: formData.originalPrice,
      stock: formData.stock,
      description: formData.description,
      is_premium: formData.isPremium,
      image_url: formData.images?.[0] || '',
      sku: formData.sku,
      features: formData.features || [],
      colors: variants.map((v: ColorVariant) => ({ name: v.color, code: v.colorCode, image: v.image })),
    };
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        setEditingProduct(null);
      } else {
        await api.createProduct(payload);
        setIsAddingProduct(false);
      }
      // Refresh product list
      const res = await api.getProducts();
      const mapped: Product[] = res.products.map((p: any) => ({
        id: String(p.id), name: p.name,
        slug: p.slug || p.name?.toLowerCase().replace(/\s+/g, '-'),
        price: Number(p.price), originalPrice: Number(p.original_price || p.price),
        discount: '', rating: Number(p.rating) || 0, reviews: Number(p.review_count) || 0,
        image: p.image || p.image_url || '',
        images: Array.isArray(p.images) ? p.images : [p.image || p.image_url || ''],
        category: p.category_id || p.category || '', description: p.description || '',
        features: Array.isArray(p.features) ? p.features : [],
        specifications: p.specifications || {}, stock: Number(p.stock) || 0,
        sku: p.sku || '', isNew: Boolean(p.is_new), highlighted: Boolean(p.is_highlighted),
        isPremium: Boolean(p.is_premium), createdAt: p.created_at || new Date().toISOString(),
      }));
      setProducts(mapped);
      resetForm();
    } catch {
      alert('Failed to save product. Check console.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteProduct(id);
      setProducts((prev: Product[]) => prev.filter((p: Product) => p.id !== id));
    } catch {
      alert('Failed to delete product.');
    }
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setVariants((product.variants || []).map((v: any) => ({ color: v.color || '', colorCode: v.colorCode || '#000000', image: v.images?.[0] || '' })));
    setIsAddingProduct(true);
  };

  if (isLoading || !user) return null;

  return (
    <main className="min-h-screen bg-[var(--color-bg-main)] font-outfit selection:bg-priority-blue selection:text-white pt-20 transition-colors duration-300">
      <div className="pt-12 pb-16 px-6">
        <div className="max-w-[1400px] mx-auto px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-black text-[var(--color-text-main)]"
          >
            Admin Dashboard
          </motion.h1>
          <p className="text-sm font-bold text-priority-blue uppercase tracking-widest mt-2">Manage your store and orders</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 pb-32">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Nav */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="sticky top-32 bg-[var(--color-bg-card)] p-4 rounded-3xl border border-[var(--color-border-main)] shadow-sm">
              <div className="mb-6 p-4 bg-[var(--color-bg-main)] rounded-2xl border border-[var(--color-border-main)]">
                <p className="text-[10px] font-bold uppercase text-[var(--color-text-muted)] mb-1">Welcome back,</p>
                <h2 className="text-lg font-black text-[var(--color-text-main)] truncate">{user?.name || 'Admin'}</h2>
              </div>

              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setIsAddingProduct(false); setEditingProduct(null); }}
                    className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-xs font-bold transition-all ${
                      activeTab === tab.id 
                        ? 'bg-priority-blue text-white shadow-lg' 
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-main)]'
                    }`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </nav>

              <div className="mt-6 pt-4 border-t border-[var(--color-border-main)]">
                <button onClick={logout} className="w-full flex items-center gap-3 px-5 py-3.5 text-xs font-bold text-red-500 hover:bg-red-500/5 rounded-xl transition-all">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div 
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {metrics.map((m, i) => (
                       <div key={i} className="bg-[var(--color-bg-card)] p-6 rounded-3xl border border-[var(--color-border-main)]">
                         <p className="text-xs font-bold text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">{m.label}</p>
                         <p className="text-2xl font-black text-[var(--color-text-main)]">{m.value}</p>
                         <div className="flex items-center gap-2 mt-2">
                           <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.trend.startsWith('+') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{m.trend}</span>
                           <span className="text-[10px] text-[var(--color-text-muted)] uppercase">{m.info}</span>
                         </div>
                       </div>
                    ))}
                  </div>

                  <div className="bg-[var(--color-bg-card)] p-8 rounded-3xl border border-[var(--color-border-main)]">
                    <h3 className="text-xl font-black text-[var(--color-text-main)] mb-6 uppercase tracking-tight">Recent Orders</h3>
                    <div className="py-16 text-center text-[var(--color-text-muted)]">
                      <p className="text-xs font-bold uppercase tracking-widest">No orders yet</p>
                      <p className="text-[10px] mt-2 text-gray-400">Orders will appear here once customers start purchasing.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'inventory' && (
                <motion.div 
                  key="products"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                       <h2 className="text-2xl font-black text-[var(--color-text-main)]">Product Manager</h2>
                       <p className="text-xs font-bold text-priority-blue uppercase tracking-widest">{products.length} Items in store</p>
                    </div>
                    {!isAddingProduct && (
                      <button 
                        onClick={() => { setIsAddingProduct(true); setEditingProduct(null); }}
                        className="bg-priority-blue text-white px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] transition-all shadow-lg shadow-priority-blue/20"
                      >
                        <Plus size={16} /> Add Product
                      </button>
                    )}
                  </div>

                  {isAddingProduct ? (
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-[var(--color-bg-card)] rounded-3xl border border-[var(--color-border-main)] p-8">
                      <div className="flex justify-between items-center mb-8 border-b border-[var(--color-border-main)] pb-6">
                         <h3 className="text-xl font-bold text-[var(--color-text-main)] uppercase tracking-tight">
                           {editingProduct ? 'Edit Product' : 'Create New Product'}
                         </h3>
                         <button onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }} className="p-2 hover:text-red-500 transition-colors">
                           <X size={20} />
                         </button>
                      </div>

                      <form onSubmit={handleSaveProduct} className="space-y-8">

                        {/* ── Row 1: Name · Price · MRP ── */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-priority-blue tracking-widest">Product Name</label>
                            <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Urban Blue Pack" className={inputCls} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-priority-blue tracking-widest">Sale Price (₹)</label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">₹</span>
                              <input required type="number" min="0" value={formData.price} onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)||0})} className={`${inputCls} pl-8`} />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-priority-blue tracking-widest">MRP / Original Price (₹)</label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">₹</span>
                              <input required type="number" min="0" value={formData.originalPrice} onChange={(e) => setFormData({...formData, originalPrice: parseInt(e.target.value)||0})} className={`${inputCls} pl-8`} />
                            </div>
                          </div>
                        </div>

                        {/* ── Row 2: Category · Sub-category · Gender · Stock ── */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-priority-blue tracking-widest">Main Category</label>
                            <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value, subcategory: ''})} className={inputCls}>
                              {MAIN_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-priority-blue tracking-widest">Sub-Category</label>
                            <select value={formData.subcategory || ''} onChange={(e) => setFormData({...formData, subcategory: e.target.value})} className={inputCls}>
                              <option value="">— Select —</option>
                              {(SUBCATEGORIES[formData.category || 'backpacks'] || []).map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-priority-blue tracking-widest">Gender / Style</label>
                            <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value as any})} className={inputCls}>
                              <option value="unisex">Unisex</option>
                              <option value="men">Men</option>
                              <option value="women">Women</option>
                              <option value="kids">Kids</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-priority-blue tracking-widest">Units in Stock</label>
                            <input type="number" min="0" value={formData.stock} onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)||0})} className={inputCls} />
                          </div>
                        </div>

                        {/* ── Primary Image ── */}
                        <CloudinaryUpload
                          label="Primary Product Image"
                          value={formData.images?.[0] || ''}
                          onChange={(url) => setFormData({ ...formData, images: [url], image: url })}
                        />

                        {/* ── Colour Variants ── */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-xs font-bold uppercase text-priority-blue tracking-widest">Colour Variants</label>
                              <p className="text-[10px] text-gray-400 mt-0.5">Each colour gets its own image uploaded to Cloudinary</p>
                            </div>
                            <button type="button" onClick={addVariant} className="flex items-center gap-1.5 text-xs font-bold text-priority-blue border border-priority-blue/30 px-3 py-1.5 rounded-lg hover:bg-priority-blue/5 transition-colors">
                              <Plus size={12} /> Add Colour
                            </button>
                          </div>

                          {variants.length === 0 && (
                            <p className="text-[11px] text-gray-400 py-6 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                              No colour variants yet — click "Add Colour" to add one
                            </p>
                          )}

                          <div className="space-y-4">
                            {variants.map((v: ColorVariant, i: number) => (
                              <div key={i} className="p-5 border border-[var(--color-border-main)] rounded-2xl bg-[var(--color-bg-main)] space-y-4">
                                <div className="flex items-center gap-3">
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Pick Colour</label>
                                    <input type="color" value={v.colorCode} onChange={(e) => updateVariant(i, 'colorCode', e.target.value)} className="w-12 h-10 rounded-lg cursor-pointer border border-[var(--color-border-main)] p-1 bg-transparent" />
                                  </div>
                                  <div className="flex-1 space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Colour Name</label>
                                    <input type="text" value={v.color} onChange={(e) => updateVariant(i, 'color', e.target.value)} placeholder="e.g. Midnight Navy" className={inputCls} />
                                  </div>
                                  <button type="button" onClick={() => removeVariant(i)} className="self-end mb-0.5 p-2.5 text-red-400 hover:bg-red-50 rounded-xl transition-colors border border-red-100">
                                    <X size={14} />
                                  </button>
                                </div>
                                <CloudinaryUpload
                                  label={`Image — ${v.color || 'this colour'}`}
                                  value={v.image}
                                  onChange={(url) => updateVariant(i, 'image', url)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* ── Description ── */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-priority-blue tracking-widest">Product Description</label>
                          <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} placeholder="Describe the product — materials, use case, highlights..." className={`${inputCls} resize-none`} />
                        </div>

                        {/* ── Features ── */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-priority-blue tracking-widest">
                            Key Features <span className="font-normal normal-case tracking-normal text-gray-400 text-[10px]">— one per line</span>
                          </label>
                          <textarea
                            value={(formData.features || []).join('\n')}
                            onChange={(e) => setFormData({...formData, features: e.target.value.split('\n')})}
                            rows={4}
                            placeholder={`17-inch dedicated laptop sleeve\nWater-resistant polyester fabric\nErgonomic padded shoulder straps`}
                            className={`${inputCls} resize-none font-mono text-xs leading-relaxed`}
                          />
                        </div>

                        {/* ── Premium toggle ── */}
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, isPremium: !formData.isPremium})}
                            className={`w-10 h-5 rounded-full transition-all relative ${formData.isPremium ? 'bg-priority-blue' : 'bg-gray-200'}`}
                          >
                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${formData.isPremium ? 'left-5' : 'left-0.5'}`} />
                          </button>
                          <span className="text-xs font-bold text-[var(--color-text-main)]">Mark as Premium</span>
                        </div>

                        {/* ── Submit ── */}
                        <div className="pt-6 border-t border-[var(--color-border-main)] flex gap-4">
                          <button type="submit" className="flex-1 bg-priority-blue text-white font-bold text-xs py-4 rounded-xl uppercase tracking-widest hover:bg-priority-dark transition-all flex items-center justify-center gap-2">
                            <Check size={16} /> {editingProduct ? 'Save Changes' : 'Add Product'}
                          </button>
                          <button type="button" onClick={() => { setIsAddingProduct(false); setEditingProduct(null); resetForm(); }} className="px-8 bg-gray-100 text-[var(--color-text-main)] font-bold text-xs rounded-xl uppercase tracking-widest hover:bg-gray-200 transition-all">
                            Cancel
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  ) : (
                    <div className="bg-[var(--color-bg-card)] rounded-3xl border border-[var(--color-border-main)] shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-[var(--color-border-main)] bg-gray-50/50">
                              <th className="px-6 py-5 text-[10px] font-bold text-priority-blue uppercase tracking-widest">Product</th>
                              <th className="px-6 py-5 text-[10px] font-bold text-priority-blue uppercase tracking-widest">Category</th>
                              <th className="px-6 py-5 text-[10px] font-bold text-priority-blue uppercase tracking-widest">Price</th>
                              <th className="px-6 py-5 text-[10px] font-bold text-priority-blue uppercase tracking-widest">Stock</th>
                              <th className="px-6 py-5 text-[10px] font-bold text-priority-blue uppercase tracking-widest text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--color-border-main)]">
                            {products.map((product) => (
                              <tr key={product.id} className="hover:bg-[var(--color-bg-main)] transition-all group">
                                <td className="px-6 py-5">
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-[var(--color-border-main)] p-1 flex items-center justify-center">
                                      <img src={product.image} className="w-full h-full object-contain" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-bold text-[var(--color-text-main)] truncate">{product.name}</p>
                                      <p className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider">{product.sku}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-5">
                                  <div className="flex flex-col gap-1">
                                    <p className="text-[10px] font-bold text-[var(--color-text-main)] uppercase tracking-wider">{product.category}</p>
                                    <span className="text-[8px] font-black bg-priority-blue/10 text-priority-blue px-2 py-0.5 rounded-full uppercase tracking-widest w-fit">{product.gender || 'unisex'}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-5">
                                  <p className="text-sm font-bold text-[var(--color-text-main)]">₹{product.price.toLocaleString()}</p>
                                  <p className="text-[9px] text-green-600 font-bold uppercase">{product.discount}</p>
                                </td>
                                <td className="px-6 py-5">
                                  <div className="flex flex-col gap-1 w-24">
                                    <span className={`text-[10px] font-bold uppercase ${product.stock < 10 ? 'text-red-500' : 'text-green-600'}`}>{product.stock} in stock</span>
                                    <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                                       <div className={`h-full rounded-full transition-all duration-500 ${product.stock < 10 ? 'bg-red-500' : 'bg-green-600'}`} style={{ width: `${Math.min(100, product.stock)}%` }} />
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-5 text-right">
                                  <div className="flex justify-end gap-2">
                                    <button onClick={() => openEdit(product)} className="p-2.5 text-priority-blue hover:bg-priority-blue hover:text-white border border-priority-blue/20 bg-priority-blue/5 rounded-lg transition-all">
                                      <Edit3 size={14} />
                                    </button>
                                    <button onClick={() => handleDeleteProduct(product.id)} className="p-2.5 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 bg-red-500/5 rounded-lg transition-all">
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'bulk' && (
                <motion.div 
                  key="bulk"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <BulkUpload />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
};
