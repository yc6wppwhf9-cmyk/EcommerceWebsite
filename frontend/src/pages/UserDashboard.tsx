import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package, Heart, MapPin, User, LogOut, ChevronRight, Lock, Mail, Phone, Loader2, X, ShoppingBag, Plus, Trash2, Edit3, Check, Star, RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { formatPrice } from '../constants/products';

const tabExit = { opacity: 0, y: -8 };
const tabEnter = { opacity: 0, y: 10 };
const tabVisible = { opacity: 1, y: 0 };

export const UserDashboard = () => {
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const { wishlist, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('settings');

  // Password change
  const [passForm, setPassForm] = useState({ current: '', new: '' });
  const [showPassForm, setShowPassForm] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'err'; text: string } | null>(null);

  // Orders
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [returningOrderId, setReturningOrderId] = useState<string | null>(null);
  const [returnReason, setReturnReason] = useState('');
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [returnMsgs, setReturnMsgs] = useState<Record<string, { type: 'success' | 'err'; text: string }>>({});

  // Addresses
  const BLANK_ADDRESS = { name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', is_default: false };
  const [addresses, setAddresses] = useState<any[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState(BLANK_ADDRESS);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressMsg, setAddressMsg] = useState<{ type: 'success' | 'err'; text: string } | null>(null);

  // Profile edit
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'err'; text: string } | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate('/login');
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (activeTab !== 'orders') return;
    setOrdersLoading(true);
    api.getOrders()
      .then((res) => setOrders(res.data ?? []))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'settings') return;
    setAddressesLoading(true);
    api.getAddresses()
      .then((data) => setAddresses(Array.isArray(data) ? data : []))
      .catch(() => setAddresses([]))
      .finally(() => setAddressesLoading(false));
  }, [activeTab]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressSaving(true);
    setAddressMsg(null);
    try {
      await api.addAddress(addressForm);
      const data = await api.getAddresses();
      setAddresses(Array.isArray(data) ? data : []);
      setAddressForm(BLANK_ADDRESS);
      setShowAddressForm(false);
      setAddressMsg({ type: 'success', text: 'Address saved!' });
      setTimeout(() => setAddressMsg(null), 3000);
    } catch (err: any) {
      setAddressMsg({ type: 'err', text: err.message || 'Failed to save address' });
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!window.confirm('Remove this address?')) return;
    try {
      await api.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete address');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      await api.updateMe({ name: profileForm.name, phone: profileForm.phone });
      setProfileMsg({ type: 'success', text: 'Profile updated!' });
      setEditingProfile(false);
      setTimeout(() => setProfileMsg(null), 3000);
    } catch (err: any) {
      setProfileMsg({ type: 'err', text: err.message || 'Update failed' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassLoading(true);
    setPassMsg(null);
    try {
      await api.changePassword({ currentPassword: passForm.current, newPassword: passForm.new });
      setPassMsg({ type: 'success', text: 'Password updated successfully!' });
      setPassForm({ current: '', new: '' });
      setTimeout(() => setShowPassForm(false), 2000);
    } catch (err: any) {
      setPassMsg({ type: 'err', text: err.message || 'Change failed' });
    } finally {
      setPassLoading(false);
    }
  };

  const handleRequestReturn = async (orderId: string) => {
    if (!returnReason.trim()) return;
    setReturnSubmitting(true);
    try {
      await api.requestReturn(orderId, returnReason.trim());
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'return_requested', return_reason: returnReason.trim() } : o));
      setReturnMsgs(prev => ({ ...prev, [orderId]: { type: 'success', text: 'Return requested! We will process it within 2–3 business days.' } }));
      setReturningOrderId(null);
      setReturnReason('');
    } catch (err: any) {
      setReturnMsgs(prev => ({ ...prev, [orderId]: { type: 'err', text: err.message || 'Failed to submit return request' } }));
    } finally {
      setReturnSubmitting(false);
    }
  };

  const handleCancelPass = () => {
    setShowPassForm(false);
    setPassForm({ current: '', new: '' });
    setPassMsg(null);
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : '2024';

  const navItems = [
    { id: 'settings', label: 'My Profile', icon: User },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
  ];

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-main)]">
        <Loader2 className="w-8 h-8 text-priority-blue animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-20 md:pt-24 pb-20 bg-[var(--color-bg-main)] transition-colors duration-300">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">

          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0">

            {/* Mobile */}
            <div className="lg:hidden mb-6">
              <div className="flex items-center gap-3 mb-4 px-1">
                <div className="w-10 h-10 rounded-full bg-priority-blue text-white flex items-center justify-center text-lg font-black font-outfit shadow-xl shrink-0">
                  {user.name?.charAt(0)}
                </div>
                <div>
                  <h1 className="text-base font-black font-outfit text-[var(--color-text-main)]">{user.name?.split(' ')[0]}</h1>
                  <p className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Member since {memberSince}</p>
                </div>
              </div>
              <div className="flex overflow-x-auto gap-2 pb-1 -mx-4 px-4 sm:-mx-6 sm:px-6">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black font-outfit tracking-widest uppercase whitespace-nowrap shrink-0 transition-all ${
                      activeTab === item.id
                        ? 'bg-priority-blue text-white shadow-md'
                        : 'text-[var(--color-text-muted)] bg-[var(--color-bg-card)] border border-[var(--color-border-main)]'
                    }`}
                  >
                    <item.icon size={14} />
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black font-outfit tracking-widest uppercase whitespace-nowrap shrink-0 text-red-500 bg-[var(--color-bg-card)] border border-[var(--color-border-main)] transition-all"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </div>

            {/* Desktop */}
            <div className="hidden lg:block lg:sticky lg:top-24 space-y-8">
              <div className="flex items-center gap-4 px-2">
                <div className="w-16 h-16 rounded-full bg-priority-blue text-white flex items-center justify-center text-2xl font-black font-outfit shadow-xl">
                  {user.name?.charAt(0)}
                </div>
                <div>
                  <h1 className="text-xl font-black font-outfit text-[var(--color-text-main)]">{user.name?.split(' ')[0]}</h1>
                  <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest leading-tight">Member since {memberSince}</p>
                </div>
              </div>
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black font-outfit tracking-widest uppercase transition-all ${
                      activeTab === item.id
                        ? 'bg-priority-blue text-white shadow-xl shadow-priority-blue/20'
                        : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-main)]'
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={logout}
                  className="flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black font-outfit tracking-widest uppercase text-red-500 hover:bg-red-50 transition-all mt-4"
                >
                  <LogOut size={18} /> Logout
                </button>
              </nav>
            </div>
          </aside>

          {/* Content */}
          <section className="flex-1 min-w-0">
            <AnimatePresence mode="wait">

              {/* Orders */}
              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={tabEnter}
                  animate={tabVisible}
                  exit={tabExit}
                  className="space-y-6 md:space-y-8"
                >
                  <div className="bg-[var(--color-bg-card)] p-5 sm:p-8 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-[var(--color-border-main)]">
                    <h3 className="text-xl md:text-2xl font-black font-outfit text-[var(--color-text-main)] mb-6 md:mb-8 uppercase tracking-tighter">Order History</h3>

                    {ordersLoading ? (
                      <div className="flex justify-center py-16">
                        <Loader2 className="w-8 h-8 text-priority-blue animate-spin" />
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="flex flex-col items-center py-16 gap-4 text-[var(--color-text-muted)]">
                        <ShoppingBag size={40} className="opacity-20" />
                        <p className="text-xs font-black uppercase tracking-widest">No orders yet</p>
                        <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-priority-blue border-b border-priority-blue">Start Shopping</Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => {
                          const canReturn = order.status === 'delivered' &&
                            Date.now() - new Date(order.updated_at).getTime() <= 7 * 24 * 60 * 60 * 1000;
                          const isReturning = returningOrderId === order.id;
                          const returnMsg = returnMsgs[order.id];
                          return (
                            <div key={order.id} className="p-5 sm:p-8 bg-[var(--color-bg-main)] rounded-2xl border border-[var(--color-border-main)] hover:border-priority-blue/30 transition-all group space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                                <div className="flex items-center gap-4 sm:gap-6">
                                  <div className="w-16 h-20 sm:w-20 sm:h-24 bg-[var(--color-bg-card)] rounded-2xl flex items-center justify-center border border-[var(--color-border-main)] p-2 shrink-0">
                                    <Package className="text-priority-blue opacity-40" size={28} />
                                  </div>
                                  <div>
                                    <p className="text-sm sm:text-base font-black font-outfit text-[var(--color-text-main)] mb-1 uppercase">
                                      {order.items?.length ?? 0} Item{(order.items?.length ?? 0) !== 1 ? 's' : ''}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-1">
                                      <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full capitalize ${
                                        order.status === 'return_requested' ? 'bg-orange-100 text-orange-600' :
                                        order.status === 'returned' ? 'bg-gray-100 text-gray-500' :
                                        'bg-priority-blue/10 text-priority-blue'
                                      }`}>{order.status?.replace('_', ' ') ?? 'Processing'}</span>
                                      <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">#{order.id?.slice(0, 8).toUpperCase()}</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
                                      {formatPrice(order.total ?? 0)} • {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN') : ''}
                                    </p>
                                    {order.return_reason && (
                                      <p className="text-[10px] font-bold text-orange-500 mt-1">Return: {order.return_reason}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
                                  {canReturn && !isReturning && (
                                    <button
                                      onClick={() => { setReturningOrderId(order.id); setReturnReason(''); }}
                                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-500 border border-orange-200 px-3 py-2 rounded-xl hover:bg-orange-50 transition-all"
                                    >
                                      <RotateCcw size={12} /> Request Return
                                    </button>
                                  )}
                                  <button
                                    onClick={() => navigate(`/orders/${order.id}`)}
                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-priority-blue group-hover:gap-4 transition-all"
                                  >
                                    View Details <ChevronRight size={14} />
                                  </button>
                                </div>
                              </div>

                              {returnMsg && (
                                <p className={`text-[10px] font-bold uppercase tracking-widest ${returnMsg.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                                  {returnMsg.text}
                                </p>
                              )}

                              {isReturning && (
                                <div className="pt-2 border-t border-[var(--color-border-main)] space-y-3">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Reason for Return *</p>
                                  <textarea
                                    value={returnReason}
                                    onChange={e => setReturnReason(e.target.value)}
                                    rows={3}
                                    placeholder="Please describe why you want to return this order…"
                                    className="w-full p-3 bg-[var(--color-bg-card)] border border-[var(--color-border-main)] rounded-xl text-sm font-bold font-outfit outline-none focus:border-priority-blue transition-colors text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)] resize-none"
                                  />
                                  <div className="flex gap-3">
                                    <button
                                      onClick={() => handleRequestReturn(order.id)}
                                      disabled={returnSubmitting || !returnReason.trim()}
                                      className="flex-1 py-3 bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-orange-600 transition-all"
                                    >
                                      {returnSubmitting ? <><Loader2 size={12} className="animate-spin" /> Submitting…</> : <><RotateCcw size={12} /> Submit Return</>}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => { setReturningOrderId(null); setReturnReason(''); }}
                                      className="px-5 py-3 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Wishlist */}
              {activeTab === 'wishlist' && (
                <motion.div
                  key="wishlist"
                  initial={tabEnter}
                  animate={tabVisible}
                  exit={tabExit}
                  className="bg-[var(--color-bg-card)] p-5 sm:p-8 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-[var(--color-border-main)]"
                >
                  <h3 className="text-xl md:text-2xl font-black font-outfit text-[var(--color-text-main)] mb-6 md:mb-8 uppercase tracking-tighter">
                    Wishlist {wishlist.length > 0 && <span className="text-priority-blue">({wishlist.length})</span>}
                  </h3>

                  {wishlist.length === 0 ? (
                    <div className="flex flex-col items-center py-16 gap-4 text-[var(--color-text-muted)]">
                      <Heart size={40} className="opacity-20" />
                      <p className="text-xs font-black uppercase tracking-widest">Your wishlist is empty</p>
                      <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-priority-blue border-b border-priority-blue">Browse Products</Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                      {wishlist.map((product) => (
                        <div key={product.id} className="flex gap-4 p-4 bg-[var(--color-bg-main)] rounded-2xl border border-[var(--color-border-main)] hover:border-priority-blue/30 transition-all group">
                          <Link to={`/product/${product.slug || product.id}`} className="w-20 h-20 bg-[var(--color-bg-card)] rounded-xl flex items-center justify-center border border-[var(--color-border-main)] p-2 shrink-0 overflow-hidden">
                            <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                          </Link>
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <Link to={`/product/${product.slug || product.id}`} className="text-xs font-black font-outfit text-[var(--color-text-main)] uppercase tracking-tight line-clamp-2 hover:text-priority-blue transition-colors">
                                {product.name}
                              </Link>
                              <p className="text-[10px] font-black text-priority-blue mt-1">{formatPrice(product.price)}</p>
                            </div>
                            <button
                              onClick={() => removeFromWishlist(product.id)}
                              className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors w-fit mt-2"
                            >
                              <X size={10} /> Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Profile / Settings */}
              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={tabEnter}
                  animate={tabVisible}
                  exit={tabExit}
                  className="space-y-6 md:space-y-8"
                >
                  {/* Profile */}
                  <div className="bg-[var(--color-bg-card)] p-5 sm:p-8 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-[var(--color-border-main)]">
                    <div className="flex items-center justify-between gap-3 mb-6 md:mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-priority-blue text-white rounded-xl flex items-center justify-center shrink-0">
                          <User size={20} />
                        </div>
                        <h3 className="text-lg md:text-xl font-black font-outfit text-[var(--color-text-main)] uppercase tracking-tight">Profile Details</h3>
                      </div>
                      {!editingProfile && (
                        <button
                          onClick={() => { setProfileForm({ name: user.name || '', phone: (user as any).phone || '' }); setEditingProfile(true); setProfileMsg(null); }}
                          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-priority-blue border border-priority-blue/30 px-4 py-2 rounded-xl hover:bg-priority-blue hover:text-white transition-all"
                        >
                          <Edit3 size={12} /> Edit
                        </button>
                      )}
                    </div>

                    {profileMsg && (
                      <p className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${profileMsg.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>{profileMsg.text}</p>
                    )}

                    {editingProfile ? (
                      <form onSubmit={handleSaveProfile} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-priority-blue tracking-widest">Full Name</label>
                            <div className="flex items-center gap-3 p-4 bg-[var(--color-bg-main)] rounded-2xl border border-priority-blue/40">
                              <User size={16} className="text-[var(--color-text-muted)] shrink-0" />
                              <input required type="text" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className="bg-transparent text-sm font-black font-outfit w-full outline-none text-[var(--color-text-main)]" />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-priority-blue tracking-widest">Mobile Number</label>
                            <div className="flex items-center gap-3 p-4 bg-[var(--color-bg-main)] rounded-2xl border border-priority-blue/40">
                              <Phone size={16} className="text-[var(--color-text-muted)] shrink-0" />
                              <input type="tel" maxLength={10} value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value.replace(/\D/g, '') })} placeholder="10-digit mobile" className="bg-transparent text-sm font-black font-outfit w-full outline-none text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)]" />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-priority-blue tracking-widest">Email Address</label>
                          <div className="flex items-center gap-3 p-4 bg-[var(--color-bg-main)] rounded-2xl border border-[var(--color-border-main)] opacity-60">
                            <Mail size={16} className="text-[var(--color-text-muted)] shrink-0" />
                            <input type="email" readOnly value={user.email} className="bg-transparent text-sm font-black font-outfit w-full outline-none text-[var(--color-text-main)]" />
                          </div>
                          <p className="text-[9px] text-[var(--color-text-muted)] ml-1 uppercase tracking-widest">Email cannot be changed</p>
                        </div>
                        <div className="flex gap-3 pt-2">
                          <button type="submit" disabled={profileSaving} className="flex-1 py-3.5 bg-priority-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2">
                            {profileSaving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Check size={14} /> Save Changes</>}
                          </button>
                          <button type="button" onClick={() => { setEditingProfile(false); setProfileMsg(null); }} className="px-6 py-3.5 bg-gray-100 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-priority-blue tracking-widest">Full Name</label>
                          <div className="flex items-center gap-3 p-4 bg-[var(--color-bg-main)] rounded-2xl border border-[var(--color-border-main)]">
                            <User size={16} className="text-[var(--color-text-muted)]" />
                            <span className="text-sm font-black font-outfit text-[var(--color-text-main)]">{user.name}</span>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-priority-blue tracking-widest">Email Address</label>
                          <div className="flex items-center gap-3 p-4 bg-[var(--color-bg-main)] rounded-2xl border border-[var(--color-border-main)]">
                            <Mail size={16} className="text-[var(--color-text-muted)]" />
                            <span className="text-sm font-black font-outfit text-[var(--color-text-main)]">{user.email}</span>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-priority-blue tracking-widest">Mobile Number</label>
                          <div className="flex items-center gap-3 p-4 bg-[var(--color-bg-main)] rounded-2xl border border-[var(--color-border-main)]">
                            <Phone size={16} className="text-[var(--color-text-muted)]" />
                            <span className="text-sm font-black font-outfit text-[var(--color-text-main)]">{(user as any).phone || <span className="text-[var(--color-text-muted)] font-medium">Not provided</span>}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Addresses */}
                  <div className="bg-[var(--color-bg-card)] p-5 sm:p-8 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-[var(--color-border-main)]">
                    <div className="flex justify-between items-center mb-6 md:mb-8 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-priority-blue text-white rounded-xl flex items-center justify-center shrink-0">
                          <MapPin size={20} />
                        </div>
                        <h3 className="text-lg md:text-xl font-black font-outfit text-[var(--color-text-main)] uppercase tracking-tight">Saved Addresses</h3>
                      </div>
                      {!showAddressForm && (
                        <button
                          onClick={() => { setShowAddressForm(true); setAddressMsg(null); }}
                          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-priority-blue border border-priority-blue/30 px-4 py-2 rounded-xl hover:bg-priority-blue hover:text-white transition-all shrink-0"
                        >
                          <Plus size={12} /> Add New
                        </button>
                      )}
                    </div>

                    {addressMsg && (
                      <p className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${addressMsg.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>{addressMsg.text}</p>
                    )}

                    {/* Add Address Form */}
                    <AnimatePresence>
                      {showAddressForm && (
                        <motion.form
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          onSubmit={handleAddAddress}
                          className="mb-6 p-5 sm:p-6 bg-[var(--color-bg-main)] rounded-2xl border border-priority-blue/20 space-y-4"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-priority-blue">New Address</p>
                            <button type="button" onClick={() => { setShowAddressForm(false); setAddressForm(BLANK_ADDRESS); setAddressMsg(null); }} className="text-gray-400 hover:text-red-500 transition-colors">
                              <X size={16} />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">Full Name *</label>
                              <input required type="text" value={addressForm.name} onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })} placeholder="Recipient name" className="w-full p-3 bg-[var(--color-bg-card)] border border-[var(--color-border-main)] rounded-xl text-sm font-bold font-outfit outline-none focus:border-priority-blue transition-colors text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)]" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">Phone *</label>
                              <input required type="tel" maxLength={10} value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value.replace(/\D/g, '') })} placeholder="10-digit mobile" className="w-full p-3 bg-[var(--color-bg-card)] border border-[var(--color-border-main)] rounded-xl text-sm font-bold font-outfit outline-none focus:border-priority-blue transition-colors text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)]" />
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                              <label className="text-[9px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">Address Line 1 *</label>
                              <input required type="text" value={addressForm.line1} onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })} placeholder="House / Flat no., Street" className="w-full p-3 bg-[var(--color-bg-card)] border border-[var(--color-border-main)] rounded-xl text-sm font-bold font-outfit outline-none focus:border-priority-blue transition-colors text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)]" />
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                              <label className="text-[9px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">Address Line 2 <span className="opacity-50">(optional)</span></label>
                              <input type="text" value={addressForm.line2} onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })} placeholder="Landmark, Area" className="w-full p-3 bg-[var(--color-bg-card)] border border-[var(--color-border-main)] rounded-xl text-sm font-bold font-outfit outline-none focus:border-priority-blue transition-colors text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)]" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">City *</label>
                              <input required type="text" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} placeholder="City" className="w-full p-3 bg-[var(--color-bg-card)] border border-[var(--color-border-main)] rounded-xl text-sm font-bold font-outfit outline-none focus:border-priority-blue transition-colors text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)]" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">State *</label>
                              <input required type="text" value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} placeholder="State" className="w-full p-3 bg-[var(--color-bg-card)] border border-[var(--color-border-main)] rounded-xl text-sm font-bold font-outfit outline-none focus:border-priority-blue transition-colors text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)]" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">Pincode *</label>
                              <input required type="text" maxLength={6} pattern="[0-9]{6}" value={addressForm.pincode} onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, '') })} placeholder="6-digit pincode" className="w-full p-3 bg-[var(--color-bg-card)] border border-[var(--color-border-main)] rounded-xl text-sm font-bold font-outfit outline-none focus:border-priority-blue transition-colors text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)]" />
                            </div>
                            <div className="flex items-center gap-3 sm:col-span-1 pt-1">
                              <input type="checkbox" id="is_default" checked={addressForm.is_default} onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })} className="w-4 h-4 accent-priority-blue rounded" />
                              <label htmlFor="is_default" className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest cursor-pointer">Set as Default</label>
                            </div>
                          </div>

                          <div className="flex gap-3 pt-2">
                            <button type="submit" disabled={addressSaving} className="flex-1 py-3.5 bg-priority-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2">
                              {addressSaving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Check size={14} /> Save Address</>}
                            </button>
                            <button type="button" onClick={() => { setShowAddressForm(false); setAddressForm(BLANK_ADDRESS); setAddressMsg(null); }} className="px-6 py-3.5 bg-gray-100 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                              Cancel
                            </button>
                          </div>
                        </motion.form>
                      )}
                    </AnimatePresence>

                    {/* Address List */}
                    {addressesLoading ? (
                      <div className="flex justify-center py-10">
                        <Loader2 className="w-6 h-6 text-priority-blue animate-spin" />
                      </div>
                    ) : addresses.length === 0 && !showAddressForm ? (
                      <div className="flex flex-col items-center py-10 gap-3 text-[var(--color-text-muted)]">
                        <MapPin size={32} className="opacity-20" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No addresses saved yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {addresses.map((addr) => (
                          <div key={addr.id} className={`relative p-4 sm:p-5 rounded-2xl border transition-all ${addr.is_default ? 'border-priority-blue/40 bg-priority-blue/5' : 'border-[var(--color-border-main)] bg-[var(--color-bg-main)]'}`}>
                            {addr.is_default && (
                              <span className="absolute top-3 right-3 flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-priority-blue bg-priority-blue/10 px-2 py-1 rounded-full">
                                <Star size={8} fill="currentColor" /> Default
                              </span>
                            )}
                            <p className="text-sm font-black font-outfit text-[var(--color-text-main)] mb-0.5">{addr.name}</p>
                            <p className="text-[11px] font-bold text-[var(--color-text-muted)]">
                              {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />
                              {addr.city}, {addr.state} — {addr.pincode}
                            </p>
                            <p className="text-[11px] font-bold text-[var(--color-text-muted)] mt-0.5">{addr.phone}</p>
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="mt-3 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={10} /> Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Security */}
                  <div className="bg-[var(--color-bg-card)] p-5 sm:p-8 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-[var(--color-border-main)]">
                    <div className="flex items-center gap-3 mb-6">
                      <Lock size={20} className="text-priority-blue" />
                      <h3 className="text-lg font-black font-outfit text-[var(--color-text-main)] uppercase tracking-widest">Security</h3>
                    </div>
                    {!showPassForm ? (
                      <button
                        onClick={() => setShowPassForm(true)}
                        className="w-full py-4 bg-priority-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-priority-blue/20"
                      >
                        Change Password
                      </button>
                    ) : (
                      <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Current Password</label>
                          <input
                            required
                            type="password"
                            value={passForm.current}
                            onChange={(e) => setPassForm({ ...passForm, current: e.target.value })}
                            className="w-full p-4 bg-[var(--color-bg-main)] border border-[var(--color-border-main)] rounded-2xl outline-none text-sm font-black font-outfit"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-500 ml-1">New Password</label>
                          <input
                            required
                            type="password"
                            minLength={8}
                            value={passForm.new}
                            onChange={(e) => setPassForm({ ...passForm, new: e.target.value })}
                            className="w-full p-4 bg-[var(--color-bg-main)] border border-[var(--color-border-main)] rounded-2xl outline-none text-sm font-black font-outfit"
                          />
                          <p className="text-[9px] text-[var(--color-text-muted)] ml-1 uppercase tracking-widest">Minimum 8 characters</p>
                        </div>
                        {passMsg && (
                          <p className={`text-[10px] font-bold uppercase tracking-widest text-center ${passMsg.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                            {passMsg.text}
                          </p>
                        )}
                        <div className="flex gap-4">
                          <button
                            type="submit"
                            disabled={passLoading}
                            className="flex-1 py-4 bg-priority-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {passLoading ? <><Loader2 size={14} className="animate-spin" /> Updating…</> : 'Update Password'}
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelPass}
                            className="px-6 py-4 bg-gray-100 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </section>
        </div>
      </div>
    </main>
  );
};
