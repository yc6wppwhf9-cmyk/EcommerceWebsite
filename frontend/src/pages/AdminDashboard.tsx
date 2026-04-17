import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LogOut, Settings, Users,
  Truck, LayoutDashboard, Box,
  Plus, Edit3, Trash2, X, Check,
  TrendingUp, ShoppingBag, CreditCard,
  FileSpreadsheet, Image as ImageIcon,
  Zap, Award, Percent, Crown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { api } from '../lib/api';
import { BulkUpload } from '../components/BulkUpload';
import { CloudinaryUpload } from '../components/CloudinaryUpload';

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
    { value: 'office-backpacks', label: 'Office Backpacks' },
    { value: 'trekking-backpacks', label: 'Trekking Backpacks' },
  ],
  travel: [
    { value: 'luggage', label: 'Luggage' },
    { value: 'duffle', label: 'Duffle Bags' },
    { value: 'trekking', label: 'Trekking' },
  ],
  accessories: [
    { value: 'pouch', label: 'Pouches' },
    { value: 'lunch-bag', label: 'Lunch Bags' },
    { value: 'daypack', label: 'Daypacks' },
    { value: 'tote-bag', label: 'Tote Bags' },
  ],
  junior: [
    { value: 'school-backpacks', label: 'School Backpacks' },
    { value: 'kids-accessories', label: 'Kids Accessories' },
  ],
  premium: [
    { value: 'premium-backpacks', label: 'Premium Backpacks' },
    { value: 'premium-luggage', label: 'Premium Luggage' },
    { value: 'premium-accessories', label: 'Premium Accessories' },
  ],
};

type ColorVariant = { color: string; colorCode: string; images: string[] };

const BLANK_FORM = (): Partial<Product> => ({
  name: '', price: 0, originalPrice: 0, category: 'backpacks', subcategory: '',
  gender: 'unisex', ageRange: '', stock: 50, description: '', isPremium: false, images: [],
  features: [], sku: 'PB-' + Math.floor(1000 + Math.random() * 9000),
  size: 'Medium', // Default size
  isNew: false, highlighted: false, // highlighted used for best seller
});

const inputCls = 'w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:border-priority-blue outline-none transition-all placeholder:text-gray-400';

