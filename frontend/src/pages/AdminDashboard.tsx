import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LogOut, Users,
  LayoutDashboard, Box,
  FileSpreadsheet, Image as ImageIcon,
  Briefcase, FileText, Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Product, Job, Application } from '../types';
import { api } from '../lib/api';
import { BulkUpload } from '../components/BulkUpload';
import { AdminOverview } from '../components/admin/AdminOverview';
import { AdminProducts, BLANK_FORM, ColorVariant } from '../components/admin/AdminProducts';
import { AdminOrders } from '../components/admin/AdminOrders';
import { AdminJobs } from '../components/admin/AdminJobs';
import { AdminBanners } from '../components/admin/AdminBanners';
import { AdminUsers } from '../components/admin/AdminUsers';
import { AdminCoupons } from '../components/admin/AdminCoupons';

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
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [ordersPage, setOrdersPage] = useState(1);
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkUpdating, setBulkUpdating] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Banner settings state
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
      api.getProducts({ limit: '999', include_inactive: 'true' }),
      api.getOrders({ limit: 500 }),
      api.getJobs({ status: 'all' }),
      api.getAllApplications(),
    ]);
    if (prodRes.status === 'fulfilled' && prodRes.value) {
      const raw = prodRes.value;
      const list = Array.isArray(raw?.products) ? raw.products : (Array.isArray(raw) ? raw : []);
      setProducts(list.map((p: any) => {
        try {
          const { mainCat, subCat } = resolveProductCategory(p);
          return {
            ...p,
            id: String(p.id),
            category: typeof p.category === 'string' ? p.category : mainCat,
            subcategory: p.subcategory || p.sub_category || subCat,
            sub_category: p.sub_category || p.subcategory || subCat,
          };
        } catch {
          return {
            ...p,
            id: String(p?.id || Math.random()),
            category: typeof p?.category === 'string' ? p.category : 'backpacks',
            subcategory: p?.sub_category || 'college-backpacks',
            sub_category: p?.sub_category || 'college-backpacks',
          };
        }
      }));
    }
    if (orderRes.status === 'fulfilled' && orderRes.value?.data) setOrders(orderRes.value.data);
    else setOrders([]);
    if (jobRes.status === 'fulfilled') setJobs(jobRes.value?.jobs || []);
    if (appRes.status === 'fulfilled') setApplications(appRes.value?.applications || []);
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
    { id: 'banners', label: 'Banners', icon: ImageIcon },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'customers', label: 'Users', icon: Users },
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
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shrink-0 whitespace-nowrap ${
                    activeTab === tab.id
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                    activeTab === tab.id
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
              {activeTab === 'overview' && (
                <AdminOverview
                  orders={orders}
                  products={products}
                  onNavigateTab={(tab) => { setActiveTab(tab); }}
                />
              )}

              {activeTab === 'inventory' && (
                <AdminProducts
                  products={products}
                  setProducts={setProducts}
                  fetchData={fetchData}
                  showToast={showToast}
                  fetchLoading={fetchLoading}
                  isAddingProduct={isAddingProduct}
                  setIsAddingProduct={setIsAddingProduct}
                  editingProduct={editingProduct}
                  setEditingProduct={setEditingProduct}
                  formData={formData}
                  setFormData={setFormData}
                  variants={variants}
                  setVariants={setVariants}
                  discountPercent={discountPercent}
                  setDiscountPercent={setDiscountPercent}
                />
              )}

              {activeTab === 'orders' && (
                <AdminOrders
                  orders={orders}
                  orderStatusFilter={orderStatusFilter}
                  setOrderStatusFilter={setOrderStatusFilter}
                  ordersPage={ordersPage}
                  setOrdersPage={setOrdersPage}
                  selectedOrderIds={selectedOrderIds}
                  setSelectedOrderIds={setSelectedOrderIds}
                  bulkStatus={bulkStatus}
                  setBulkStatus={setBulkStatus}
                  bulkUpdating={bulkUpdating}
                  handleBulkStatusUpdate={handleBulkStatusUpdate}
                  selectedOrder={selectedOrder}
                  setSelectedOrder={setSelectedOrder}
                  updateStatus={updateStatus}
                  printLabel={printLabel}
                />
              )}

              {activeTab === 'bulk' && (
                <motion.div key="blk" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <BulkUpload />
                </motion.div>
              )}

              {activeTab === 'banners' && (
                <AdminBanners
                  editorialBanner={editorialBanner}
                  setEditorialBanner={setEditorialBanner}
                  saveEditorialBanner={saveEditorialBanner}
                  bannerSaving={bannerSaving}
                />
              )}

              {activeTab === 'jobs' && (
                <AdminJobs
                  viewMode="jobs"
                  jobs={jobs}
                  applications={applications}
                  isAddingJob={isAddingJob}
                  setIsAddingJob={setIsAddingJob}
                  editingJob={editingJob}
                  setEditingJob={setEditingJob}
                  appFilter={appFilter}
                  setAppFilter={setAppFilter}
                  jobForm={jobForm}
                  setJobForm={setJobForm}
                  handleSaveJob={handleSaveJob}
                  handleDeleteJob={handleDeleteJob}
                  handleUpdateAppStatus={handleUpdateAppStatus}
                />
              )}

              {activeTab === 'applications' && (
                <AdminJobs
                  viewMode="applications"
                  jobs={jobs}
                  applications={applications}
                  isAddingJob={isAddingJob}
                  setIsAddingJob={setIsAddingJob}
                  editingJob={editingJob}
                  setEditingJob={setEditingJob}
                  appFilter={appFilter}
                  setAppFilter={setAppFilter}
                  jobForm={jobForm}
                  setJobForm={setJobForm}
                  handleSaveJob={handleSaveJob}
                  handleDeleteJob={handleDeleteJob}
                  handleUpdateAppStatus={handleUpdateAppStatus}
                />
              )}

              {activeTab === 'customers' && (
                <AdminUsers
                  allUsers={allUsers}
                  userSearch={userSearch}
                  setUserSearch={setUserSearch}
                />
              )}

              {activeTab === 'coupons' && (
                <AdminCoupons
                  coupons={coupons}
                  couponLoading={couponLoading}
                  isAddingCoupon={isAddingCoupon}
                  setIsAddingCoupon={setIsAddingCoupon}
                  couponForm={couponForm}
                  setCouponForm={setCouponForm}
                  handleCreateCoupon={handleCreateCoupon}
                  handleToggleCoupon={handleToggleCoupon}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
};
