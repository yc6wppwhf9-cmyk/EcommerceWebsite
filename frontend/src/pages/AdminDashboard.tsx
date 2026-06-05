import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LogOut, Users,
  Truck, LayoutDashboard, Box,
  Plus, Edit3, Trash2, X, Check,
  TrendingUp, ShoppingBag,
  FileSpreadsheet, Image as ImageIcon,
  Zap, Award, Percent, Crown,
  Briefcase, FileText, ChevronDown, Loader2,
  Eye, EyeOff, AlertTriangle, Search,
  ChevronLeft, ChevronRight, Tag, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Product, Job, Application } from '../types';
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
  ],
};

type ColorVariant = { color: string; colorCode: string; images: string[] };

const BLANK_FORM = (): Partial<Product> => ({
  name: '', price: 0, originalPrice: 0, category: 'backpacks', subcategory: '',
  gender: 'unisex', ageRange: '', stock: 50, description: '', isPremium: false, images: [],
  features: [], sku: 'PB-' + Math.floor(1000 + Math.random() * 9000),
  size: '', juniorStyle: '',
  isNew: false, highlighted: false, // highlighted used for best seller
});

const inputCls = 'w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:border-priority-blue outline-none transition-all placeholder:text-gray-400';

const ORDERS_PER_PAGE = 20;
const PRODUCTS_PER_PAGE = 18;