export const AdminDashboard = () => {
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>(BLANK_FORM());
  const [variants, setVariants] = useState<ColorVariant[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const metrics = [
    { label: 'Revenue Today', value: '₹ 24,500', icon: TrendingUp, color: 'bg-emerald-500' },
    { label: 'Total Sales', value: orders.length.toString(), icon: ShoppingBag, color: 'bg-priority-blue' },
    { label: 'Active Users', value: '42', icon: Users, color: 'bg-orange-500' },
    { label: 'Pending Ships', value: orders.filter(o => o.status === 'confirmed').length.toString(), icon: Truck, color: 'bg-purple-500' },
  ];

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate('/login');
    if (user && user.role !== 'admin') navigate('/account');
  }, [isAuthenticated, isLoading, navigate, user]);

  const fetchData = async () => {
    try {
      const [prodRes, orderRes] = await Promise.all([
        api.getProducts(),
        api.getOrders()
      ]);
      setProducts(prodRes.products.map((p: any) => ({ ...p, id: String(p.id) })));
      setOrders(orderRes.data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchData();
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

  const addVariant = () => setVariants((v: ColorVariant[]) => [...v, { color: '', colorCode: '#000000', images: [''] }]);
  const updateVariant = (i: number, key: string, val: any) =>
    setVariants((v: ColorVariant[]) => v.map((item: ColorVariant, idx: number) => idx === i ? { ...item, [key]: val } : item));
  const removeVariant = (i: number) => setVariants((v: ColorVariant[]) => v.filter((_: ColorVariant, idx: number) => idx !== i));

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate basic required fields manually for clear UI feedback
      if (!formData.name || !formData.originalPrice || !formData.price || !formData.category) {
        alert('Please fill all mandatory fields marked with *');
        return;
      }

      const payload = {
        ...formData,
        // Slug / URL part
        slug: (formData.name || '').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substring(2, 7),
        category_id: '', // TO BE RESOLVED BY BACKEND OR FETCHED
        sub_category: formData.subcategory || '',
        features: formData.features || [],
        images: formData.images || [],
        colors: variants.length > 0 ? variants.map(v => ({ name: v.color, code: v.colorCode, images: v.images || [] })) : []
      };

      // Remove UI-only fields that crash the backend insert
      delete (payload as any).category;
      delete (payload as any).subcategory;

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        alert('Success: Product Updated!');
      } else {
        await api.createProduct(payload);
        alert('Success: New Product Registered!');
      }
      fetchData();
      setIsAddingProduct(false);
      setEditingProduct(null);
      setFormData(BLANK_FORM());
      setVariants([]);
    } catch (err: any) {
      console.error('Save Error:', err);
      alert(`Error: ${err.message || 'Check required fields'}`);
    }
  };

  const updateStatus = async (orderId: string, status: string, invoiceUrl?: string) => {
    try {
      await api.updateOrderStatus(orderId, status, invoiceUrl);
      setSelectedOrder(null);
      fetchData();
      alert(`Order updated to ${status}!`);
    } catch {
      alert('Failed to update order status');
    }
  };

  const printLabel = (order: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Shipping Label - #${order.id.slice(0, 8)}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #000; }
            .label-card { border: 2px solid #000; padding: 20px; max-width: 500px; margin: 0 auto; }
            .header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
            .logo { font-size: 24px; font-weight: 900; letter-spacing: -1px; }
            .order-id { font-size: 12px; font-weight: 700; color: #666; }
            .address-box { margin-bottom: 30px; }
            .address-label { font-size: 10px; font-weight: 900; text-transform: uppercase; color: #999; margin-bottom: 5px; }
            .name { font-size: 20px; font-weight: 800; margin-bottom: 8px; }
            .address-text { font-size: 14px; line-height: 1.5; font-weight: 500; }
            .footer { border-top: 2px solid #000; pt-20; margin-top: 30px; display: flex; justify-content: space-between; align-items: center; }
            .method { font-size: 11px; font-weight: 900; background: #000; color: #fff; padding: 4px 8px; border-radius: 4px; }
          </style>
        </head>
        <body onload="window.print()">
          <div class="label-card">
            <div class="header">
              <div class="logo">PRIORITY</div>
              <div class="order-id">ORD-${order.id.slice(0, 8).toUpperCase()}</div>
            </div>
            <div class="address-box">
              <div class="address-label">Deliver To</div>
              <div class="name">${order.shipping_name}</div>
              <div class="address-text">
                ${order.shipping_line1}<br>
                ${order.shipping_line2 ? order.shipping_line2 + '<br>' : ''}
                ${order.shipping_city}, ${order.shipping_state} - ${order.shipping_pincode}<br>
                <strong>Phone:</strong> ${order.shipping_phone}
              </div>
            </div>
            <div class="footer">
              <div class="method">${order.payment_method.toUpperCase()}</div>
              <div style="font-weight: 900; font-size: 14px;">₹ ${order.total}</div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (isLoading || !user) return null;

  return (
    <main className="min-h-screen bg-[var(--color-bg-main)] font-outfit pt-10 pb-20 transition-colors duration-300">
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
                  onClick={() => { setActiveTab(tab.id); setIsAddingProduct(false); setEditingProduct(null); setSelectedOrder(null); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${activeTab === tab.id
                      ? 'bg-priority-blue text-white shadow-md'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-[var(--color-bg-card)] border border-transparent'
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
                                <option value="0-2">Infants (0-2 Yrs)</option>
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
                            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: '' })} className={inputCls}>
                              {MAIN_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-600 uppercase ml-1">Sub-Category (Type)</label>
                            <select value={formData.subcategory} onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })} className={inputCls}>
                              <option value="">-- Pick Sub-Category --</option>
                              {(SUBCATEGORIES[formData.category || 'backpacks'] || []).map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                          </div>
                        </div>

                        {/* --- ATTRIBUTES (Size & Features) --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-priority-blue/5 rounded-2xl border border-priority-blue/10">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-priority-blue uppercase ml-1">Product Size (Filtering)</label>
                            <select value={formData.size} onChange={(e) => setFormData({ ...formData, size: e.target.value })} className={inputCls}>
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
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-600 uppercase">Original MRP (₹) <span className="text-red-500">*</span></label>
                              <input required type="number" value={formData.originalPrice} onChange={(e) => setFormData({ ...formData, originalPrice: parseInt(e.target.value) || 0 })} className={inputCls} />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-priority-blue uppercase">Discount %</label>
                              <input type="number" min="0" max="99" value={discountPercent} onChange={(e) => setDiscountPercent(parseInt(e.target.value) || 0)} className={`${inputCls} border-priority-blue/30 text-priority-blue`} />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-900 uppercase">Sale Price <span className="text-red-500">*</span></label>
                              <input required type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })} className={`${inputCls} bg-gray-100`} />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-600 uppercase">Initial Stock <span className="text-red-500">*</span></label>
                              <input required type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })} className={inputCls} />
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
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" checked={formData.isPremium} onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })} className="hidden" />
                            <div className={`w-10 h-6 rounded-full transition-all relative ${formData.isPremium ? 'bg-amber-500' : 'bg-gray-200'}`}>
                              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.isPremium ? 'left-5' : 'left-1'}`} />
                            </div>
                            <span className="flex items-center gap-1 text-[10px] font-black uppercase text-amber-600"><Crown size={12} /> Premium Collection</span>
                          </label>
                        </div>

                        {/* --- MULTI-IMAGE GALLERY --- */}
                        <div className="pt-8 border-t border-gray-100">
                            <div className="flex items-center gap-6">
                              <div className="flex-1">
                                <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Showcase Photo Gallery <span className="text-red-500">*</span></label>
                                <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">First photo is the primary cover image</p>
                              </div>
                              <CloudinaryUpload
                                label=""
                                value=""
                                multiple={true}
                                onBulkChange={(urls) => setFormData(prev => ({ ...prev, images: [...(prev.images || []), ...urls] }))}
                              />
                            </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(formData.images || ['']).map((img, idx) => (
                              <div key={idx} className="relative group/g bg-stone-50 rounded-2xl border border-stone-100 p-4 transition-all hover:shadow-lg">
                                {idx > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newImgs = [...(formData.images || [])];
                                      newImgs.splice(idx, 1);
                                      setFormData(prev => ({ ...prev, images: newImgs }));
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
                                    const newImgs = [...(formData.images || [])];
                                    // Ensure array is long enough if we were at default
                                    if (newImgs.length === 0) newImgs.push('');
                                    newImgs[idx] = url;
                                    setFormData(prev => ({ ...prev, images: newImgs }));
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* --- COLOUR VARIANTS --- */}
                        <div className="pt-6 border-t border-gray-100">
                            <div className="flex items-center gap-6">
                              <div className="flex-1">
                                <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Colour Variants & Photos (Optional)</label>
                                <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Add specific photos for different bag colours</p>
                              </div>
                              <div className="flex gap-4">
                                <button type="button" onClick={addVariant} className="flex items-center gap-2 text-[10px] font-black text-priority-blue uppercase border-2 border-priority-blue/10 px-4 py-2 rounded-xl bg-priority-blue/5 hover:bg-priority-blue hover:text-white transition-all">
                                  + Create Colour Group
                                </button>
                              </div>
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
                                <div className="space-y-4">
                                    <CloudinaryUpload 
                                      label="" 
                                      value="" 
                                      multiple={true}
                                      onBulkChange={(urls) => {
                                        const newImgs = [...(v.images || []), ...urls];
                                        updateVariant(i, 'images', newImgs);
                                      }}
                                    />
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {(v.images || ['']).map((vImg, vIdx) => (
                                      <div key={vIdx} className="relative group/vi bg-white p-2 rounded-xl border border-gray-100">
                                         {vIdx >= 0 && (
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
                                         )}
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
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-600 uppercase ml-1">Marketing Description / Details</label>
                          <textarea rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe features, materials, and highlights..." className={`${inputCls} resize-none`} />
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
                              <p className="text-[8px] font-black text-priority-blue uppercase tracking-widest truncate">
                                {(p.categories?.slug || p.category || 'Standard').toUpperCase()} • {(p.gender || 'Unisex').toUpperCase()}
                              </p>
                              <h4 className="text-[11px] font-black text-gray-900 truncate leading-tight mt-1 mb-0.5">{p.name || 'Unnamed Product'}</h4>
                              <p className="text-[10px] font-bold text-gray-400 tracking-tight">
                                ₹ {(p.price || 0).toLocaleString()} 
                                <span className="line-through text-[8px] ml-1 opacity-50 font-normal">
                                  ₹ {(p.originalPrice || p.original_price || p.price || 0).toLocaleString()}
                                </span>
                              </p>
                            </div>
                            <div className="flex gap-4 mt-3">
                              <button onClick={() => { 
                                setEditingProduct(p); 
                                setFormData({
                                  ...p,
                                  originalPrice: p.original_price || p.originalPrice || 0,
                                  category: p.categories?.slug || p.category || ''
                                }); 
                                setVariants((p.colors || p.variants || []).map((v: any) => ({ 
                                  color: v.name || v.color || '', 
                                  colorCode: v.code || v.colorCode || '#000', 
                                  image: v.image || (v.images?.[0]) || '' 
                                }))); 
                                setIsAddingProduct(true); 
                              }} className="text-[9px] font-black text-priority-blue uppercase tracking-widest hover:underline decoration-2">Edit</button>
                              <button onClick={() => { if (window.confirm('Delete?')) api.deleteProduct(p.id).then(() => fetchData()) }} className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline decoration-2">Delete</button>
                            </div>
                          </div>
                          {p.isNew && <div className="absolute top-0 right-0 w-8 h-8"><div className="absolute top-0 right-0 w-[150%] h-4 bg-priority-blue text-[7px] font-black text-white flex items-center justify-center rotate-45 translate-x-[30%] translate-y-[20%] uppercase">New</div></div>}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'orders' && (
                <motion.div key="ord" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div>
                      <h2 className="text-sm font-black text-gray-900 uppercase">Manage Orders</h2>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">{orders.length} Total orders</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {orders.map(order => (
                      <div key={order.id} className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-priority-blue transition-all">
                        <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-[11px] font-black text-gray-900">#ORD-{order.id.slice(0, 8).toUpperCase()}</span>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${order.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                  order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                    order.status === 'delivered' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                {order.status}
                              </span>
                            </div>
                            <p className="text-sm font-black text-gray-900 mb-0.5">{order.shipping_name}</p>
                            <p className="text-[11px] font-bold text-gray-500">{order.shipping_phone} | {new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-black text-gray-900">₹ {order.total}</p>
                            <p className="text-[10px] font-black text-priority-blue uppercase tracking-widest">{order.payment_method}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <button onClick={() => printLabel(order)} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-[10px] font-black uppercase flex items-center gap-2">
                            <Truck size={14} /> Print Label
                          </button>
                          {order.status !== 'shipped' && order.status !== 'delivered' && (
                            <button onClick={() => setSelectedOrder(order)} className="px-4 py-2 bg-priority-blue text-white rounded-lg text-[10px] font-black uppercase flex items-center gap-2">
                              <Check size={14} /> Mark as Shipped
                            </button>
                          )}
                          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-[10px] font-black uppercase">
                            View Details
                          </button>
                        </div>

                        {/* Expandable Section for Items */}
                        <div className="mt-6 pt-4 border-t border-gray-100">
                          <div className="flex gap-4 overflow-x-auto pb-2">
                            {order.order_items?.map((item: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-3 min-w-[200px] bg-gray-50 p-2 rounded-xl">
                                <img src={item.image} className="w-10 h-10 object-contain" />
                                <div>
                                  <p className="text-[10px] font-black text-gray-900 truncate w-32">{item.name}</p>
                                  <p className="text-[8px] font-bold text-gray-400">QTY: {item.quantity} | ₹ {item.price}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Modal */}
                  {selectedOrder && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                      <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl">
                        <h2 className="text-xl font-black text-gray-900 mb-2 uppercase italic tracking-tighter">Prepare Shipping</h2>
                        <p className="text-xs font-bold text-gray-500 mb-8 uppercase tracking-widest underline decoration-priority-blue decoration-2">Order #ORD-{selectedOrder.id.slice(0, 8).toUpperCase()}</p>

                        <div className="space-y-6">
                          <CloudinaryUpload
                            label="Attach Manual Invoice (PDF/Image)"
                            value={selectedOrder.invoice_url || ''}
                            onChange={(url) => setSelectedOrder({ ...selectedOrder, invoice_url: url })}
                          />

                          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <p className="text-[10px] font-black text-blue-800 uppercase leading-snug">
                              Note: Changing status to "Shipped" will automatically email the customer with their tracking info and attached invoice.
                            </p>
                          </div>

                          <div className="flex gap-3">
                            <button
                              onClick={() => updateStatus(selectedOrder.id, 'shipped', selectedOrder.invoice_url)}
                              className="flex-1 py-4 bg-priority-blue text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-priority-blue/30"
                            >
                              Confirm & Ship
                            </button>
                            <button
                              onClick={() => setSelectedOrder(null)}
                              className="px-8 py-4 bg-gray-100 text-gray-500 rounded-xl text-xs font-black uppercase tracking-widest"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'overview' && (
                <motion.div key="ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-priority-blue/10 rounded-2xl flex items-center justify-center text-priority-blue mb-4">
                      <LayoutDashboard size={32} />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">System Overview</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 max-w-xs leading-relaxed">
                      Real-time analytics and revenue metrics are currently hidden for a cleaner workspace. Use the sidebar to manage inventory and orders.
                    </p>
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
