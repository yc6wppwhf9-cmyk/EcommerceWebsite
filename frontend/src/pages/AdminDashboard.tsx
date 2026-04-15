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

  const tabs = [
    { id: 'overview', label: 'Stats', icon: LayoutDashboard },
    { id: 'inventory', label: 'Products', icon: Box },
    { id: 'bulk', label: 'Add Many', icon: FileSpreadsheet },
    { id: 'orders', label: 'Orders', icon: Truck },
    { id: 'customers', label: 'Users', icon: Users },
    { id: 'analytics', label: 'Settings', icon: Settings },
  ];

  const metrics = [
    { label: 'Total Items', value: String(products.length), icon: Box, color: 'bg-blue-600' },
    { label: 'Sales', value: '₹ 0', icon: TrendingUp, color: 'bg-green-600' },
    { label: 'New Orders', value: '0', icon: ShoppingBag, color: 'bg-purple-600' },
    { label: 'Users', value: '0', icon: Users, color: 'bg-orange-600' },
  ];

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData, category: formData.subcategory || formData.category };
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        alert('Saved!');
        setEditingProduct(null);
      } else {
        await api.createProduct(payload);
        alert('Added!');
        setIsAddingProduct(false);
      }
      api.getProducts().then(res => setProducts(res.products.map((p: any) => ({ ...p, id: String(p.id) }))));
      setFormData(BLANK_FORM());
    } catch { alert('Error!'); }
  };

  if (isLoading || !user) return null;

  return (
    <main className="min-h-screen bg-[#f8f9fa] font-outfit pt-12 pb-20">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* Header - Reduced Space */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] font-black uppercase text-priority-blue tracking-tighter mb-1">Admin Panel</p>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Logged in as</p>
              <p className="text-xs font-black text-gray-900">{user?.name || 'Admin'}</p>
            </div>
            <button onClick={logout} className="p-3 bg-white border border-gray-200 rounded-xl text-red-500 hover:bg-red-50 transition-all">
                <LogOut size={18} />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar - Better Text Visibility */}
          <aside className="lg:w-60 shrink-0">
            <nav className="space-y-1.5">
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

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              
              {activeTab === 'overview' && (
                <motion.div key="ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {metrics.map((m, i) => (
                       <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                         <div className={`w-10 h-10 ${m.color} rounded-xl flex items-center justify-center text-white mb-4`}>
                           <m.icon size={18} />
                         </div>
                         <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{m.label}</p>
                         <p className="text-xl font-black text-gray-900 tracking-tight">{m.value}</p>
                       </div>
                    ))}
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight mb-4 text-left">Recent Sales</h3>
                    <div className="py-10 text-gray-400">
                       <p className="text-[10px] font-bold uppercase">No orders yet</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'inventory' && (
                <motion.div key="inv" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-black text-gray-900 uppercase">Product List</h2>
                    {!isAddingProduct && (
                      <button onClick={() => { setIsAddingProduct(true); setEditingProduct(null); }} className="px-6 py-3 bg-priority-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                        + Add Item
                      </button>
                    )}
                  </div>

                  {isAddingProduct ? (
                    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xl max-w-2xl mx-auto">
                        <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                            <h3 className="text-sm font-black text-gray-900 uppercase">{editingProduct ? 'Edit Item' : 'Add New Item'}</h3>
                            <button onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }} className="p-2 hover:text-red-500"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveProduct} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-600 uppercase">Name</label>
                                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className={inputCls} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-600 uppercase">Price (₹)</label>
                                    <input required type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)||0})} className={inputCls} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-600 uppercase">Stock</label>
                                    <input required type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)||0})} className={inputCls} />
                                </div>
                            </div>
                            <CloudinaryUpload label="Photo" value={formData.images?.[0] || ''} onChange={(url) => setFormData({ ...formData, images: [url] })} />
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-600 uppercase">Details</label>
                                <textarea rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className={`${inputCls} resize-none`} />
                            </div>
                            <button type="submit" className="w-full py-4 bg-priority-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Save Item</button>
                        </form>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {products.map(p => (
                        <div key={p.id} className="bg-white p-4 rounded-xl border border-gray-200 flex gap-4 hover:border-priority-blue transition-all">
                          <img src={p.image} className="w-20 h-20 object-contain p-1 bg-gray-50 rounded-lg" />
                          <div className="flex-1 flex flex-col justify-between">
                            <h4 className="text-xs font-black text-gray-900 truncate">{p.name}</h4>
                            <p className="text-[10px] font-bold text-gray-400">₹ {p.price.toLocaleString()}</p>
                            <div className="flex gap-4 mt-2">
                               <button onClick={() => { setEditingProduct(p); setFormData(p); setIsAddingProduct(true); }} className="text-[10px] font-black text-priority-blue uppercase">Edit</button>
                               <button onClick={() => { if(window.confirm('Delete?')) api.deleteProduct(p.id).then(() => setProducts(x => x.filter(item => item.id !== p.id))) }} className="text-[10px] font-black text-red-500 uppercase">Delete</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