const Pagination = ({ page, total, onPage }: { page: number; total: number; onPage: (p: number) => void }) => {
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3 pt-4">
      <button disabled={page === 1} onClick={() => onPage(page - 1)} className="p-2 rounded-xl bg-white border border-gray-200 disabled:opacity-30 hover:border-priority-blue transition-all">
        <ChevronLeft size={14} />
      </button>
      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Page {page} of {total}</span>
      <button disabled={page === total} onClick={() => onPage(page + 1)} className="p-2 rounded-xl bg-white border border-gray-200 disabled:opacity-30 hover:border-priority-blue transition-all">
        <ChevronRight size={14} />
      </button>
    </div>
  );
};

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
  const [fetchLoading, setFetchLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [editingStock, setEditingStock] = useState<{ id: string; value: number } | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [ordersPage, setOrdersPage] = useState(1);
  const [productsPage, setProductsPage] = useState(1);
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkUpdating, setBulkUpdating] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Banner settings state
  const BANNER_OPTIONS = [
    { value: 'luggage', label: 'Luggage', url: '/luggage?theme=premium' },
    { value: 'backpacks', label: 'Backpacks', url: '/backpacks?theme=premium' },
    { value: 'duffle', label: 'Duffels', url: '/duffle?theme=premium' },
  ];
  const [editorialBanner, setEditorialBanner] = useState({ category: 'luggage', label: 'Luggage', url: '/luggage?theme=premium' });
  const [bannerSaving, setBannerSaving] = useState(false);

  useEffect(() => {
    api.getSetting('premium_editorial_banner')
      .then(val => { if (val?.category) setEditorialBanner(val); })
      .catch(() => { });
  }, []);

  const saveEditorialBanner = async () => {
    setBannerSaving(true);
    try {
      await api.updateSetting('premium_editorial_banner', editorialBanner);
      showToast('Banner saved successfully');
    } catch (err: any) {
      showToast(err.message || 'Failed to save banner', 'error');
    } finally {
      setBannerSaving(false);
    }
  };

  // Users state
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');

  // Coupons state
  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponLoading, setCouponLoading] = useState(false);
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const BLANK_COUPON = () => ({ code: '', discount_type: 'percentage' as 'percentage' | 'fixed', discount_value: '', max_uses: '', min_cart_value: '', start_date: '', end_date: '' });
  const [couponForm, setCouponForm] = useState(BLANK_COUPON());

  const fetchCoupons = async () => {
    setCouponLoading(true);
    try { setCoupons(await api.listCoupons()); } catch { /* ignore */ } finally { setCouponLoading(false); }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCoupon({
        code: couponForm.code,
        discount_type: couponForm.discount_type,
        discount_value: Number(couponForm.discount_value),
        max_uses: couponForm.max_uses ? Number(couponForm.max_uses) : undefined,
        min_cart_value: couponForm.min_cart_value ? Number(couponForm.min_cart_value) : undefined,
        start_date: couponForm.start_date || undefined,
        end_date: couponForm.end_date || undefined,
      });
      showToast('Coupon created!');
      setIsAddingCoupon(false);
      setCouponForm(BLANK_COUPON());
      fetchCoupons();
    } catch (err: any) { showToast(err.message || 'Failed to create coupon', 'error'); }
  };

  const handleToggleCoupon = async (id: string, is_active: boolean) => {
    try {
      await api.toggleCoupon(id, !is_active);
      fetchCoupons();
    } catch (err: any) { showToast(err.message || 'Failed to update coupon', 'error'); }
  };

  // Jobs & Applications state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isAddingJob, setIsAddingJob] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [appFilter, setAppFilter] = useState('all');
  const BLANK_JOB = () => ({ title: '', description: '', location: '', department: '', job_type: 'full-time' as Job['job_type'], salary_min: undefined as number | undefined, salary_max: undefined as number | undefined, requirements: '', status: 'draft' as Job['status'] });
  const [jobForm, setJobForm] = useState(BLANK_JOB());

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedOrderIds.size === 0) return;
    setBulkUpdating(true);
    try {
      await Promise.all([...selectedOrderIds].map(id => api.updateOrderStatus(id, bulkStatus)));
      showToast(`${selectedOrderIds.size} order${selectedOrderIds.size > 1 ? 's' : ''} updated to "${bulkStatus}"`);
      setSelectedOrderIds(new Set());
      setBulkStatus('');
      fetchData();
    } catch {
      showToast('Some orders failed to update', 'error');
    } finally {
      setBulkUpdating(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate('/login');
    if (user && user.role !== 'admin') navigate('/account');
  }, [isAuthenticated, isLoading, navigate, user]);

  const fetchData = async () => {
    setFetchLoading(true);
    const [prodRes, orderRes, jobRes, appRes] = await Promise.allSettled([
      api.getProducts({ limit: '999' }),
      api.getOrders({ limit: 500 }),
      api.getJobs({ status: 'all' }),
      api.getAllApplications(),
    ]);
    if (prodRes.status === 'fulfilled') setProducts(prodRes.value.products.map((p: any) => ({ ...p, id: String(p.id) })));
    else showToast('Failed to load products — check connection', 'error');
    if (orderRes.status === 'fulfilled') setOrders(orderRes.value.data);
    else showToast('Failed to load orders — check connection', 'error');
    if (jobRes.status === 'fulfilled') setJobs(jobRes.value.jobs);
    if (appRes.status === 'fulfilled') setApplications(appRes.value.applications);
    setFetchLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
      fetchCoupons();
      api.getAllUsers().then(setAllUsers).catch(() => {});
    }
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
    { id: 'banners', label: 'Banners', icon: ImageIcon },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'customers', label: 'Users', icon: Users },
    { id: 'coupons', label: 'Coupons', icon: Tag },
  ];

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingJob) {
        await api.updateJob(editingJob.id, jobForm);
      } else {
        await api.createJob(jobForm);
      }
      setIsAddingJob(false);
      setEditingJob(null);
      setJobForm(BLANK_JOB());
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save job', 'error');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm('Delete this job posting? All applications will be removed.')) return;
    try {
      await api.deleteJob(jobId);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete job', 'error');
    }
  };

  const handleUpdateAppStatus = async (appId: string, status: string) => {
    try {
      await api.updateApplicationStatus(appId, status);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  // ── Overview computed values ──────────────────────────────────────────────
  const today = new Date();
  const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === today.toDateString());
  const todayRevenue = todayOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const pendingActionCount = orders.filter(o => o.status === 'pending' || o.status === 'confirmed' || o.status === 'processing').length;
  const lowStockProducts = products.filter(p => (p.stock ?? 0) <= 5);

  // ── Filtered products ─────────────────────────────────────────────────────
  const filteredProducts = products.filter(p => {
    const matchSearch = !productSearch || (p.name || '').toLowerCase().includes(productSearch.toLowerCase());
    const matchCat = productCategoryFilter === 'all' || ((p as any).categories?.slug || p.category) === productCategoryFilter;
    return matchSearch && matchCat;
  });

  // ── Filtered orders ───────────────────────────────────────────────────────
  const filteredOrders = orderStatusFilter === 'all' ? orders : orders.filter(o => o.status === orderStatusFilter);
  const totalOrderPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice((ordersPage - 1) * ORDERS_PER_PAGE, ordersPage * ORDERS_PER_PAGE);
  const allPageSelected = paginatedOrders.length > 0 && paginatedOrders.every(o => selectedOrderIds.has(o.id));

  // ── Paginated products ────────────────────────────────────────────────────
  const totalProductPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice((productsPage - 1) * PRODUCTS_PER_PAGE, productsPage * PRODUCTS_PER_PAGE);

  // ── Order status pipeline ─────────────────────────────────────────────────
  const ORDER_NEXT: Record<string, { label: string; status: string; needsInvoice?: boolean }> = {
    pending:          { label: 'Confirm Order',    status: 'confirmed' },
    confirmed:        { label: 'Mark Processing',  status: 'processing' },
    processing:       { label: 'Mark as Shipped',  status: 'shipped', needsInvoice: true },
    shipped:          { label: 'Mark Delivered',   status: 'delivered' },
    return_requested: { label: 'Approve Return',   status: 'returned' },
  };
  const ORDER_STATUS_COLOR: Record<string, string> = {
    pending:          'bg-yellow-100 text-yellow-700',
    confirmed:        'bg-blue-100 text-blue-700',
    processing:       'bg-purple-100 text-purple-700',
    shipped:          'bg-indigo-100 text-indigo-700',
    delivered:        'bg-green-100 text-green-700',
    cancelled:        'bg-red-100 text-red-600',
    return_requested: 'bg-orange-100 text-orange-700',
    returned:         'bg-gray-100 text-gray-600',
  };

  // ── Quick stock update ────────────────────────────────────────────────────
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

  // ── Visibility toggle ─────────────────────────────────────────────────────
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

      // 1. Build a clean payload — avoid sending extra joined objects or internal IDs
      const cleanPayload: any = {
        name: formData.name,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice),
        category: formData.category,
        sub_category: formData.subcategory || formData.sub_category || '',
        description: formData.description || '',
        stock: Number(formData.stock),
        gender: formData.gender || 'unisex',
        ageRange: formData.ageRange || '',
        size: formData.size || '',
        junior_style: formData.juniorStyle || formData.junior_style || null,
        isNew: !!formData.isNew,
        highlighted: !!formData.highlighted,
        isPremium: !!formData.isPremium || formData.category === 'premium',
        features: Array.isArray(formData.features) ? formData.features : [],
        images: (formData.images || []).filter(Boolean),
        colors: variants.filter(v => v.color.trim()).map(v => ({ name: v.color, code: v.colorCode, images: (v.images || []).filter(Boolean) }))
      };

      // Only generate a new slug if it doesn't exist (for new products)
      if (!editingProduct) {
        cleanPayload.slug = (formData.name || '').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substring(2, 7);
        cleanPayload.sku = formData.sku || 'PB-' + Math.floor(1000 + Math.random() * 9000);
      }

      if (editingProduct) {
        const updated = await api.updateProduct(editingProduct.id, cleanPayload);
        // Update local state with the actual response from server to ensure sync
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...updated } : p));
        showToast('Product Updated!');
      } else {
        const newProduct = await api.createProduct(cleanPayload);
        setProducts(prev => [...prev, newProduct]);
        showToast('New Product Registered!');
      }
      setIsAddingProduct(false);
      setEditingProduct(null);
      setFormData(BLANK_FORM());
      setVariants([]);
    } catch (err: any) {
      console.error('Save Error:', err);
      showToast(err.message || 'Check required fields', 'error');
    }
  };

  const updateStatus = async (orderId: string, status: string, invoiceUrl?: string) => {
    try {
      await api.updateOrderStatus(orderId, status, invoiceUrl);
      setSelectedOrder(null);
      fetchData();
      showToast(`Order updated to ${status}!`);
    } catch {
      showToast('Failed to update order status', 'error');
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

  if (isLoading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-priority-blue animate-spin" />
    </div>
  );

  return (
    <main className="min-h-screen bg-[var(--color-bg-main)] font-outfit pt-10 pb-20 transition-colors duration-300">
      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-[200] px-6 py-4 rounded-2xl shadow-2xl text-white text-sm font-black ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">

        {/* Simple Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-10">
          <div>
            <h1 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight">Shop Admin</h1>
            <p className="text-[10px] font-black text-priority-blue uppercase tracking-widest mt-1">Manage Store Inventory</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="px-5 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-bold text-xs flex items-center gap-2 hover:bg-gray-50 transition-all">
              🏠 Home
            </button>
            <button onClick={logout} className="px-5 py-3 bg-white border border-gray-200 rounded-xl text-red-500 font-bold text-xs flex items-center gap-2 hover:bg-red-50 transition-all">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Navigation Sidebar */}
          <aside className="lg:w-56 shrink-0">
            {/* Mobile: horizontal scrollable tabs */}
            <div className="flex overflow-x-auto gap-2 pb-1 lg:hidden -mx-4 px-4 sm:-mx-6 sm:px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSelectedOrder(null); }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shrink-0 whitespace-nowrap ${activeTab === tab.id
                      ? 'bg-priority-blue text-white shadow-md'
                      : 'text-gray-500 bg-white border border-gray-100'
                    }`}
                >
                  <tab.icon size={13} />
                  {tab.label}
                </button>
              ))}
            </div>
            {/* Desktop: vertical sticky nav */}
            <nav className="hidden lg:flex lg:flex-col space-y-1.5 sticky top-24">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSelectedOrder(null); }}
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
                      <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">{filteredProducts.length} of {products.length} Items</p>
                    </div>
                    {!isAddingProduct && (
                      <button onClick={() => { setIsAddingProduct(true); setEditingProduct(null); }} className="px-6 py-3 bg-priority-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-priority-blue/20">
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
                            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: '', isPremium: e.target.value === 'premium' ? true : formData.isPremium })} className={inputCls}>
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

                        {/* --- JUNIOR STYLE (only shown for Junior category) --- */}
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

                        {/* --- PHOTOS & COLOUR OPTIONS (unified) --- */}
                        <div className="pt-8 border-t border-gray-100 space-y-6">
                          {/* Section header */}
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
                                      {(p.categories?.slug || p.category || 'Standard').toUpperCase()} • {(p.gender || 'Unisex').toUpperCase()}
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
                                    <button onClick={() => {
                                      setEditingProduct(p);
                                      setFormData({
                                        ...p,
                                        originalPrice: p.originalPrice || (p as any).original_price || 0,
                                        category: (p as any).categories?.slug || p.category || '',
                                        subcategory: (p as any).sub_category || p.subcategory || '',
                                        isPremium: (p as any).is_premium ?? p.isPremium ?? false,
                                        highlighted: (p as any).is_highlighted ?? p.highlighted ?? false,
                                        isNew: (p as any).is_new ?? p.isNew ?? false,
                                        juniorStyle: (p as any).junior_style || '',
                                        images: Array.isArray((p as any).images) ? (p as any).images : [],
                                      });
                                      setVariants(((p as any).colors || p.variants || []).map((v: any) => ({
                                        color: v.name || v.color || '',
                                        colorCode: v.code || v.colorCode || '#000',
                                        images: (v.images || []).filter(Boolean),
                                      })));
                                      setDiscountPercent(0);
                                      setIsAddingProduct(true);
                                    }} className="text-[10px] font-black text-priority-blue uppercase tracking-widest hover:underline decoration-2 flex items-center gap-1">
                                      <Edit3 size={11} /> Edit
                                    </button>
                                    <button
                                      onClick={() => handleToggleVisibility(p)}
                                      className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors ${(p as any).is_active === false ? 'text-gray-300 hover:text-orange-500' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                      {(p as any).is_active === false ? <EyeOff size={11} /> : <Eye size={11} />}
                                      {(p as any).is_active === false ? 'Show' : 'Live'}
                                    </button>
                                    <button onClick={() => { if (window.confirm('Delete this product?')) api.deleteProduct(p.id).then(() => { fetchData(); showToast('Product deleted'); }).catch(() => showToast('Delete failed', 'error')); }} className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline decoration-2 flex items-center gap-1 ml-auto">
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
              )}

              {activeTab === 'orders' && (
                <motion.div key="ord" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div>
                      <h2 className="text-sm font-black text-gray-900 uppercase">Manage Orders</h2>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">{filteredOrders.length} of {orders.length} Orders</p>
                    </div>
                  </div>

                  {/* Status filter tabs */}
                  <div className="flex overflow-x-auto gap-2 pb-1">
                    {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'return_requested', 'cancelled', 'returned'].map(status => (
                      <button
                        key={status}
                        onClick={() => { setOrderStatusFilter(status); setOrdersPage(1); setSelectedOrderIds(new Set()); }}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0 transition-all ${
                          orderStatusFilter === status
                            ? 'bg-priority-blue text-white shadow-md'
                            : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {status === 'all' ? `All (${orders.length})` : `${status.replace(/_/g, ' ')} (${orders.filter(o => o.status === status).length})`}
                      </button>
                    ))}
                  </div>

                  {/* Bulk action bar */}
                  {selectedOrderIds.size > 0 && (
                    <div className="sticky top-4 z-10 bg-priority-blue text-white rounded-2xl p-4 flex flex-wrap items-center gap-3 shadow-xl">
                      <span className="text-[11px] font-black">{selectedOrderIds.size} order{selectedOrderIds.size > 1 ? 's' : ''} selected</span>
                      <select
                        value={bulkStatus}
                        onChange={e => setBulkStatus(e.target.value)}
                        className="bg-white/20 text-white rounded-xl px-3 py-2 text-[10px] font-black outline-none border border-white/30"
                      >
                        <option value="">Set status…</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button
                        onClick={handleBulkStatusUpdate}
                        disabled={!bulkStatus || bulkUpdating}
                        className="px-4 py-2 bg-white text-priority-blue rounded-xl text-[10px] font-black disabled:opacity-50 flex items-center gap-2"
                      >
                        {bulkUpdating ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                        Apply
                      </button>
                      <button onClick={() => setSelectedOrderIds(new Set())} className="ml-auto p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Select all row */}
                    {paginatedOrders.length > 0 && (
                      <label className="flex items-center gap-2 px-2 cursor-pointer w-fit">
                        <input
                          type="checkbox"
                          checked={allPageSelected}
                          onChange={e => {
                            const next = new Set(selectedOrderIds);
                            paginatedOrders.forEach(o => e.target.checked ? next.add(o.id) : next.delete(o.id));
                            setSelectedOrderIds(next);
                          }}
                          className="w-4 h-4 rounded accent-priority-blue"
                        />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          {allPageSelected ? 'Deselect page' : 'Select page'}
                        </span>
                      </label>
                    )}

                    {paginatedOrders.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
                        <Truck size={32} className="mx-auto text-gray-200 mb-3" />
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">No orders with this status</p>
                      </div>
                    ) : paginatedOrders.map(order => (
                      <div key={order.id} className={`bg-white p-6 rounded-2xl border transition-all ${selectedOrderIds.has(order.id) ? 'border-priority-blue ring-1 ring-priority-blue/20' : 'border-gray-200 hover:border-priority-blue'}`}>
                        <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={selectedOrderIds.has(order.id)}
                              onChange={e => {
                                const next = new Set(selectedOrderIds);
                                e.target.checked ? next.add(order.id) : next.delete(order.id);
                                setSelectedOrderIds(next);
                              }}
                              className="mt-1 w-4 h-4 rounded accent-priority-blue shrink-0"
                            />
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-[11px] font-black text-gray-900">#ORD-{order.id.slice(0, 8).toUpperCase()}</span>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${ORDER_STATUS_COLOR[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                {order.status}
                              </span>
                            </div>
                            <p className="text-sm font-black text-gray-900 mb-0.5">{order.shipping_name}</p>
                            <p className="text-[11px] font-bold text-gray-500">{order.shipping_phone} | {new Date(order.created_at).toLocaleDateString()}</p>
                            {order.return_reason && (
                              <p className="text-[10px] font-bold text-orange-600 mt-1 max-w-xs">Return: {order.return_reason}</p>
                            )}
                          </div>
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
                          {ORDER_NEXT[order.status] && (
                            ORDER_NEXT[order.status].needsInvoice ? (
                              <button onClick={() => setSelectedOrder(order)} className="px-4 py-2 bg-priority-blue text-white rounded-lg text-[10px] font-black uppercase flex items-center gap-2">
                                <Check size={14} /> {ORDER_NEXT[order.status].label}
                              </button>
                            ) : (
                              <button onClick={() => updateStatus(order.id, ORDER_NEXT[order.status].status)} className="px-4 py-2 bg-priority-blue text-white rounded-lg text-[10px] font-black uppercase flex items-center gap-2">
                                <Check size={14} /> {ORDER_NEXT[order.status].label}
                              </button>
                            )
                          )}
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

                  <Pagination page={ordersPage} total={totalOrderPages} onPage={p => { setOrdersPage(p); setSelectedOrderIds(new Set()); }} />

                  {/* Shipping Modal */}
                  {selectedOrder && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                      <div className="bg-white rounded-3xl p-4 sm:p-8 max-w-lg w-full shadow-2xl">
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

              {activeTab === 'jobs' && (
                <motion.div key="jobs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div>
                      <h2 className="text-sm font-black text-gray-900 uppercase">Job Postings</h2>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">{jobs.length} total</p>
                    </div>
                    {!isAddingJob && (
                      <button onClick={() => { setIsAddingJob(true); setEditingJob(null); setJobForm(BLANK_JOB()); }}
                        className="px-5 py-2.5 bg-priority-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-priority-blue/20 flex items-center gap-2">
                        <Plus size={14} /> New Job
                      </button>
                    )}
                  </div>

                  {isAddingJob ? (
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xl max-w-3xl">
                      <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">{editingJob ? 'Edit Job' : 'Create Job'}</h3>
                        <button onClick={() => { setIsAddingJob(false); setEditingJob(null); }} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><X size={18} /></button>
                      </div>
                      <form onSubmit={handleSaveJob} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-500 uppercase">Title *</label>
                            <input required type="text" placeholder="e.g. Product Designer" className={inputCls}
                              value={jobForm.title} onChange={e => setJobForm({ ...jobForm, title: e.target.value })} />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-500 uppercase">Job Type *</label>
                            <select required className={inputCls} value={jobForm.job_type} onChange={e => setJobForm({ ...jobForm, job_type: e.target.value as Job['job_type'] })}>
                              <option value="full-time">Full-time</option>
                              <option value="part-time">Part-time</option>
                              <option value="contract">Contract</option>
                              <option value="internship">Internship</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-500 uppercase">Location *</label>
                            <input required type="text" placeholder="e.g. Mumbai HQ" className={inputCls}
                              value={jobForm.location} onChange={e => setJobForm({ ...jobForm, location: e.target.value })} />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-500 uppercase">Department</label>
                            <input type="text" placeholder="e.g. Engineering" className={inputCls}
                              value={jobForm.department} onChange={e => setJobForm({ ...jobForm, department: e.target.value })} />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-500 uppercase">Salary Min (₹)</label>
                            <input type="number" placeholder="e.g. 400000" className={inputCls}
                              value={jobForm.salary_min ?? ''} onChange={e => setJobForm({ ...jobForm, salary_min: e.target.value ? Number(e.target.value) : undefined })} />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-500 uppercase">Salary Max (₹)</label>
                            <input type="number" placeholder="e.g. 800000" className={inputCls}
                              value={jobForm.salary_max ?? ''} onChange={e => setJobForm({ ...jobForm, salary_max: e.target.value ? Number(e.target.value) : undefined })} />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-500 uppercase">Description *</label>
                          <textarea required rows={4} placeholder="Describe the role..." className={inputCls}
                            value={jobForm.description} onChange={e => setJobForm({ ...jobForm, description: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-500 uppercase">Requirements</label>
                          <textarea rows={3} placeholder="Skills, experience, qualifications..." className={inputCls}
                            value={jobForm.requirements} onChange={e => setJobForm({ ...jobForm, requirements: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-500 uppercase">Status</label>
                          <select className={inputCls} value={jobForm.status} onChange={e => setJobForm({ ...jobForm, status: e.target.value as Job['status'] })}>
                            <option value="draft">Draft (hidden)</option>
                            <option value="open">Open (visible)</option>
                            <option value="closed">Closed</option>
                          </select>
                        </div>
                        <div className="flex gap-3 pt-2">
                          <button type="submit" className="flex-1 py-3.5 bg-priority-blue text-white rounded-xl text-xs font-black uppercase tracking-widest">
                            {editingJob ? 'Update Job' : 'Create Job'}
                          </button>
                          <button type="button" onClick={() => { setIsAddingJob(false); setEditingJob(null); }}
                            className="px-8 py-3.5 bg-gray-100 text-gray-500 rounded-xl text-xs font-black uppercase">Cancel</button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {jobs.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
                          <Briefcase size={32} className="mx-auto text-gray-200 mb-3" />
                          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">No job postings yet</p>
                        </div>
                      ) : jobs.map(job => (
                        <div key={job.id} className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-priority-blue/30 transition-all">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 flex-wrap mb-1">
                                <h3 className="text-sm font-black text-gray-900">{job.title}</h3>
                                <span className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase ${job.status === 'open' ? 'bg-green-100 text-green-700' : job.status === 'draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                                  {job.status}
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{job.location} &bull; {job.job_type}{job.salary_min ? ` · ₹${(job.salary_min / 100000).toFixed(1)}L` : ''}{job.salary_max ? `–${(job.salary_max / 100000).toFixed(1)}L` : ''}</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button onClick={() => { setEditingJob(job); setJobForm({ title: job.title, description: job.description, location: job.location, department: job.department || '', job_type: job.job_type, salary_min: job.salary_min, salary_max: job.salary_max, requirements: job.requirements || '', status: job.status }); setIsAddingJob(true); }}
                                className="p-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-priority-blue/10 hover:text-priority-blue transition-colors">
                                <Edit3 size={14} />
                              </button>
                              <button onClick={() => handleDeleteJob(job.id)} className="p-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'applications' && (
                <motion.div key="apps" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="flex flex-wrap justify-between items-center bg-white p-5 rounded-2xl border border-gray-100 shadow-sm gap-3">
                    <div>
                      <h2 className="text-sm font-black text-gray-900 uppercase">Job Applications</h2>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">{applications.length} total</p>
                    </div>
                    <select className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-[10px] font-black uppercase outline-none"
                      value={appFilter} onChange={e => setAppFilter(e.target.value)}>
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="hired">Hired</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    {applications.filter(a => appFilter === 'all' || a.status === appFilter).length === 0 ? (
                      <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
                        <FileText size={32} className="mx-auto text-gray-200 mb-3" />
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">No applications yet</p>
                      </div>
                    ) : applications.filter(a => appFilter === 'all' || a.status === appFilter).map(app => (
                      <div key={app.id} className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-priority-blue/30 transition-all">
                        <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                          <div>
                            <p className="text-sm font-black text-gray-900">{app.applicant_name}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">{app.applicant_email}{app.applicant_phone ? ` · ${app.applicant_phone}` : ''}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5 font-bold uppercase">Applied for: {app.jobs?.title || '—'} &bull; {new Date(app.applied_at).toLocaleDateString('en-IN')}</p>
                          </div>
                          <select value={app.status}
                            onChange={e => handleUpdateAppStatus(app.id, e.target.value)}
                            className={`border rounded-xl px-3 py-1.5 text-[9px] font-black uppercase outline-none cursor-pointer ${app.status === 'pending' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : app.status === 'shortlisted' ? 'bg-blue-50 border-blue-200 text-blue-700' : app.status === 'hired' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
                            <option value="pending">Pending</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="hired">Hired</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                        {app.cover_letter && (
                          <p className="text-[11px] text-gray-600 bg-gray-50 rounded-xl p-3 line-clamp-2">{app.cover_letter}</p>
                        )}
                        {app.resume_url && (
                          <a href={app.resume_url} target="_blank" rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-priority-blue hover:underline">
                            <FileText size={12} /> View Resume
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'overview' && (
                <motion.div key="ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

                  {/* Stat cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Today's Orders", value: todayOrders.length, icon: ShoppingBag, color: 'bg-priority-blue', sub: 'placed today' },
                      { label: "Today's Revenue", value: `₹${todayRevenue.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'bg-emerald-500', sub: 'from today\'s orders' },
                      { label: 'Pending Actions', value: pendingActionCount, icon: Truck, color: 'bg-orange-500', sub: 'orders need attention' },
                      { label: 'Low Stock Items', value: lowStockProducts.length, icon: AlertTriangle, color: lowStockProducts.length > 0 ? 'bg-red-500' : 'bg-gray-400', sub: 'items running low' },
                    ].map(stat => (
                      <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center text-white mb-4`}>
                          <stat.icon size={18} />
                        </div>
                        <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">{stat.label}</p>
                        <p className="text-[9px] text-gray-300 font-bold uppercase mt-0.5">{stat.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Low stock alert */}
                  {lowStockProducts.length > 0 && (
                    <div className="bg-red-50 rounded-2xl border border-red-100 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={16} className="text-red-500" />
                          <h3 className="text-[11px] font-black uppercase tracking-widest text-red-700">
                            Low Stock — {lowStockProducts.length} item{lowStockProducts.length > 1 ? 's' : ''} need restocking
                          </h3>
                        </div>
                        <button
                          onClick={() => { setActiveTab('inventory'); setProductsPage(1); }}
                          className="text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 underline decoration-dotted"
                        >
                          Manage all →
                        </button>
                      </div>
                      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {lowStockProducts.map(p => (
                          <div key={p.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-red-50">
                            <div className="flex items-center gap-3 min-w-0">
                              <img src={(p as any).image || (p.images?.[0]) || ''} className="w-8 h-8 object-contain shrink-0" />
                              <span className="text-[11px] font-black text-gray-800 truncate">{p.name}</span>
                            </div>
                            <span className={`ml-3 shrink-0 text-[10px] font-black px-2.5 py-1 rounded-full ${p.stock === 0 ? 'bg-red-500 text-white' : 'bg-orange-100 text-orange-700'}`}>
                              {p.stock === 0 ? 'Out of Stock' : `${p.stock} left`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent orders */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-900 mb-5">Recent Orders</h3>
                    {orders.length === 0 ? (
                      <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest text-center py-8">No orders yet</p>
                    ) : (
                      <div className="space-y-0">
                        {orders.slice(0, 6).map(order => (
                          <div key={order.id} className="flex items-center justify-between gap-4 py-3.5 border-b border-gray-50 last:border-0">
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-black text-gray-900 truncate">{order.shipping_name}</p>
                              <p className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">#ORD-{order.id.slice(0, 8).toUpperCase()} · {new Date(order.created_at).toLocaleDateString('en-IN')}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-[12px] font-black text-gray-900">₹{Number(order.total).toLocaleString('en-IN')}</p>
                              <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${ORDER_STATUS_COLOR[order.status] ?? 'bg-gray-100 text-gray-600'}`}>{order.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'bulk' && <motion.div key="blk" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><BulkUpload /></motion.div>}

              {activeTab === 'banners' && (
                <motion.div key="banners" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 md:p-12 max-w-xl">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 bg-priority-blue/10 rounded-xl flex items-center justify-center text-priority-blue">
                        <ImageIcon size={20} />
                      </div>
                      <div>
                        <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight">Banner Settings</h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Premium Page Editorial</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-black text-priority-blue uppercase tracking-widest mb-2">
                          Section 2 — Editorial Banner
                        </label>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-4 leading-relaxed">
                          Choose which product category the "Shop Now" button on the editorial image links to. Update this whenever the banner image changes.
                        </p>

                        {/* Preview thumbnail */}
                        <div className="relative rounded-xl overflow-hidden mb-4 border border-gray-100" style={{ aspectRatio: '16/5' }}>
                          <img src="/Traworld/section 2.png" alt="Editorial banner" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-end justify-center pb-3">
                            <span className="border border-white text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5">
                              SHOP NOW → {editorialBanner.label.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">
                          Links to category:
                        </label>
                        <select
                          value={editorialBanner.category}
                          onChange={e => {
                            const opt = BANNER_OPTIONS.find(o => o.value === e.target.value);
                            if (opt) setEditorialBanner({ category: opt.value, label: opt.label, url: opt.url });
                          }}
                          className={inputCls}
                        >
                          {BANNER_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>

                        <p className="text-[9px] text-gray-300 font-bold uppercase tracking-widest mt-2">
                          Destination URL: {editorialBanner.url}
                        </p>
                      </div>

                      <button
                        onClick={saveEditorialBanner}
                        disabled={bannerSaving}
                        className="w-full bg-priority-blue text-white py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-priority-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {bannerSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        {bannerSaving ? 'Saving…' : 'Save Banner Setting'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'customers' && (
                <motion.div key="cust" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Registered Users <span className="text-gray-400 text-lg">({allUsers.length})</span></h2>
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        value={userSearch}
                        onChange={e => setUserSearch(e.target.value)}
                        placeholder="Search name or email..."
                        className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:border-priority-blue w-64"
                      />
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                      <thead className="border-b border-gray-100 bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Name</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Email</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 hidden md:table-cell">Phone</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 hidden lg:table-cell">Joined</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {allUsers
                          .filter(u => !userSearch || u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase()))
                          .map(u => (
                            <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-priority-blue/10 text-priority-blue flex items-center justify-center text-xs font-black">
                                    {(u.name || '?')[0].toUpperCase()}
                                  </div>
                                  <span className="text-sm font-bold text-gray-900">{u.name}</span>
                                  {u.role === 'admin' && <span className="text-[9px] font-black uppercase tracking-widest bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Admin</span>}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-xs font-bold text-gray-600">{u.email}</td>
                              <td className="px-6 py-4 text-xs font-bold text-gray-500 hidden md:table-cell">{u.phone || '—'}</td>
                              <td className="px-6 py-4 text-xs font-bold text-gray-400 hidden lg:table-cell">{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                              <td className="px-6 py-4">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${u.is_verified ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-600'}`}>
                                  {u.is_verified ? 'Verified' : 'Unverified'}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    {allUsers.length === 0 && (
                      <div className="text-center py-12 text-[11px] font-black uppercase tracking-widest text-gray-400">No users found</div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'coupons' && (
                <motion.div key="coupons" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Coupons & Offers</h2>
                    <button
                      onClick={() => setIsAddingCoupon(true)}
                      className="flex items-center gap-2 px-5 py-3 bg-black text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-colors"
                    >
                      <Plus size={14} /> New Coupon
                    </button>
                  </div>

                  {/* Create Coupon Form */}
                  <AnimatePresence>
                    {isAddingCoupon && (
                      <motion.form
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onSubmit={handleCreateCoupon}
                        className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm space-y-6"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-black uppercase tracking-tight">Create New Coupon</h3>
                          <button type="button" onClick={() => setIsAddingCoupon(false)}><X size={18} className="text-gray-400 hover:text-black" /></button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 text-gray-500">Coupon Code *</label>
                            <input
                              required
                              value={couponForm.code}
                              onChange={e => setCouponForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                              placeholder="e.g. LAUNCH20"
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-black/10"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 text-gray-500">Discount Type *</label>
                            <select
                              value={couponForm.discount_type}
                              onChange={e => setCouponForm(f => ({ ...f, discount_type: e.target.value as 'percentage' | 'fixed' }))}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black/10"
                            >
                              <option value="percentage">Percentage (%)</option>
                              <option value="fixed">Fixed Amount (₹)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 text-gray-500">
                              {couponForm.discount_type === 'percentage' ? 'Discount %' : 'Discount ₹'} *
                            </label>
                            <input
                              required type="number" min="1"
                              value={couponForm.discount_value}
                              onChange={e => setCouponForm(f => ({ ...f, discount_value: e.target.value }))}
                              placeholder={couponForm.discount_type === 'percentage' ? '20' : '100'}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black/10"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 text-gray-500">Max Uses (optional)</label>
                            <input
                              type="number" min="1"
                              value={couponForm.max_uses}
                              onChange={e => setCouponForm(f => ({ ...f, max_uses: e.target.value }))}
                              placeholder="Unlimited"
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black/10"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 text-gray-500">Min Cart Value ₹ (optional)</label>
                            <input
                              type="number" min="0"
                              value={couponForm.min_cart_value}
                              onChange={e => setCouponForm(f => ({ ...f, min_cart_value: e.target.value }))}
                              placeholder="No minimum"
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black/10"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 text-gray-500">Start Date (optional)</label>
                            <input
                              type="datetime-local"
                              value={couponForm.start_date}
                              onChange={e => setCouponForm(f => ({ ...f, start_date: e.target.value }))}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black/10"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 text-gray-500">End Date (optional)</label>
                            <input
                              type="datetime-local"
                              value={couponForm.end_date}
                              onChange={e => setCouponForm(f => ({ ...f, end_date: e.target.value }))}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black/10"
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          className="w-full py-4 bg-black text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                        >
                          <Check size={14} /> Create Coupon
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {/* Coupons List */}
                  {couponLoading ? (
                    <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-gray-400" /></div>
                  ) : coupons.length === 0 ? (
                    <div className="bg-white rounded-[2rem] border border-gray-100 p-12 text-center">
                      <Tag size={32} className="text-gray-300 mx-auto mb-3" />
                      <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">No coupons yet. Create your first offer!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {coupons.map((c: any) => (
                        <div key={c.id} className="bg-white border border-gray-100 rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                              <Tag size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-black uppercase tracking-widest text-gray-900">{c.code}</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                                {c.discount_type === 'percentage' ? `${c.discount_value}% off` : `₹${c.discount_value} off`}
                                {c.min_cart_value ? ` · Min ₹${c.min_cart_value}` : ''}
                                {c.max_uses ? ` · ${c.used_count}/${c.max_uses} used` : ` · ${c.used_count} used`}
                                {c.end_date ? ` · Expires ${new Date(c.end_date).toLocaleDateString('en-IN')}` : ''}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleCoupon(c.id, c.is_active)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${c.is_active ? 'bg-green-50 text-green-700 hover:bg-red-50 hover:text-red-600' : 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600'}`}
                          >
                            {c.is_active ? <><ToggleRight size={16} /> Active</> : <><ToggleLeft size={16} /> Inactive</>}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
};
