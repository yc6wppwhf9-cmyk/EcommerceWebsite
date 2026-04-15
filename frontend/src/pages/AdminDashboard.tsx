import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LogOut, Settings, Users,
  Truck, LayoutDashboard, Box,
  Plus, Edit3, Trash2, X, Check,
  TrendingUp, ShoppingBag, CreditCard,
  FileSpreadsheet, Image as ImageIcon,
  Zap, Award, Percent
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { api } from '../lib/api';
import { BulkUpload } from '../components/BulkUpload';
import { CloudinaryUpload } from '../components/CloudinaryUpload';

const MAIN_CATEGORIES = [
  { value: 'backpacks',    label: 'Backpacks' },
  { value: 'luggage',      label: 'Luggage' },
  { value: 'accessories',  label: 'Accessories' },
  { value: 'kids',         label: 'Kids Collection' },
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
  kids: [
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
  isNew: false, highlighted: false, // highlighted used for best seller
});

const inputCls = 'w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:border-priority-blue outline-none transition-all placeholder:text-gray-400';

export const AdminDashboard = () => {
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>(BLANK_FORM());
  const [variants, setVariants] = useState<ColorVariant[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate('/login');
    if (user && user.role !== 'admin') navigate('/account');
  }, [isAuthenticated, isLoading, navigate, user]);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.getProducts().then(res => {
      setProducts(res.products.map((p: any) => ({ ...p, id: String(p.id) })));
    }).catch(() => {});
  }, [isAuthenticated]);

  // Pricing Logic
  useEffect(() => {
    if (discountPercent > 0 && formData.originalPrice) {
      const calculatedPrice = Math.round(formData.originalPrice * (1 - discountPercent / 100));
      setFormData(prev => ({ ...prev, price: calculatedPrice }));
    }
  }, [discountPercent, formData.originalPrice]);

  const tabs = [
    { id: 'overview', label: 'Stats', icon: LayoutDashboard },
    { id: 'inventory', label: 'Products', icon: Box },
    { id: 'bulk', label: 'Add Many', icon: FileSpreadsheet },
    { id: 'orders', label: 'Orders', icon: Truck },
    { id: 'customers', label: 'Users', icon: Users },
  ];

  const addVariant = () => setVariants((v: ColorVariant[]) => [...v, { color: '', colorCode: '#000000', image: '' }]);
  const updateVariant = (i: number, key: keyof ColorVariant, val: string) =>
    setVariants((v: ColorVariant[]) => v.map((item: ColorVariant, idx: number) => idx === i ? { ...item, [key]: val } : item));
  const removeVariant = (i: number) => setVariants((v: ColorVariant[]) => v.filter((_: ColorVariant, idx: number) => idx !== i));

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { 
        ...formData, 
        category: formData.subcategory || formData.category,
        sub_category: formData.subcategory || '',
        colors: variants.map(v => ({ name: v.color, code: v.colorCode, image: v.image }))
      };
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        alert('Items updated!');
        setEditingProduct(null);
      } else {
        await api.createProduct(payload);
        alert('Item added successfully!');
        setIsAddingProduct(false);
      }
      api.getProducts().then(res => setProducts(res.products.map((p: any) => ({ ...p, id: String(p.id) }))));
      setFormData(BLANK_FORM());
      setVariants([]);
      setDiscountPercent(0);
    } catch { alert('Error saving! Check required fields'); }
  };

  if (isLoading || !user) return null;

  return (
    <main className="min-h-screen bg-[#f8f9fa] font-outfit pt-10 pb-20">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* Simple Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Shop Admin</h1>
            <p className="text-[10px] font-black text-priority-blue uppercase tracking-widest mt-1">Manage Store Inventory</p>
          </div>
          <button onClick={logout} className="px-5 py-3 bg-white border border-gray-200 rounded-xl text-red-500 font-bold text-xs flex items-center gap-2 hover:bg-red-50 transition-all">
              <LogOut size={16} /> Logout
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Navigation Sidebar */}
          <aside className="lg:w-56 shrink-0">
            <nav className="space-y-1.5 sticky top-24">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setIsAddingProduct(false); setEditingProduct(null); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                    activeTab === tab.id 
                      ? 'bg-priority-blue text-white shadow-md' 
                      : 'text-gray-500 hover:text-gray-900 hover:bg-white border border-transparent'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              
              {activeTab === 'inventory' && (
                <motion.div key="inv" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  
                  <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div>
                        <h2 className="text-sm font-black text-gray-900 uppercase">Manage Inventory</h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">{products.length} Items found</p>
                    </div>
                    {!isAddingProduct && (
                      <button onClick={() => { setIsAddingProduct(true); setEditingProduct(null); }} className="px-6 py-3 bg-priority-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-priority-blue/20">
                        + New Product
                      </button>
                    )}
                  </div>

                  {isAddingProduct ? (
                    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-2xl max-w-3xl mx-auto overflow-hidden">
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
                                    <label className="text-[10px] font-black text-gray-600 uppercase ml-1">Full Product Name</label>
                                    <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. VIP MUSTARD LUXE" className={inputCls} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-600 uppercase ml-1">Gender / Style</label>
                                    <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value as any})} className={inputCls}>
                                        <option value="unisex">Unisex / All</option>
                                        <option value="men">Men</option>
                                        <option value="women">Women</option>
                                        <option value="kids">Kids</option>
                                    </select>
                                </div>
                            </div>

                            {/* --- CATEGORIES --- */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-600 uppercase ml-1">Category (Main Section)</label>
                                    <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value, subcategory: ''})} className={inputCls}>
                                        {MAIN_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-600 uppercase ml-1">Sub-Category (Type)</label>
                                    <select value={formData.subcategory} onChange={(e) => setFormData({...formData, subcategory: e.target.value})} className={inputCls}>
                                        <option value="">-- Pick Sub-Category --</option>
                                        {(SUBCATEGORIES[formData.category || 'backpacks'] || []).map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* --- PRICING & DISCOUNTS --- */}
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2"><Percent size={14}/> Pricing Strategy</p>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-600 uppercase">Original MRP (₹)</label>
                                        <input required type="number" value={formData.originalPrice} onChange={(e) => setFormData({...formData, originalPrice: parseInt(e.target.value)||0})} className={inputCls} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-priority-blue uppercase">Discount %</label>
                                        <input type="number" min="0" max="99" value={discountPercent} onChange={(e) => setDiscountPercent(parseInt(e.target.value)||0)} className={`${inputCls} border-priority-blue/30 text-priority-blue`} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-900 uppercase">Sale Price (Calculated)</label>
                                        <input required type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)||0})} className={`${inputCls} bg-gray-100`} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-600 uppercase">Initial Stock</label>
                                        <input required type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)||0})} className={inputCls} />
                                    </div>
                                </div>
                            </div>

                            {/* --- TAGS & STATUS --- */}
                            <div className="flex flex-wrap gap-8 py-2">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" checked={formData.isNew} onChange={(e) => setFormData({...formData, isNew: e.target.checked})} className="hidden" />
                                    <div className={`w-10 h-6 rounded-full transition-all relative ${formData.isNew ? 'bg-priority-blue' : 'bg-gray-200'}`}>
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.isNew ? 'left-5' : 'left-1'}`} />
                                    </div>
                                    <span className="flex items-center gap-1 text-[10px] font-black uppercase text-gray-700"><Zap size={12}/> Mark as New Arrival</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" checked={formData.highlighted} onChange={(e) => setFormData({...formData, highlighted: e.target.checked})} className="hidden" />
                                    <div className={`w-10 h-6 rounded-full transition-all relative ${formData.highlighted ? 'bg-orange-500' : 'bg-gray-200'}`}>
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.highlighted ? 'left-5' : 'left-1'}`} />
                                    </div>
                                    <span className="flex items-center gap-1 text-[10px] font-black uppercase text-orange-600"><Award size={12}/> Mark as Best Seller</span>
                                </label>
                            </div>

                            <CloudinaryUpload label="Primary Showcase Photo (Main)" value={formData.images?.[0] || ''} onChange={(url) => setFormData({ ...formData, images: [url] })} />
                            
                            {/* --- COLOUR VARIANTS --- */}
                            <div className="pt-6 border-t border-gray-100">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Colour Variants & Photos</label>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Add specific photos for different bag colours</p>
                                    </div>
                                    <button type="button" onClick={addVariant} className="flex items-center gap-2 text-[10px] font-black text-priority-blue uppercase border-2 border-priority-blue/10 px-4 py-2 rounded-xl bg-priority-blue/5 hover:bg-priority-blue hover:text-white transition-all">
                                        + Add Colour Case
                                    </button>
                                </div>
                                
                                <div className="space-y-6">
                                    {variants.map((v, i) => (
                                        <div key={i} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 relative group/v shadow-inner">
                                            <button type="button" onClick={() => removeVariant(i)} className="absolute top-4 right-4 w-8 h-8 bg-white text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover/v:opacity-100 transition-all shadow-sm"><X size={16} /></button>
                                            
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
                                            <CloudinaryUpload label={`Upload Photo for ${v.color || 'this colour'}`} value={v.image} onChange={(url) => updateVariant(i, 'image', url)} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-600 uppercase ml-1">Marketing Description / Details</label>
                                <textarea rows={4} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Describe features, materials, and highlights..." className={`${inputCls} resize-none`} />
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
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {products.map(p => (
                        <div key={p.id} className="bg-white p-5 rounded-2xl border border-gray-100 flex gap-4 hover:border-priority-blue hover:shadow-xl transition-all group relative overflow-hidden">
                          <img src={p.image} className="w-20 h-20 object-contain p-2 bg-gray-50 rounded-xl" />
                          <div className="flex-1 flex flex-col justify-between overflow-hidden">
                            <div>
                              <p className="text-[8px] font-black text-priority-blue uppercase tracking-widest truncate">{p.category} • {p.gender}</p>
                              <h4 className="text-[11px] font-black text-gray-900 truncate leading-tight mt-1 mb-0.5">{p.name}</h4>
                              <p className="text-[10px] font-bold text-gray-400 tracking-tight">₹ {p.price.toLocaleString()} <span className="line-through text-[8px] ml-1 opacity-50 font-normal">₹{p.originalPrice.toLocaleString()}</span></p>
                            </div>
                            <div className="flex gap-4 mt-3">
                               <button onClick={() => { setEditingProduct(p); setFormData(p); setVariants((p.variants || []).map((v:any) => ({ color: v.color||'', colorCode: v.colorCode||'#000', image: v.images?.[0]||'' }))); setIsAddingProduct(true); }} className="text-[9px] font-black text-priority-blue uppercase tracking-widest hover:underline decoration-2">Edit</button>
                               <button onClick={() => { if(window.confirm('Delete?')) api.deleteProduct(p.id).then(() => setProducts(x => x.filter(item => item.id !== p.id))) }} className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline decoration-2">Delete</button>
                            </div>
                          </div>
                          {p.isNew && <div className="absolute top-0 right-0 w-8 h-8"><div className="absolute top-0 right-0 w-[150%] h-4 bg-priority-blue text-[7px] font-black text-white flex items-center justify-center rotate-45 translate-x-[30%] translate-y-[20%] uppercase">New</div></div>}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'overview' && (
                <motion.div key="ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {metrics.map((m, i) => (
                        <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                            <div className={`w-10 h-10 ${m.color} rounded-xl flex items-center justify-center text-white mb-4 relative z-10 group-hover:scale-110 transition-transform`}>
                                <m.icon size={18} />
                            </div>
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 relative z-10">{m.label}</p>
                            <p className="text-xl font-black text-gray-900 tracking-tight relative z-10">{m.value}</p>
                            <div className="absolute -bottom-4 -right-4 text-gray-50 opacity-[0.03] group-hover:scale-125 transition-transform"><m.icon size={100} /></div>
                        </div>
                        ))}
                    </div>
                </motion.div>
              )}

              {activeTab === 'bulk' && <motion.div key="blk" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><BulkUpload /></motion.div>}
              
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
};
