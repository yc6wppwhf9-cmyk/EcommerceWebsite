import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LogOut, Settings, Users,
  Truck, LayoutDashboard, Box,
  Plus, Edit3, Trash2, X, Check,
  TrendingUp, ShoppingBag, CreditCard,
  FileSpreadsheet, Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { api } from '../lib/api';
import { BulkUpload } from '../components/BulkUpload';
import { CloudinaryUpload } from '../components/CloudinaryUpload';

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

const inputCls = 'w-full bg-white border border-gray-100 rounded-[1.25rem] px-5 py-4 text-sm font-semibold text-gray-900 focus:border-priority-blue focus:ring-4 focus:ring-priority-blue/5 outline-none transition-all placeholder:text-gray-300';

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
    { id: 'overview', label: 'Stats Overview', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory Management', icon: Box },
    { id: 'bulk', label: 'Bulk Import', icon: FileSpreadsheet },
    { id: 'orders', label: 'Customer Orders', icon: Truck },
    { id: 'customers', label: 'Customer Base', icon: Users },
    { id: 'analytics', label: 'Store Settings', icon: Settings },
  ];

  const metrics = [
    { label: 'Total Inventory', value: String(products.length), icon: Box, color: 'bg-blue-500' },
    { label: 'Monthly Sales', value: '₹ 0', icon: TrendingUp, color: 'bg-green-500' },
    { label: 'New Orders', value: '0', icon: ShoppingBag, color: 'bg-purple-500' },
    { label: 'Unique Customers', value: '0', icon: Users, color: 'bg-orange-500' },
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
        alert('Product updated successfully!');
        setEditingProduct(null);
      } else {
        await api.createProduct(payload);
        alert('Product added successfully!');
        setIsAddingProduct(false);
      }
      const res = await api.getProducts();
      setProducts(res.products.map((p: any) => ({ ...p, id: String(p.id) })) as any);
      resetForm();
    } catch {
      alert('Failed to save product.');
    }
  };

  if (isLoading || !user) return null;

  return (
    <main className="min-h-screen bg-[#FDFDFF] font-outfit pt-24 selection:bg-priority-blue selection:text-white transition-all duration-500">
      
      {/* ── Background Subtle elements ── */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-priority-blue rounded-full blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[30%] h-[30%] bg-purple-500 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-[1600px] mx-auto px-8 md:px-12 pb-32 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-priority-blue border-l-2 border-priority-blue pl-3 mb-3 block">Digital Atelier</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tighter">
                Control <span className="text-priority-blue">Centre</span>
              </h1>
            </motion.div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:block text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Administrator</p>
              <p className="text-sm font-black text-gray-900">{user?.name || 'Admin Account'}</p>
            </div>
            <button onClick={logout} className="p-4 bg-white border border-gray-100 rounded-2xl text-red-500 hover:bg-red-50 transition-all shadow-sm">
                <LogOut size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Navigation Sidebar */}
          <aside className="lg:w-72 shrink-0">
            <nav className="sticky top-32 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setIsAddingProduct(false); setEditingProduct(null); }}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                    activeTab === tab.id 
                      ? 'bg-gray-900 text-white shadow-xl shadow-gray-200' 
                      : 'text-gray-400 hover:text-gray-900 hover:bg-white border border-transparent hover:border-gray-50'
                  }`}
                >
                  <tab.icon size={18} className={activeTab === tab.id ? 'text-priority-blue' : ''} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              
              {activeTab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    {metrics.map((m, i) => (
                       <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group">
                         <div className={`w-12 h-12 ${m.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-gray-100 group-hover:scale-110 transition-transform`}>
                           <m.icon size={22} />
                         </div>
                         <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1">{m.label}</p>
                         <p className="text-3xl font-black text-gray-900 tracking-tight">{m.value}</p>
                       </div>
                    ))}
                  </div>

                  {/* Activity Placeholder */}
                  <div className="bg-white rounded-[3rem] border border-gray-50 p-12 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                        <ShoppingBag size={200} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-8">Recent Activity</h3>
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                       <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-6">
                          <CreditCard size={32} />
                       </div>
                       <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No transactions found in this period</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'inventory' && (
                <motion.div key="inventory" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Inventory</h2>
                      <p className="text-[10px] font-bold text-priority-blue uppercase tracking-widest mt-1">{products.length} Products Live</p>
                    </div>
                    {!isAddingProduct && (
                      <button onClick={() => { setIsAddingProduct(true); setEditingProduct(null); }} className="px-8 py-4 bg-priority-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-priority-blue/20 hover:scale-105 active:scale-95 transition-all">
                        + New Entry
                      </button>
                    )}
                  </div>

                  {isAddingProduct ? (
                    <div className="bg-white rounded-[3rem] border border-gray-100 p-12 shadow-2xl shadow-gray-100">
                        <div className="flex justify-between items-center mb-12 border-b border-gray-50 pb-8">
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">{editingProduct ? 'Update Product' : 'Create Product'}</h3>
                            <button onClick={() => { setIsAddingProduct(false); setEditingProduct(null); resetForm(); }} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center hover:text-red-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveProduct} className="space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-300 ml-2">Product Name</label>
                                    <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. VIP LEXUS MUSTARD" className={inputCls} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-300 ml-2">Price (₹)</label>
                                        <input required type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)||0})} className={inputCls} />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-300 ml-2">Stock</label>
                                        <input required type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)||0})} className={inputCls} />
                                    </div>
                                </div>
                            </div>

                            <CloudinaryUpload label="Featured Image" value={formData.images?.[0] || ''} onChange={(url) => setFormData({ ...formData, images: [url] })} />
                            
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-300 ml-2">Summary</label>
                                <textarea rows={4} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className={`${inputCls} resize-none`} placeholder="Briefly describe the product details..." />
                            </div>

                            <div className="pt-8 border-t border-gray-50 flex gap-4">
                                <button type="submit" className="flex-1 py-5 bg-priority-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-priority-blue/20">
                                    Complete & Save
                                </button>
                                <button type="button" onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }} className="px-12 py-5 bg-gray-50 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {products.map(product => (
                        <div key={product.id} className="bg-white p-6 rounded-[2rem] border border-gray-50 flex gap-4 group hover:shadow-xl transition-all duration-500">
                          <div className="w-24 h-24 bg-gray-50 rounded-2xl p-2 shrink-0">
                            <img src={product.image} className="w-full h-full object-contain mix-blend-multiply" />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <p className="text-[10px] font-black text-priority-blue uppercase tracking-widest truncate">{product.category}</p>
                              <h4 className="text-sm font-black text-gray-900 truncate mt-1">{product.name}</h4>
                              <p className="text-xs font-bold text-gray-400 mt-0.5">₹ {product.price.toLocaleString()}</p>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button onClick={() => { setEditingProduct(product); setFormData(product); setIsAddingProduct(true); }} className="p-2 text-gray-400 hover:text-priority-blue"><Edit3 size={14}/></button>
                               <button onClick={() => { if(window.confirm('Delete?')) api.deleteProduct(product.id).then(() => setProducts(p => p.filter(x => x.id !== product.id))) }} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'bulk' && (
                <motion.div key="bulk" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
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
